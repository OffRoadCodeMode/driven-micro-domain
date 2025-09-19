import { ICommand, IDomain } from 'driven-micro';

// Generic command for performing business logic on a domain entity
export class ActCommand<T extends IDomain = IDomain> extends ICommand {
    constructor(public readonly domain: T) {
        super();
    }

}
