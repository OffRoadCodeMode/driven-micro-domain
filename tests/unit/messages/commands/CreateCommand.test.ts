import { CreateCommand } from '../../../../src/service/messages/commands/CreateCommand';
import { Request } from '../../../../src/models/Request';
import { ICommand } from 'driven-micro';

describe('CreateCommand', () => {
  describe('constructor', () => {
    it('creates command with request', () => {
      const request = new Request('test-job-123');
      const command = new CreateCommand(request);
      
      expect(command.request).toBe(request);
    });
  });

  describe('external_job_id getter', () => {
    it('returns external_job_id from request', () => {
      const request = new Request('test-job-456');
      const command = new CreateCommand(request);
      
      expect(command.external_job_id).toBe('test-job-456');
    });
  });

  describe('inheritance', () => {
    it('extends ICommand', () => {
      const request = new Request('test-job-456');
      const command = new CreateCommand(request);
      
      // Test inheritance using instanceof
      expect(command).toBeInstanceOf(ICommand);
      expect(command).toBeInstanceOf(CreateCommand);
      
      // Verify command has expected name
      expect(command.name).toBe('CreateCommand');
    });
  });
});
