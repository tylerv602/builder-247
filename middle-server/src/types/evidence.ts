/**
 * Evidence interface representing a piece of evidence with key attributes
 */
export interface Evidence {
  id: string;           // Unique identifier
  type: string;         // Type of evidence
  source: string;       // Source of the evidence
  hash: string | null;  // Optional hash for additional uniqueness check
  timestamp?: number;   // Optional timestamp
  metadata?: Record<string, any>; // Optional additional metadata
}