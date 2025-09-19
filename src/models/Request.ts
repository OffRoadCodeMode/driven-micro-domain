import { IMicroServiceRequest } from 'driven-micro';

/**
 * Microservice request implementation
 */
export class Request implements IMicroServiceRequest {
    constructor(
        public readonly external_job_id: string
    ) {}

    serialize(): Record<string, any> {
        return {
            external_job_id: this.external_job_id
        };
    }

    static validate(input: Record<string, any>): string[] {
        const errors: string[] = [];

        if (!input.external_job_id || typeof input.external_job_id !== 'string') {
            errors.push('external_job_id is required and must be a string');
        }

        return errors;
    }

    static async create(input: Record<string, any>): Promise<Request> {
        const errors = Request.validate(input);
        if (errors.length > 0) {
            throw new Error(`Validation failed: ${errors.join(', ')}`);
        }

        return new Request(input.external_job_id);
    }
}
