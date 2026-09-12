export const VERIFICATION_ERRORS = {
  NOT_FOUND: { code: 'VERIFICATION_NOT_FOUND', message: 'Verification request not found.' },
  INVALID_STATUS_TRANSITION: { code: 'INVALID_STATUS_TRANSITION', message: 'Invalid verification status transition.' },
  MISSING_REQUIRED_DOCUMENTS: { code: 'MISSING_REQUIRED_DOCUMENTS', message: 'Required evidence documents are missing.' },
  UNAUTHORIZED: { code: 'UNAUTHORIZED', message: 'Only authorized reviewers can perform this action.' },
  ORGANIZATION_NOT_FOUND: { code: 'ORGANIZATION_NOT_FOUND', message: 'Target organization not found.' },
  FACILITY_NOT_FOUND: { code: 'FACILITY_NOT_FOUND', message: 'Target facility not found.' },
  LISTING_NOT_FOUND: { code: 'LISTING_NOT_FOUND', message: 'Target CO₂ listing not found.' },
  CONFLICT: { code: 'VERIFICATION_CONFLICT', message: 'Another reviewer is actively processing this request.' },
};
