import { injectable } from 'inversify';
import { IHandler } from 'driven-micro';
import { ActCommand } from '../../messages/commands/ActCommand';
import { DomainActed } from '../../messages/events/DomainActed';
import { Domain } from '../../../models/Domain';
/**
 * Handler for ActCommand - performs business logic on domain entities
 */
@injectable()
export class ActCommandHandler extends IHandler<ActCommand<Domain>> {
    protected async _handle(command: ActCommand<Domain>): Promise<void> {
        const domain = command.domain;
        //do some logic on the domain model, just a placeholder below
        //add methods to your domain aggregate to perform business logic
        domain.updateData({
            processed: true, 
            processedAt: new Date().toISOString() 
        });
        this.addMessages([new DomainActed(domain)]);
    }
}
