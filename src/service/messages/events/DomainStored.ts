import { IEvent, IDomain } from 'driven-micro';

// Generic event for when a domain entity has been stored/persisted
export class DomainStored<T extends IDomain = IDomain> extends IEvent<T> {
    constructor(domain: T) {
        super(domain);
    }
}
