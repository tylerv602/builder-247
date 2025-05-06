import { Evidence, EvidenceValidationResult } from '../types/evidence';
import { performance } from 'perf_hooks';

export class EvidenceValidator {
  private evidenceStore: Set<string>;
  private maxCacheSize: number;

  constructor(maxCacheSize = 1000) {
    this.evidenceStore = new Set();
    this.maxCacheSize = maxCacheSize;
  }

  /**
   * Validate uniqueness of evidence
   * @param evidence New evidence to validate
   * @param existingEvidences List of existing evidences
   * @returns Validation result
   */
  validateUniqueness(
    evidence: Evidence, 
    existingEvidences: Evidence[]
  ): EvidenceValidationResult {
    const startTime = performance.now();

    // Input validation
    if (!evidence) {
      return {
        isUnique: false,
        reason: 'Invalid evidence: null or undefined',
        details: { timestamp: Date.now() }
      };
    }

    // Quick cache check
    const uniqueKey = this.generateUniqueKey(evidence);
    if (this.evidenceStore.has(uniqueKey)) {
      return {
        isUnique: false,
        reason: 'Evidence already exists in cache',
        details: { 
          id: evidence.id, 
          duration: performance.now() - startTime 
        }
      };
    }

    // Check against existing evidences
    const isDuplicate = existingEvidences.some(existing => 
      existing.id === evidence.id ||
      existing.hash === evidence.hash ||
      (existing.source === evidence.source && existing.type === evidence.type)
    );

    const duration = performance.now() - startTime;

    if (isDuplicate) {
      return {
        isUnique: false,
        reason: 'Duplicate evidence detected',
        details: { 
          id: evidence.id, 
          duration 
        }
      };
    }

    // Add to cache and return unique result
    this.addToCache(uniqueKey);

    return {
      isUnique: true,
      details: { 
        id: evidence.id, 
        duration 
      }
    };
  }

  /**
   * Generate a unique key for evidence
   */
  private generateUniqueKey(evidence: Evidence): string {
    return `${evidence.source}:${evidence.type}:${evidence.hash}`;
  }

  /**
   * Add evidence to cache, managing max size
   */
  private addToCache(key: string): void {
    if (this.evidenceStore.size >= this.maxCacheSize) {
      // Remove oldest entry if cache is full
      const oldestKey = Array.from(this.evidenceStore)[0];
      this.evidenceStore.delete(oldestKey);
    }
    this.evidenceStore.add(key);
  }

  /**
   * Clear the evidence cache
   */
  clearCache(): void {
    this.evidenceStore.clear();
  }
}

// Singleton instance for global use
export const evidenceValidator = new EvidenceValidator();