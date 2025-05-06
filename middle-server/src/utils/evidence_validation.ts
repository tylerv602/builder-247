import { Evidence } from '../types/evidence';
import { performance } from 'perf_hooks';
import * as winston from 'winston';

// Configure logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'evidence-validation.log' })
  ]
});

// Simple in-memory LRU cache for evidence uniqueness
class EvidenceCache {
  private cache: Map<string, Evidence>;
  private maxSize: number;

  constructor(maxSize = 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  set(key: string, evidence: Evidence) {
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, evidence);
  }

  get(key: string): Evidence | undefined {
    return this.cache.get(key);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }
}

const evidenceCache = new EvidenceCache();

/**
 * Validates the uniqueness of evidence with performance tracking and logging
 * @param newEvidence The new evidence to validate
 * @param existingEvidences List of existing evidence to check against
 * @returns Validation result with performance metrics
 */
export function validateEvidenceUniqueness(
  newEvidence: Evidence, 
  existingEvidences: Evidence[]
): { 
  isUnique: boolean; 
  duration: number; 
  duplicateReason?: string 
} {
  const startTime = performance.now();

  // Validate input
  if (!newEvidence) {
    logger.error('Null evidence validation attempt');
    throw new Error('New evidence cannot be null or undefined');
  }

  if (!Array.isArray(existingEvidences)) {
    logger.error('Invalid existing evidences type');
    throw new Error('Existing evidences must be an array');
  }

  // Quick cache check
  const cacheKey = newEvidence.id || `${newEvidence.source}:${newEvidence.type}`;
  if (evidenceCache.has(cacheKey)) {
    const duration = performance.now() - startTime;
    logger.warn('Evidence already in cache', { 
      evidenceId: newEvidence.id, 
      duration 
    });
    return { 
      isUnique: false, 
      duration, 
      duplicateReason: 'Cached' 
    };
  }

  // Optimized uniqueness check with early return
  for (const existingEvidence of existingEvidences) {
    const isDuplicate = 
      existingEvidence.id === newEvidence.id || 
      (existingEvidence.hash && existingEvidence.hash === newEvidence.hash) ||
      (existingEvidence.source === newEvidence.source && 
       existingEvidence.type === newEvidence.type);

    if (isDuplicate) {
      const duration = performance.now() - startTime;
      
      // Log duplicate attempt
      logger.warn('Evidence not unique', { 
        newEvidence, 
        existingEvidence, 
        duration 
      });

      return { 
        isUnique: false, 
        duration, 
        duplicateReason: 'Duplicate attributes match' 
      };
    }
  }

  // Evidence is unique, add to cache
  evidenceCache.set(cacheKey, newEvidence);

  const duration = performance.now() - startTime;
  logger.info('Evidence validated as unique', { 
    evidenceId: newEvidence.id, 
    duration 
  });

  return { 
    isUnique: true, 
    duration 
  };
}

/**
 * Adds new evidence to the list if unique, with detailed tracking
 * @param newEvidence The new evidence to add
 * @param existingEvidences List of existing evidence
 * @returns Detailed result of evidence addition
 */
export function addUniqueEvidence(
  newEvidence: Evidence, 
  existingEvidences: Evidence[]
): { 
  success: boolean; 
  updatedEvidences?: Evidence[]; 
  error?: string 
} {
  const validationResult = validateEvidenceUniqueness(newEvidence, existingEvidences);

  if (!validationResult.isUnique) {
    logger.error('Cannot add non-unique evidence', { 
      evidence: newEvidence, 
      reason: validationResult.duplicateReason 
    });

    return {
      success: false,
      error: validationResult.duplicateReason || 'Evidence not unique'
    };
  }

  const updatedEvidences = [...existingEvidences, newEvidence];
  
  logger.info('Evidence added successfully', { 
    evidenceId: newEvidence.id, 
    totalEvidences: updatedEvidences.length 
  });

  return {
    success: true,
    updatedEvidences
  };
}

// Performance hints and configuration
export const performanceConfig = {
  maxValidationTimeMs: 50,
  recommendedCacheSize: 1000
};