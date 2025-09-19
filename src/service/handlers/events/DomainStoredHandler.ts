import { injectable } from 'inversify';
import { IHandler } from 'driven-micro';
import { DomainStored } from '../../messages/events/DomainStored';
import { Domain } from '../../../models/Domain';

/**
 * Handler for DomainStored events - completes the workflow
 */
@injectable()
export class DomainStoredHandler extends IHandler<DomainStored<Domain>> {
    constructor() {
        super();
    }

    protected async _handle(event: DomainStored<Domain>): Promise<void> {
        // Log completion
        console.log(`Domain workflow completed for external_job_id: ${event.domain.external_job_id}`);
        
        // Workflow complete - no more commands to trigger
    }
}
