import { Request, Response, NextFunction } from 'express';
import { validateEvidenceUniqueness } from '../utils/evidence_validation';
import { Evidence } from '../types/evidence';

export function evidenceUniqueMiddleware(
  existingEvidences: Evidence[] // This would typically come from a database
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const newEvidence: Evidence = req.body;

    try {
      const validationResult = validateEvidenceUniqueness(newEvidence, existingEvidences);

      if (!validationResult.isUnique) {
        return res.status(409).json({
          error: 'Evidence is not unique',
          reason: validationResult.duplicateReason,
          validationDuration: validationResult.duration
        });
      }

      // If unique, attach validation result and proceed
      req.evidenceValidation = validationResult;
      next();
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Validation error'
      });
    }
  };
}