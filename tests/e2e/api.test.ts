import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { createApiEntryPoint } from 'driven-micro';
import bootstrapFunction from '../../bootstrap';
import { Request } from '../../src/models/Request';
import { CreateCommand } from '../../src/service/messages/commands/CreateCommand';
import { Hono } from 'hono';

describe('API E2E Tests', () => {
  let app: Hono;
  let ddbMock: any;
  
  // In-memory storage for mocked DynamoDB operations
  const mockStorage = new Map<string, any>();

  beforeAll(async () => {
    // Set up test environment
    process.env.DOMAIN_TABLE_NAME = 'test-e2e-domain-table';
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

    // Initialize the framework and create API app
    const messageBus = bootstrapFunction();

    app = createApiEntryPoint({
      messageBus,
      requestConstructor: Request,
      createCommand: (request: Request) => new CreateCommand(request),
      basePath: '/run'
    });
  });

  afterAll(async () => {
    // Reset all mocks and clear storage
    ddbMock.reset();
    mockStorage.clear();
  });

  describe('POST /run', () => {
    it('successfully processes valid request', async () => {
      const response = await app.request('/run', {
        method: 'POST',
        body: JSON.stringify({ external_job_id: 'e2e-test-job-001' }),
        headers: new Headers({ 'Content-Type': 'application/json' })
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty('external_job_id', 'e2e-test-job-001');
      expect(body).toHaveProperty('status', 'completed');
    });

    it('returns 400 for missing external_job_id', async () => {
      const response = await app.request('/run', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: new Headers({ 'Content-Type': 'application/json' })
      });

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body).toHaveProperty('error');
    });

    it('returns 400 for invalid external_job_id type', async () => {
      const response = await app.request('/run', {
        method: 'POST',
        body: JSON.stringify({ external_job_id: 12345 }),
        headers: new Headers({ 'Content-Type': 'application/json' })
      });

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body).toHaveProperty('error');
    });
  });

  describe('Health check', () => {
    it('responds to health check endpoint', async () => {
      const response = await app.request('/health');
      
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty('status', 'healthy');
      expect(body).toHaveProperty('timestamp');
    });
  });

  describe('Error handling', () => {
    it('returns 404 for non-existent endpoints', async () => {
      const response = await app.request('/non-existent-endpoint');
      expect(response.status).toBe(404);
    });
  });
});
