export interface Evidence {
  id: string;
  type: string;
  source: string;
  hash: string;
  timestamp?: number;
  metadata?: Record<string, any>;
}

export interface EvidenceValidationResult {
  isUnique: boolean;
  reason?: string;
  details?: Record<string, any>;
}