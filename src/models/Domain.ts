import { IDomain } from 'driven-micro';

// Domain implementation for the framework
export class Domain extends IDomain {

    constructor(external_job_id: string, data?: Record<string, any>) {
        super(external_job_id, data);
    }

    serialize(): Record<string, any> {
        return {
            external_job_id: this.external_job_id,
            data: this.data,
            timestamp: new Date().toISOString()
        };
    }

    updateData(data: Record<string, any>): void {
        this.data = { ...this.data, ...data };
    }
}
