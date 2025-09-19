import { ActCommand } from '../../../../src/service/messages/commands/ActCommand';
import { Domain } from '../../../../src/models/Domain';
import { ICommand } from 'driven-micro';

describe('ActCommand', () => {
  describe('constructor', () => {
    it('creates command with domain', () => {
      const domain = new Domain('test-job-123', { status: 'created' });
      const command = new ActCommand(domain);
      
      expect(command.domain).toBe(domain);
    });
  });

  describe('inheritance', () => {
    it('extends ICommand', () => {
      const domain = new Domain('test-job-456');
      const command = new ActCommand(domain);
      
      // Test inheritance using instanceof
      expect(command).toBeInstanceOf(ICommand);
      expect(command).toBeInstanceOf(ActCommand);
      
      // Verify command has expected name
      expect(command.name).toBe('ActCommand');
    });
  });
});
