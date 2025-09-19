import { DomainActed } from '../../../../src/service/messages/events/DomainActed';
import { Domain } from '../../../../src/models/Domain';
import { IEvent } from 'driven-micro';

describe('DomainActed', () => {
  describe('constructor', () => {
    it('creates event with domain', () => {
      const domain = new Domain('test-job-123', { status: 'processed' });
      const event = new DomainActed(domain);
      
      expect(event.domain).toBe(domain);
    });
  });

  describe('inheritance', () => {
    it('extends IEvent', () => {
      const domain = new Domain('test-job-456');
      const event = new DomainActed(domain);
      
      // Test inheritance using instanceof
      expect(event).toBeInstanceOf(IEvent);
      expect(event).toBeInstanceOf(DomainActed);
      
      // Verify the event has the expected context format
      expect(event.context).toBe(`DomainActed: ${domain.external_job_id}`);
    });
  });
});
