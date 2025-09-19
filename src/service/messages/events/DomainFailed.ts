import { IEvent, IDomain } from 'driven-micro';

// Generic event for when an operation on a domain entity has failed
export class DomainFailed<T extends IDomain = IDomain> extends IEvent<T> {
    constructor(domain: T, error: string) {
        super(domain, error);
    }
}
