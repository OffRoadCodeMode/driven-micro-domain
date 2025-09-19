import { injectable } from 'inversify';
import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { IDomainRepo } from 'driven-micro';
import { Domain } from '../../models/Domain';

// DynamoDB implementation for Domain repository
@injectable()
export class DynamoDBDomainRepository implements IDomainRepo<Domain> {
    public seen: Set<Domain> = new Set();
    protected client: DynamoDBDocumentClient | null = null;
    protected readonly tableName: string;

    constructor() {
        this.tableName = process.env.DOMAIN_TABLE_NAME || 'domain-table';
    }

    // Initialize database session with LocalStack support
    setDbSession(): void {
        const clientConfig: DynamoDBClientConfig = {
            region: (process.env.AWS_REGION || 'eu-west-2').trim()
        };

        // Configure for LocalStack only if AWS_ENDPOINT_URL is explicitly set
        // This indicates local development environment
        const customEndpoint = process.env.AWS_ENDPOINT_URL;
        if (customEndpoint) {
            clientConfig.endpoint = customEndpoint;
            clientConfig.credentials = {
                accessKeyId: 'test',
                secretAccessKey: 'test'
            };
        }
        // In production, AWS SDK will use default credential chain (IAM roles, etc.)

        const dynamoClient = new DynamoDBClient(clientConfig);
        
        // Configure the DynamoDBDocumentClient with marshalling options
        this.client = DynamoDBDocumentClient.from(dynamoClient, {
            marshallOptions: {
                removeUndefinedValues: true,
                convertEmptyValues: true
            }
        });
    }

    // Close database session
    closeDbSession(): void {
        this.client = null;
    }

    // Add domain entity to repository
    async add(domain: Domain): Promise<void> {
        if (!this.client) {
            throw new Error('Database session not initialized. Call setDbSession() first.');
        }

        try {

            const command = new PutCommand({
                TableName: this.tableName,
                Item: {
                    external_job_id: domain.external_job_id,
                    data: domain.data,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            });
            await this.client.send(command);
            this.seen.add(domain);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error(`Error adding domain ${domain.external_job_id}: ${errorMessage}`);
            throw error;
        }
    }

    // Get domain entity by external_job_id
    async get(external_job_id: string): Promise<Domain | undefined> {
        if (!this.client) {
            throw new Error('Database session not initialized. Call setDbSession() first.');
        }

        try {
            const command = new GetCommand({
                TableName: this.tableName,
                Key: {
                    external_job_id: external_job_id
                }
            });

            const response = await this.client.send(command);
            
            if (!response.Item) {
                return undefined;
            }

            // Reconstruct Domain object from DynamoDB item
            return this._reconstructDomain(response.Item);
        } catch (error) {
            console.error('Error querying domain from DynamoDB:', error);
            throw error;
        }
    }

    // Update domain entity in repository
    async update(domain: Domain): Promise<void> {
        if (!this.client) {
            throw new Error('Database session not initialized. Call setDbSession() first.');
        }

        try {
            // Update both data and timestamp
            const command = new UpdateCommand({
                TableName: this.tableName,
                Key: {
                    external_job_id: domain.external_job_id
                },
                UpdateExpression: 'SET #data = :data, updated_at = :updated_at',
                ExpressionAttributeNames: {
                    '#data': 'data'
                },
                ExpressionAttributeValues: {
                    ':data': domain.data,
                    ':updated_at': new Date().toISOString()
                }
            });

            await this.client.send(command);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error(`Error updating domain ${domain.external_job_id}: ${errorMessage}`);
            throw error;
        }
    }

    // Reconstruct Domain object from DynamoDB item
    private _reconstructDomain(item: any): Domain {
        const domain = new Domain(item.external_job_id, item.data || {});
        return domain;
    }
}
