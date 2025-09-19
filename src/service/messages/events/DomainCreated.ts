import { IEvent, IDomain } from 'driven-micro';

// Generic event for when a domain entity has been created
export class DomainCreated<T extends IDomain = IDomain> extends IEvent<T> {
    constructor(domain: T) {
        super(domain);
    }
}
