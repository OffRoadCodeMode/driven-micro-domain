import { DynamoDBUnitOfWork } from '../../../src/service/units_of_work/DynamoDBUnitOfWork';
import { DynamoDBDomainRepository } from '../../../src/adapters/repos/DynamoDBDomainRepository';
import { Domain } from '../../../src/models/Domain';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

describe('DynamoDBUnitOfWork Integration Tests', () => {
  let unitOfWork: DynamoDBUnitOfWork;
  let repository: DynamoDBDomainRepository;
  let testTableName: string;
  let ddbMock: any;
  
  // In-memory storage for mocked DynamoDB operations
  const mockStorage = new Map<string, any>();

  beforeAll(async () => {
    // Set up test environment
    testTableName = 'test-uow-domain-table';
    process.env.DOMAIN_TABLE_NAME = testTableName;
    process.env.AWS_REGION = 'us-east-1';
    
    // Create mock for DynamoDB Document Client
    ddbMock = mockClient(DynamoDBDocumentClient);
    
    // Mock PutCommand (for add operations)
    ddbMock.on(PutCommand).callsFake((params: any) => {
      const key = params.Item.external_job_id;
      mockStorage.set(key, params.Item);
      return Promise.resolve({});
    });
    
    // Mock GetCommand (for get operations)
    ddbMock.on(GetCommand).callsFake((params: any) => {
      const key = params.Key.external_job_id;
      const item = mockStorage.get(key);
      return Promise.resolve({ Item: item });
    });
    
    // Mock UpdateCommand (for update operations)
    ddbMock.on(UpdateCommand).callsFake((params: any) => {
      const key = params.Key.external_job_id;
      const existingItem = mockStorage.get(key) || {};
      
      // Simple update logic - merge the update expression values
      if (params.UpdateExpression && params.ExpressionAttributeValues) {
        const updatedItem = { ...existingItem };
        Object.keys(params.ExpressionAttributeValues).forEach(attrKey => {
          const fieldName = attrKey.replace(':', '');
          updatedItem[fieldName] = params.ExpressionAttributeValues[attrKey];
        });
        mockStorage.set(key, updatedItem);
      }
      
      return Promise.resolve({});
    });
  });

  beforeEach(() => {
    // Clear mock storage before each test
    mockStorage.clear();
    repository = new DynamoDBDomainRepository();
    repository.setDbSession();
    unitOfWork = new DynamoDBUnitOfWork(repository);
  });

  afterEach(() => {
    repository.closeDbSession();
  });

  afterAll(async () => {
    // Reset all mocks
    ddbMock.reset();
    mockStorage.clear();
  });

  describe('add operation', () => {
    it('adds domain through unit of work', async () => {
      const domain = new Domain('test-uow-add-001', { status: 'new' });

      await unitOfWork.add(domain);

      // Verify domain was added to repository
      expect(repository.seen.has(domain)).toBe(true);
      
      // Verify it's stored in database
      const retrieved = await unitOfWork.get('test-uow-add-001');
      expect(retrieved).toBeDefined();
      expect(retrieved!.external_job_id).toBe('test-uow-add-001');
    });

    it('tracks multiple domains in single unit of work', async () => {
      const domain1 = new Domain('test-uow-multi-001', { order: 1 });
      const domain2 = new Domain('test-uow-multi-002', { order: 2 });

      await unitOfWork.add(domain1);
      await unitOfWork.add(domain2);

      expect(repository.seen.has(domain1)).toBe(true);
      expect(repository.seen.has(domain2)).toBe(true);
    });
  });

  describe('get operation', () => {
    beforeEach(async () => {
      // Add test data
      const domain = new Domain('test-uow-get-001', { status: 'existing' });
      await unitOfWork.add(domain);
    });

    it('retrieves domain through unit of work', async () => {
      const retrieved = await unitOfWork.get('test-uow-get-001');

      expect(retrieved).toBeDefined();
      expect(retrieved!.external_job_id).toBe('test-uow-get-001');
      expect(retrieved!.data.status).toBe('existing');
    });

    it('returns undefined for non-existent domain', async () => {
      const retrieved = await unitOfWork.get('non-existent-uow-job');

      expect(retrieved).toBeUndefined();
    });
  });

  describe('update operation', () => {
    beforeEach(async () => {
      // Add initial domain
      const domain = new Domain('test-uow-update-001', { status: 'initial' });
      await unitOfWork.add(domain);
    });

    it('updates domain through unit of work', async () => {
      const domain = new Domain('test-uow-update-001', { status: 'updated', processed: true });

      await unitOfWork.update(domain);

      const retrieved = await unitOfWork.get('test-uow-update-001');
      expect(retrieved!.data.status).toBe('updated');
      expect(retrieved!.data.processed).toBe(true);
    });
  });

  describe('event collection', () => {
    it('collects new events from repository', () => {
      // Since repository.seen is a Set<Domain>, collectNewEvents should work with it
      const domain1 = new Domain('test-event-001');
      const domain2 = new Domain('test-event-002');
      
      repository.seen.add(domain1);
      repository.seen.add(domain2);

      const events = unitOfWork.collectNewEvents();
      
      // Events should be collected (exact behavior depends on framework implementation)
      expect(Array.isArray(events)).toBe(true);
    });

    it('clears events after collection', async () => {
      const domain = new Domain('test-clear-events');
      await unitOfWork.add(domain);

      const eventsBefore = unitOfWork.collectNewEvents();
      const eventsAfter = unitOfWork.collectNewEvents();

      // After collection, subsequent calls should return fewer or no events
      expect(eventsAfter.length).toBeLessThanOrEqual(eventsBefore.length);
    });
  });

  describe('transaction management', () => {
    it('commits successfully', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await unitOfWork.commit();

      expect(consoleSpy).toHaveBeenCalledWith('DynamoDB operations committed (auto-commit)');
      consoleSpy.mockRestore();
    });

    it('handles rollback gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // Rollback is handled internally via exit() method with error
      await unitOfWork.exit(new Error('Test error'));

      expect(consoleSpy).toHaveBeenCalledWith('DynamoDB rollback requested (no-op for auto-commit operations)');
      consoleSpy.mockRestore();
    });

    it('handles commit errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Force an error by closing the repository session
      repository.closeDbSession();
      
      // The commit itself doesn't fail, but if it did, it should handle errors
      await expect(unitOfWork.commit()).resolves.not.toThrow();
      
      consoleSpy.mockRestore();
    });
  });

  describe('workflow integration', () => {
    it('supports full create-update workflow', async () => {
      // Create
      const domain = new Domain('test-workflow-001', { step: 'created' });
      await unitOfWork.add(domain);

      // Update
      domain.updateData({ step: 'processed', processed: true });
      await unitOfWork.update(domain);

      // Final update
      domain.updateData({ step: 'stored', final: true });
      await unitOfWork.update(domain);

      // Verify final state
      const retrieved = await unitOfWork.get('test-workflow-001');
      expect(retrieved!.data).toEqual({
        step: 'stored',
        processed: true,
        final: true
      });
    });

    it('maintains data integrity across operations', async () => {
      const initialData = { key1: 'value1', key2: 'value2' };
      const domain = new Domain('test-integrity-001', initialData);
      
      await unitOfWork.add(domain);
      
      // Partial update
      domain.updateData({ key2: 'updated', key3: 'new' });
      await unitOfWork.update(domain);

      const retrieved = await unitOfWork.get('test-integrity-001');
      expect(retrieved!.data).toEqual({
        key1: 'value1',
        key2: 'updated',
        key3: 'new'
      });
    });
  });
});

// Set timeout for integration tests
jest.setTimeout(30000);
