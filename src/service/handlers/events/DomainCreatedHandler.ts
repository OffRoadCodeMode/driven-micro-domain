import { injectable } from 'inversify';
import { IHandler } from 'driven-micro';
import { DomainCreated } from '../../messages/events/DomainCreated';
import { ActCommand } from '../../messages/commands/ActCommand';
import { Domain } from '../../../models/Domain';

/**
 * Handler for DomainCreated events - triggers ActCommand
 */
@injectable()
export class DomainCreatedHandler extends IHandler<DomainCreated<Domain>> {
    constructor() {
        super();
    }

    protected async _handle(event: DomainCreated<Domain>): Promise<void> {
        // Create concrete ActCommand instance
        const actCommand = new ActCommand(event.domain);
        
        // Trigger the next command in the chain
        this.addMessages([actCommand]);
    }
}
