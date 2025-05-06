import { Evidence } from '../types/evidence';

/**
 * Validates the uniqueness of evidence by checking against a list of existing evidence
 * @param newEvidence The new evidence to validate
 * @param existingEvidences List of existing evidence to check against
 * @returns Boolean indicating whether the evidence is unique
 * @throws Error if validation fails
 */
export function validateEvidenceUniqueness(
  newEvidence: Evidence, 
  existingEvidences: Evidence[]
): boolean {
  // Validate input
  if (!newEvidence) {
    throw new Error('New evidence cannot be null or undefined');
  }

  if (!Array.isArray(existingEvidences)) {
    throw new Error('Existing evidences must be an array');
  }

  // Check for uniqueness across multiple criteria
  const isDuplicate = existingEvidences.some(existingEvidence => {
    // Compare key attributes to determine uniqueness
    return (
      existingEvidence.id === newEvidence.id || 
      (existingEvidence.hash === newEvidence.hash && newEvidence.hash !== null) ||
      (existingEvidence.source === newEvidence.source && 
       existingEvidence.type === newEvidence.type)
    );
  });

  // If duplicate found, return false
  if (isDuplicate) {
    return false;
  }

  // Evidence is unique
  return true;
}

/**
 * Adds new evidence to the list of existing evidences if unique
 * @param newEvidence The new evidence to add
 * @param existingEvidences List of existing evidence
 * @returns Updated list of evidences
 */
export function addUniqueEvidence(
  newEvidence: Evidence, 
  existingEvidences: Evidence[]
): Evidence[] {
  // Validate uniqueness first
  if (validateEvidenceUniqueness(newEvidence, existingEvidences)) {
    return [...existingEvidences, newEvidence];
  }
  
  throw new Error('Evidence is not unique and cannot be added');
}