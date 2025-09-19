import { DomainCreatedHandler } from '../../../../src/service/handlers/events/DomainCreatedHandler';
import { DomainCreated } from '../../../../src/service/messages/events/DomainCreated';
import { ActCommand } from '../../../../src/service/messages/commands/ActCommand';
import { Domain } from '../../../../src/models/Domain';

describe('DomainCreatedHandler', () => {
  let handler: DomainCreatedHandler;

  beforeEach(() => {
    handler = new DomainCreatedHandler();
  });

  describe('handle', () => {
    it('creates ActCommand from domain in event', async () => {
      const domain = new Domain('test-job-123', { status: 'created' });
      const event = new DomainCreated(domain);

      const messages = await handler.handle(event);
      expect(messages).toHaveLength(1);
      expect(messages[0]).toBeInstanceOf(ActCommand);
      
      const command = messages[0] as ActCommand<Domain>;
      expect(command.domain).toBe(domain);
    });
  });
});
