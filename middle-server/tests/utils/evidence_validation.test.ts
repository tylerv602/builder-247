import { 
  validateEvidenceUniqueness, 
  addUniqueEvidence,
  performanceConfig
} from '../../src/utils/evidence_validation';
import { Evidence } from '../../src/types/evidence';

describe('Enhanced Evidence Uniqueness Validation', () => {
  const baseEvidence: Evidence = {
    id: 'test-1',
    type: 'document',
    source: 'test-source',
    hash: 'abc123'
  };

  const existingEvidences: Evidence[] = [
    baseEvidence,
    {
      id: 'test-2',
      type: 'image',
      source: 'another-source',
      hash: 'def456'
    }
  ];

  describe('Performance and Validation', () => {
    it('should validate evidence uniqueness within performance threshold', () => {
      const uniqueEvidence: Evidence = {
        id: 'unique-id',
        type: 'video',
        source: 'unique-source',
        hash: 'unique-hash'
      };
      
      const result = validateEvidenceUniqueness(uniqueEvidence, existingEvidences);
      
      expect(result.isUnique).toBe(true);
      expect(result.duration).toBeLessThan(performanceConfig.maxValidationTimeMs);
    });

    it('should return detailed validation result for duplicate evidence', () => {
      const duplicateEvidence: Evidence = {
        ...baseEvidence,
        hash: 'different-hash'
      };
      
      const result = validateEvidenceUniqueness(duplicateEvidence, existingEvidences);
      
      expect(result.isUnique).toBe(false);
      expect(result.duplicateReason).toBeDefined();
    });
  });

  describe('Evidence Addition', () => {
    it('should successfully add unique evidence', () => {
      const uniqueEvidence: Evidence = {
        id: 'unique-id',
        type: 'video',
        source: 'unique-source',
        hash: 'unique-hash'
      };

      const result = addUniqueEvidence(uniqueEvidence, existingEvidences);
      
      expect(result.success).toBe(true);
      expect(result.updatedEvidences).toBeDefined();
      expect(result.updatedEvidences?.length).toBe(3);
    });

    it('should prevent adding duplicate evidence', () => {
      const duplicateEvidence: Evidence = {
        ...baseEvidence,
        hash: 'different-hash'
      };

      const result = addUniqueEvidence(duplicateEvidence, existingEvidences);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should throw error for null evidence', () => {
      expect(() => validateEvidenceUniqueness(null as any, existingEvidences))
        .toThrow('New evidence cannot be null or undefined');
    });

    it('should throw error for invalid existing evidences', () => {
      expect(() => validateEvidenceUniqueness(baseEvidence, null as any))
        .toThrow('Existing evidences must be an array');
    });
  });
});