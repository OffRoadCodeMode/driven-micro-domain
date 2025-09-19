import { ActCommandHandler } from '../../../../src/service/handlers/commands/ActCommandHandler';
import { ActCommand } from '../../../../src/service/messages/commands/ActCommand';
import { DomainActed } from '../../../../src/service/messages/events/DomainActed';
import { Domain } from '../../../../src/models/Domain';

describe('ActCommandHandler', () => {
  let handler: ActCommandHandler;

  beforeEach(() => {
    handler = new ActCommandHandler();
  });

  describe('handle', () => {
    it('emits DomainActed event with processed domain', async () => {
      const domain = new Domain('test-job-456', { original: 'data' });
      const command = new ActCommand(domain);

      const messages = await handler.handle(command);
      expect(messages).toHaveLength(1);
      expect(messages[0]).toBeInstanceOf(DomainActed);
      
      const event = messages[0] as DomainActed<Domain>;
      expect(event.domain).toBe(domain);
    });

    it('preserves existing domain data while adding processing metadata', async () => {
      const initialData = { 
        key1: 'value1', 
        key2: 42, 
        nested: { prop: 'test' } 
      };
      const domain = new Domain('test-job-789', initialData);
      const command = new ActCommand(domain);

      await handler.handle(command);

      expect(domain.data).toEqual({
        ...initialData,
        processed: true,
        processedAt: expect.any(String)
      });
    });

    it('handles domain with empty data', async () => {
      const domain = new Domain('test-job-empty');
      const command = new ActCommand(domain);

      await handler.handle(command);

      expect(domain.data).toEqual({
        processed: true,
        processedAt: expect.any(String)
      });
    });
  });
});
