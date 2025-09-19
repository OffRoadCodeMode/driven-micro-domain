import { DomainCreated } from '../../../../src/service/messages/events/DomainCreated';
import { Domain } from '../../../../src/models/Domain';
import { IEvent } from 'driven-micro';

describe('DomainCreated', () => {
  describe('constructor', () => {
    it('creates event with domain', () => {
      const domain = new Domain('test-job-123', { status: 'created' });
      const event = new DomainCreated(domain);
      
      expect(event.domain).toBe(domain);
    });
  });

  describe('inheritance', () => {
    it('extends IEvent', () => {
      const domain = new Domain('test-job-456');
      const event = new DomainCreated(domain);
      
      // Test inheritance using instanceof
      expect(event).toBeInstanceOf(IEvent);
      expect(event).toBeInstanceOf(DomainCreated);
      
      // Verify the event has the expected context format
      expect(event.context).toBe(`DomainCreated: ${domain.external_job_id}`);
    });
  });
});
