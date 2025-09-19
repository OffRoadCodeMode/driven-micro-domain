import { CreateCommandHandler } from '../../../../src/service/handlers/commands/CreateCommandHandler';
import { CreateCommand } from '../../../../src/service/messages/commands/CreateCommand';
import { DomainCreated } from '../../../../src/service/messages/events/DomainCreated';
import { Request } from '../../../../src/models/Request';
import { Domain } from '../../../../src/models/Domain';
import { IUnitOfWork } from 'driven-micro';

describe('CreateCommandHandler', () => {
  let handler: CreateCommandHandler;
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

    handler = new CreateCommandHandler(mockUow);
  });

  describe('handle', () => {
    it('creates domain entity and adds to unit of work', async () => {
      const request = new Request('test-job-123');
      const command = new CreateCommand(request);

      await handler.handle(command);

      expect(mockUow.add).toHaveBeenCalledWith(
        expect.objectContaining({
          external_job_id: 'test-job-123',
          data: { external_job_id: 'test-job-123' }
        })
      );
    });

    it('emits DomainCreated event with created domain', async () => {
      const request = new Request('test-job-456');
      const command = new CreateCommand(request);

      const messages = await handler.handle(command);
      expect(messages).toHaveLength(1);
      expect(messages[0]).toBeInstanceOf(DomainCreated);
      
      const event = messages[0] as DomainCreated<Domain>;
      expect(event.domain.external_job_id).toBe('test-job-456');
    });
  });
});
