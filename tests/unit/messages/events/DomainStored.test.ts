import { DomainStored } from '../../../../src/service/messages/events/DomainStored';
import { Domain } from '../../../../src/models/Domain';
import { IEvent } from 'driven-micro';

describe('DomainStored', () => {
  describe('constructor', () => {
    it('creates event with domain', () => {
      const domain = new Domain('test-job-123', { status: 'stored' });
      const event = new DomainStored(domain);
      
      expect(event.domain).toBe(domain);
    });
  });

  describe('inheritance', () => {
    it('extends IEvent', () => {
      const domain = new Domain('test-job-456');
      const event = new DomainStored(domain);
      
      // Test inheritance using instanceof
      expect(event).toBeInstanceOf(IEvent);
      expect(event).toBeInstanceOf(DomainStored);
      
      // Verify the event has the expected context format
      expect(event.context).toBe(`DomainStored: ${domain.external_job_id}`);
    });
  });
});
