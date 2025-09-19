import { ICommand, IDomain } from 'driven-micro';

// Generic command for storing/persisting a domain entity
export class StoreCommand<T extends IDomain = IDomain> extends ICommand {
    constructor(public readonly domain: T) {
        super();
    }
}
