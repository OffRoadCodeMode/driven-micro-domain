import { Request } from '../../../src/models/Request';

describe('Request', () => {
  describe('constructor', () => {
    it('creates request with external_job_id', () => {
      const request = new Request('test-job-123');
      
      expect(request.external_job_id).toBe('test-job-123');
    });
  });

  describe('serialize', () => {
    it('returns serialized request data', () => {
      const request = new Request('test-job-456');
      const serialized = request.serialize();
      
      expect(serialized).toEqual({
        external_job_id: 'test-job-456'
      });
    });
  });

  describe('validate', () => {
    it('returns no errors for valid input', () => {
      const input = { external_job_id: 'valid-job-id' };
      const errors = Request.validate(input);
      
      expect(errors).toEqual([]);
    });

    it('returns error when external_job_id is missing', () => {
      const input = {};
      const errors = Request.validate(input);
      
      expect(errors).toContain('external_job_id is required and must be a string');
    });

    it('returns error when external_job_id is not a string', () => {
      const input = { external_job_id: 123 };
      const errors = Request.validate(input);
      
      expect(errors).toContain('external_job_id is required and must be a string');
    });

    it('returns error when external_job_id is null', () => {
      const input = { external_job_id: null };
      const errors = Request.validate(input);
      
      expect(errors).toContain('external_job_id is required and must be a string');
    });

    it('returns error when external_job_id is empty string', () => {
      const input = { external_job_id: '' };
      const errors = Request.validate(input);
      
      expect(errors).toContain('external_job_id is required and must be a string');
    });
  });

  describe('create', () => {
    it('creates request from valid input', async () => {
      const input = { external_job_id: 'test-job-789' };
      const request = await Request.create(input);
      
      expect(request).toBeInstanceOf(Request);
      expect(request.external_job_id).toBe('test-job-789');
    });

    it('throws error for invalid input', async () => {
      const input = { external_job_id: 123 };
      
      await expect(Request.create(input)).rejects.toThrow(
        'Validation failed: external_job_id is required and must be a string'
      );
    });

    it('throws error with multiple validation errors', async () => {
      const input = {};
      
      await expect(Request.create(input)).rejects.toThrow(
        'Validation failed: external_job_id is required and must be a string'
      );
    });
  });
});
