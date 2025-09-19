import { DynamoDBDomainRepository } from '../../../src/adapters/repos/DynamoDBDomainRepository';
import { Domain } from '../../../src/models/Domain';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

describe('DynamoDBDomainRepository Integration Tests', () => {
  let repository: DynamoDBDomainRepository;
  let testTableName: string;
  let ddbMock: any;
  
  // In-memory storage for mocked DynamoDB operations
  const mockStorage = new Map<string, any>();

  beforeAll(async () => {
    // Set up test environment
    testTableName = 'test-domain-table';
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
  });

  afterEach(() => {
    repository.closeDbSession();
  });

  afterAll(async () => {
    // Reset all mocks
    ddbMock.reset();
    mockStorage.clear();
  });

  describe('database session management', () => {
    it('initializes database session successfully', () => {
      const repo = new DynamoDBDomainRepository();
      expect(() => repo.setDbSession()).not.toThrow();
      repo.closeDbSession();
    });

    it('uses default table name when DOMAIN_TABLE_NAME is not set', () => {
      const originalValue = process.env.DOMAIN_TABLE_NAME;
      delete process.env.DOMAIN_TABLE_NAME;
      
      const repo = new DynamoDBDomainRepository();
      expect(repo['tableName']).toBe('domain-table'); // Default value
      
      process.env.DOMAIN_TABLE_NAME = originalValue; // Restore for other tests
    });

    it('throws error when operations attempted without session', async () => {
      const repo = new DynamoDBDomainRepository();
      const domain = new Domain('test-job-123');

      await expect(repo.add(domain)).rejects.toThrow(
        'Database session not initialized. Call setDbSession() first.'
      );
    });
  });

  describe('add operation', () => {
    it('successfully adds domain to DynamoDB', async () => {
      const domain = new Domain('test-job-add-001', { status: 'new' });

      await repository.add(domain);

      expect(repository.seen.has(domain)).toBe(true);
      
      // Verify it was actually stored
      const retrieved = await repository.get('test-job-add-001');
      expect(retrieved).toBeDefined();
      expect(retrieved!.external_job_id).toBe('test-job-add-001');
      expect(retrieved!.data.status).toBe('new');
    });

    it('adds domain with complex data structure', async () => {
      const complexData = {
        nested: { key: 'value' },
        array: [1, 2, 3],
        boolean: true,
        number: 42
      };
      const domain = new Domain('test-job-complex', complexData);

      await repository.add(domain);

      const retrieved = await repository.get('test-job-complex');
      expect(retrieved!.data).toEqual(complexData);
    });
  });

  describe('get operation', () => {
    beforeEach(async () => {
      // Add test data
      const domain = new Domain('test-job-get-001', { status: 'existing' });
      await repository.add(domain);
    });

    it('retrieves existing domain by external_job_id', async () => {
      const retrieved = await repository.get('test-job-get-001');

      expect(retrieved).toBeDefined();
      expect(retrieved!.external_job_id).toBe('test-job-get-001');
      expect(retrieved!.data.status).toBe('existing');
    });

    it('returns undefined for non-existent domain', async () => {
      const retrieved = await repository.get('non-existent-job');

      expect(retrieved).toBeUndefined();
    });

    it('reconstructs domain object correctly', async () => {
      const retrieved = await repository.get('test-job-get-001');

      expect(retrieved).toBeInstanceOf(Domain);
      expect(retrieved!.serialize).toBeDefined();
      expect(retrieved!.updateData).toBeDefined();
    });
  });

  describe('update operation', () => {
    beforeEach(async () => {
      // Add initial domain
      const domain = new Domain('test-job-update-001', { status: 'initial' });
      await repository.add(domain);
    });

    it('successfully updates existing domain', async () => {
      const domain = new Domain('test-job-update-001', { status: 'updated', processed: true });

      await repository.update(domain);

      const retrieved = await repository.get('test-job-update-001');
      expect(retrieved!.data.status).toBe('updated');
      expect(retrieved!.data.processed).toBe(true);
    });

    it('preserves external_job_id during update', async () => {
      const domain = new Domain('test-job-update-001', { newData: 'value' });

      await repository.update(domain);

      const retrieved = await repository.get('test-job-update-001');
      expect(retrieved!.external_job_id).toBe('test-job-update-001');
    });

    it('handles updates with empty data', async () => {
      const domain = new Domain('test-job-update-001', {});

      await repository.update(domain);

      const retrieved = await repository.get('test-job-update-001');
      expect(retrieved!.data).toEqual({});
    });
  });

  describe('error handling', () => {
    it('handles DynamoDB errors gracefully during add', async () => {
      // Mock PutCommand to throw an error
      ddbMock.on(PutCommand).rejects(new Error('DynamoDB connection error'));
      
      const domain = new Domain('test-job-error');
      await expect(repository.add(domain)).rejects.toThrow();
      
      // Restore normal mock behavior
      ddbMock.on(PutCommand).callsFake((params: any) => {
        const key = params.Item.external_job_id;
        mockStorage.set(key, params.Item);
        return Promise.resolve({});
      });
    });

    it('handles DynamoDB errors gracefully during get', async () => {
      // Mock GetCommand to throw an error
      ddbMock.on(GetCommand).rejects(new Error('DynamoDB connection error'));
      
      await expect(repository.get('test-job-error')).rejects.toThrow();
      
      // Restore normal mock behavior
      ddbMock.on(GetCommand).callsFake((params: any) => {
        const key = params.Key.external_job_id;
        const item = mockStorage.get(key);
        return Promise.resolve({ Item: item });
      });
    });

    it('handles DynamoDB errors gracefully during update', async () => {
      // Mock UpdateCommand to throw an error
      ddbMock.on(UpdateCommand).rejects(new Error('DynamoDB connection error'));
      
      const domain = new Domain('test-job-error');
      await expect(repository.update(domain)).rejects.toThrow();
      
      // Restore normal mock behavior
      ddbMock.on(UpdateCommand).callsFake((params: any) => {
        const key = params.Key.external_job_id;
        const existingItem = mockStorage.get(key) || {};
        
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

    it('throws error when operations attempted without session', async () => {
      const repo = new DynamoDBDomainRepository();
      const domain = new Domain('test-job-123');

      await expect(repo.add(domain)).rejects.toThrow(
        'Database session not initialized. Call setDbSession() first.'
      );
    });
  });
});

// Set timeout for integration tests
jest.setTimeout(30000);
