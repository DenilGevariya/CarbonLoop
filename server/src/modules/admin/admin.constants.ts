export const ADMIN_ERRORS = {
  UNAUTHORIZED: { code: 'UNAUTHORIZED', message: 'Platform admin authentication required.' },
  FORBIDDEN: { code: 'FORBIDDEN', message: 'Access restricted to Platform Admins.' },
  ORGANIZATION_NOT_FOUND: { code: 'ORGANIZATION_NOT_FOUND', message: 'Target organization not found.' },
  USER_NOT_FOUND: { code: 'USER_NOT_FOUND', message: 'Target user not found.' },
  SESSION_NOT_FOUND: { code: 'SESSION_NOT_FOUND', message: 'Target session not found.' },
  ALERT_NOT_FOUND: { code: 'ALERT_NOT_FOUND', message: 'Target system alert not found.' },
  MATCH_NOT_FOUND: { code: 'MATCH_NOT_FOUND', message: 'Target match record not found.' },
  SUSPENSION_REASON_REQUIRED: { code: 'SUSPENSION_REASON_REQUIRED', message: 'A valid reason is required when suspending an organization.' },
};
