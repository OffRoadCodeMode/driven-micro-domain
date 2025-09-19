import { DomainStoredHandler } from '../../../../src/service/handlers/events/DomainStoredHandler';
import { DomainStored } from '../../../../src/service/messages/events/DomainStored';
import { Domain } from '../../../../src/models/Domain';

describe('DomainStoredHandler', () => {
  let handler: DomainStoredHandler;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    handler = new DomainStoredHandler();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('handle', () => {
    it('logs workflow completion with external_job_id', async () => {
      const domain = new Domain('test-job-123', { status: 'stored' });
      const event = new DomainStored(domain);

      await handler.handle(event);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Domain workflow completed for external_job_id: test-job-123'
      );
    });
  });
});
