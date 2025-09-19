import { DomainFailed } from '../../../../src/service/messages/events/DomainFailed';
import { Domain } from '../../../../src/models/Domain';
import { IEvent } from 'driven-micro';

describe('DomainFailed', () => {
  describe('constructor', () => {
    it('creates event with domain and error', () => {
      const domain = new Domain('test-job-123', { status: 'failed' });
      const error = 'Processing failed due to invalid input';
      const event = new DomainFailed(domain, error);
      
      expect(event.domain).toBe(domain);
      expect(event.error).toBe(error);
    });
  });

  describe('inheritance', () => {
    it('extends IEvent', () => {
      const domain = new Domain('test-job-456');
      const event = new DomainFailed(domain, 'Test error');
      
      // Test inheritance using instanceof
      expect(event).toBeInstanceOf(IEvent);
      expect(event).toBeInstanceOf(DomainFailed);
      
      // Verify the event has the expected context format
      expect(event.context).toBe(`DomainFailed: ${domain.external_job_id}`);
      expect(event.error).toBe('Test error');
    });
  });
});
