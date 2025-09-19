import { injectable } from 'inversify';
import { IHandler } from 'driven-micro';
import { DomainActed } from '../../messages/events/DomainActed';
import { StoreCommand } from '../../messages/commands/StoreCommand';
import { Domain } from '../../../models/Domain';

/**
 * Handler for DomainActed events - triggers StoreCommand
 */
@injectable()
export class DomainActedHandler extends IHandler<DomainActed<Domain>> {
    constructor() {
        super();
    }

    protected async _handle(event: DomainActed<Domain>): Promise<void> {
        // Create concrete StoreCommand instance
        const storeCommand = new StoreCommand(event.domain);
        
        // Trigger the next command in the chain
        this.addMessages([storeCommand]);
    }
}
