import { DomainActedHandler } from '../../../../src/service/handlers/events/DomainActedHandler';
import { DomainActed } from '../../../../src/service/messages/events/DomainActed';
import { StoreCommand } from '../../../../src/service/messages/commands/StoreCommand';
import { Domain } from '../../../../src/models/Domain';

describe('DomainActedHandler', () => {
  let handler: DomainActedHandler;

  beforeEach(() => {
    handler = new DomainActedHandler();
  });

  describe('handle', () => {
    it('creates StoreCommand from domain in event', async () => {
      const domain = new Domain('test-job-123', { processed: true });
      const event = new DomainActed(domain);

      const messages = await handler.handle(event);
      expect(messages).toHaveLength(1);
      expect(messages[0]).toBeInstanceOf(StoreCommand);
      
      const command = messages[0] as StoreCommand<Domain>;
      expect(command.domain).toBe(domain);
    });
  });
});
