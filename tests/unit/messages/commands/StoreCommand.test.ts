import { StoreCommand } from '../../../../src/service/messages/commands/StoreCommand';
import { Domain } from '../../../../src/models/Domain';
import { ICommand } from 'driven-micro';

describe('StoreCommand', () => {
  describe('constructor', () => {
    it('creates command with domain', () => {
      const domain = new Domain('test-job-123', { status: 'processed' });
      const command = new StoreCommand(domain);
      
      expect(command.domain).toBe(domain);
    });
  });

  describe('inheritance', () => {
    it('extends ICommand', () => {
      const domain = new Domain('test-job-456');
      const command = new StoreCommand(domain);
      
      // Test inheritance using instanceof
      expect(command).toBeInstanceOf(ICommand);
      expect(command).toBeInstanceOf(StoreCommand);
      
      // Verify command has expected name
      expect(command.name).toBe('StoreCommand');
    });
  });
});
