import { Domain } from '../../../src/models/Domain';

describe('Domain', () => {
  describe('constructor', () => {
    it('creates domain with external_job_id only', () => {
      const domain = new Domain('test-job-123');
      
      expect(domain.external_job_id).toBe('test-job-123');
      expect(domain.data).toEqual({});
    });

    it('creates domain with external_job_id and initial data', () => {
      const initialData = { key: 'value', number: 42 };
      const domain = new Domain('test-job-456', initialData);
      
      expect(domain.external_job_id).toBe('test-job-456');
      expect(domain.data).toEqual(initialData);
    });
  });

  describe('serialize', () => {
    it('returns serialized domain with timestamp', () => {
      const domain = new Domain('test-job-789', { status: 'active' });
      const serialized = domain.serialize();
      
      expect(serialized.external_job_id).toBe('test-job-789');
      expect(serialized.data).toEqual({ status: 'active' });
      expect(serialized.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('updateData', () => {
    it('merges new data with existing data', () => {
      const domain = new Domain('test-job-update', { existing: 'value', keep: true });
      
      domain.updateData({ new: 'data', existing: 'updated' });
      
      expect(domain.data).toEqual({
        existing: 'updated',
        keep: true,
        new: 'data'
      });
    });

    it('handles empty data update', () => {
      const domain = new Domain('test-job-empty', { original: 'data' });
      
      domain.updateData({});
      
      expect(domain.data).toEqual({ original: 'data' });
    });

    it('preserves original data when updating with undefined values', () => {
      const domain = new Domain('test-job-undefined', { key: 'value' });
      
      domain.updateData({ key: undefined, newKey: 'newValue' });
      
      expect(domain.data).toEqual({ key: undefined, newKey: 'newValue' });
    });
  });
});
