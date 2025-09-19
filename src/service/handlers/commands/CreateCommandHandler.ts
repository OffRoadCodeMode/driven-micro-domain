import { injectable, inject } from 'inversify';
import { IHandler, IUnitOfWork } from 'driven-micro';
import { CreateCommand } from '../../messages/commands/CreateCommand';
import { DomainCreated } from '../../messages/events/DomainCreated';
import { Domain } from '../../../models/Domain';
import { TYPES } from '../../../config/types';

/**
 * Handler for CreateCommand - creates new domain entities
 */
@injectable()
export class CreateCommandHandler extends IHandler<CreateCommand<Domain>> {
    constructor(
        @inject(TYPES.UnitOfWork) protected uow: IUnitOfWork
    ) {
        super();
    }

    protected async _handle(command: CreateCommand<Domain>): Promise<void> {
        // Create the domain entity from the request
        const domain = new Domain(command.external_job_id, command.request.serialize());

        // Save to repository
        await this.uow.add(domain);
        
        // Add DomainCreated event
        this.addMessages([new DomainCreated(domain)]);
    }
}
