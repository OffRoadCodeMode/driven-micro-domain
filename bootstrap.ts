import { Container } from 'inversify';
import { bootstrap, FrameworkConfig } from 'driven-micro';
import { TYPES } from './src/config/types';
import { CreateCommand } from './src/service/messages/commands/CreateCommand';
import { ActCommand } from './src/service/messages/commands/ActCommand';
import { StoreCommand } from './src/service/messages/commands/StoreCommand';
import { DomainCreated } from './src/service/messages/events/DomainCreated';
import { DomainActed } from './src/service/messages/events/DomainActed';
import { DomainStored } from './src/service/messages/events/DomainStored';
import { CreateCommandHandler } from './src/service/handlers/commands/CreateCommandHandler';
import { ActCommandHandler } from './src/service/handlers/commands/ActCommandHandler';
import { StoreCommandHandler } from './src/service/handlers/commands/StoreCommandHandler';
import { DomainCreatedHandler } from './src/service/handlers/events/DomainCreatedHandler';
import { DomainActedHandler } from './src/service/handlers/events/DomainActedHandler';
import { DomainStoredHandler } from './src/service/handlers/events/DomainStoredHandler';
import { DynamoDBUnitOfWork } from './src/service/units_of_work/DynamoDBUnitOfWork';
import { DynamoDBDomainRepository } from './src/adapters/repos/DynamoDBDomainRepository';

// Bootstrap configuration for complete command/event workflow chain
const config: FrameworkConfig = {
    commandHandlers: new Map<string, any>([
        [CreateCommand.name, CreateCommandHandler],
        [ActCommand.name, ActCommandHandler],
        [StoreCommand.name, StoreCommandHandler],
    ]),
    
    eventHandlers: new Map<string, any>([
        [DomainCreated.name, DomainCreatedHandler],
        [DomainActed.name, DomainActedHandler],
        [DomainStored.name, DomainStoredHandler],
    ]),
    
    dependencies: (container: Container) => {
        container.bind(TYPES.DomainRepo).to(DynamoDBDomainRepository);
        container.bind(TYPES.UnitOfWork).to(DynamoDBUnitOfWork);
    }
};

// Initialize the framework
const messageBus = bootstrap(config);

// Export bootstrap function for entry points
export { bootstrap };
export default function() {
    return messageBus;
}
