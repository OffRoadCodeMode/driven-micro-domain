import { injectable, inject } from 'inversify';
import { IDomainRepo, IUnitOfWork } from 'driven-micro';
import { Domain } from '../../models/Domain';
import { TYPES } from '../../config/types';

// Concrete Unit of Work implementation for domain operations
@injectable()
export class DynamoDBUnitOfWork extends IUnitOfWork<Domain> {

    constructor(@inject(TYPES.DomainRepo) repo: IDomainRepo<Domain>) {
        super();
        this.repo = repo;
    }

    protected async _commit(): Promise<void> {
        try {
            console.log('DynamoDB operations committed (auto-commit)');
        } catch (error) {
            console.error('Failed to commit NoSQL operations:', error);
            throw error;
        }
    }

    protected async _rollback(): Promise<void> {
        try {
            console.warn('DynamoDB rollback requested (no-op for auto-commit operations)');
        } catch (error) {
            console.error('Failed to rollback NoSQL operations:', error);
            throw error;
        }
    }
}
