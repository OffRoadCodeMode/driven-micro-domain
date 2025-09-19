import { ICommand, IDomain, IMicroServiceRequest } from 'driven-micro';

// Generic command for creating/initializing a domain entity
export class CreateCommand<T extends IDomain = IDomain> extends ICommand {
    constructor(
        public readonly request: IMicroServiceRequest
    ) {
        super();
    }

    // Convenience getter for external_job_id
    get external_job_id(): string {
        return this.request.external_job_id;
    }
}
