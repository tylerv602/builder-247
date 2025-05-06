import { Request, Response, NextFunction } from 'express';
import { Evidence } from '../types/evidence';
import { evidenceValidator } from '../utils/evidence_validation';

export function createEvidenceValidationMiddleware(
  existingEvidences: Evidence[] = []
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const newEvidence: Evidence = req.body;

    try {
      const validationResult = evidenceValidator.validateUniqueness(
        newEvidence, 
        existingEvidences
      );

      if (!validationResult.isUnique) {
        return res.status(409).json({
          error: 'Evidence is not unique',
          ...validationResult
        });
      }

      // Attach validation result to request for downstream use
      (req as any).evidenceValidation = validationResult;
      next();
    } catch (error) {
      res.status(400).json({
        error: 'Validation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}