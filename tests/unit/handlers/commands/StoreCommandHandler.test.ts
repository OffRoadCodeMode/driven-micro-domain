import { StoreCommandHandler } from '../../../../src/service/handlers/commands/StoreCommandHandler';
import { StoreCommand } from '../../../../src/service/messages/commands/StoreCommand';
import { DomainStored } from '../../../../src/service/messages/events/DomainStored';
import { Domain } from '../../../../src/models/Domain';
import { IUnitOfWork } from 'driven-micro';

describe('StoreCommandHandler', () => {
  let handler: StoreCommandHandler;
  let mockUow: jest.Mocked<IUnitOfWork>;

  beforeEach(() => {
    mockUow = {
      add: jest.fn(),
      get: jest.fn(),
      update: jest.fn(),
      commit: jest.fn(),
      enter: jest.fn(),
      exit: jest.fn(),
      collectNewEvents: jest.fn().mockReturnValue([]),
    } as any;

    handler = new StoreCommandHandler(mockUow);
  });

  describe('handle', () => {
    it('updates domain in unit of work', async () => {
      const domain = new Domain('test-job-123', { processed: true });
      const command = new StoreCommand(domain);

      await handler.handle(command);

      expect(mockUow.update).toHaveBeenCalledWith(domain);
    });

    it('emits DomainStored event with stored domain', async () => {
      const domain = new Domain('test-job-456', { status: 'processed' });
      const command = new StoreCommand(domain);

      const messages = await handler.handle(command);
      expect(messages).toHaveLength(1);
      expect(messages[0]).toBeInstanceOf(DomainStored);
      
      const event = messages[0] as DomainStored<Domain>;
      expect(event.domain).toBe(domain);
    });

    it('stores domain with all accumulated data', async () => {
      const domain = new Domain('test-job-789');
      domain.updateData({ step1: 'complete' });
      domain.updateData({ step2: 'complete', processed: true });
      
      const command = new StoreCommand(domain);

      await handler.handle(command);

      expect(mockUow.update).toHaveBeenCalledWith(
        expect.objectContaining({
          external_job_id: 'test-job-789',
          data: {
            step1: 'complete',
            step2: 'complete',
            processed: true
          }
        })
      );
    });
  });
});
