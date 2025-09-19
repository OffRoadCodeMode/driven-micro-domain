import { injectable, inject } from 'inversify';
import { IHandler, IUnitOfWork } from 'driven-micro';
import { StoreCommand } from '../../messages/commands/StoreCommand';
import { DomainStored } from '../../messages/events/DomainStored';
import { Domain } from '../../../models/Domain';
import { TYPES } from '../../../config/types';


@injectable()
export class StoreCommandHandler extends IHandler<StoreCommand<Domain>> {
    constructor(
        @inject(TYPES.UnitOfWork) protected uow: IUnitOfWork
    ) {
        super();
    }

    protected async _handle(command: StoreCommand<Domain>): Promise<void> {
        
        const domain = command.domain;
        
        // Update final state in repository
        await this.uow.update(domain);
        
        // Add DomainStored event
        this.addMessages([new DomainStored(domain)]);
    }
}
