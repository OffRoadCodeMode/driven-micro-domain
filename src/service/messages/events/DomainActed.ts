import { IEvent, IDomain } from 'driven-micro';

// Generic event for when a domain entity has been acted upon
export class DomainActed<T extends IDomain = IDomain> extends IEvent<T> {
    constructor(domain: T) {
        super(domain);
    }
}
