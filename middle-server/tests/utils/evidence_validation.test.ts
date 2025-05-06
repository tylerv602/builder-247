import { validateEvidenceUniqueness, addUniqueEvidence } from '../../src/utils/evidence_validation';
import { Evidence } from '../../src/types/evidence';

describe('Evidence Uniqueness Validation', () => {
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

  describe('validateEvidenceUniqueness', () => {
    it('should return false for evidence with duplicate id', () => {
      const duplicateIdEvidence: Evidence = {
        ...baseEvidence,
        hash: 'different-hash'
      };
      
      expect(validateEvidenceUniqueness(duplicateIdEvidence, existingEvidences)).toBe(false);
    });

    it('should return false for evidence with duplicate hash', () => {
      const duplicateHashEvidence: Evidence = {
        id: 'unique-id',
        type: 'document',
        source: 'unique-source',
        hash: 'abc123'
      };
      
      expect(validateEvidenceUniqueness(duplicateHashEvidence, existingEvidences)).toBe(false);
    });

    it('should return false for evidence with duplicate source and type', () => {
      const duplicateSourceTypeEvidence: Evidence = {
        id: 'unique-id',
        type: 'document',
        source: 'test-source',
        hash: 'unique-hash'
      };
      
      expect(validateEvidenceUniqueness(duplicateSourceTypeEvidence, existingEvidences)).toBe(false);
    });

    it('should return true for completely unique evidence', () => {
      const uniqueEvidence: Evidence = {
        id: 'unique-id',
        type: 'video',
        source: 'unique-source',
        hash: 'unique-hash'
      };
      
      expect(validateEvidenceUniqueness(uniqueEvidence, existingEvidences)).toBe(true);
    });

    it('should throw error for null evidence', () => {
      expect(() => validateEvidenceUniqueness(null as any, existingEvidences)).toThrow('New evidence cannot be null or undefined');
    });

    it('should throw error for invalid existing evidences', () => {
      expect(() => validateEvidenceUniqueness(baseEvidence, null as any)).toThrow('Existing evidences must be an array');
    });
  });

  describe('addUniqueEvidence', () => {
    it('should add unique evidence to existing evidences', () => {
      const uniqueEvidence: Evidence = {
        id: 'unique-id',
        type: 'video',
        source: 'unique-source',
        hash: 'unique-hash'
      };

      const updatedEvidences = addUniqueEvidence(uniqueEvidence, existingEvidences);
      expect(updatedEvidences).toContain(uniqueEvidence);
      expect(updatedEvidences.length).toBe(3);
    });

    it('should throw error when adding duplicate evidence', () => {
      const duplicateEvidence: Evidence = {
        ...baseEvidence,
        hash: 'different-hash'
      };

      expect(() => addUniqueEvidence(duplicateEvidence, existingEvidences)).toThrow('Evidence is not unique and cannot be added');
    });
  });
});