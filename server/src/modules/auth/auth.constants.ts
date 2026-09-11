export const AUTH_CONSTANTS = {
  REFRESH_COOKIE_NAME: 'carbonloop_refresh_token',
  ACCESS_TOKEN_HEADER: 'authorization',
  ACCESS_TOKEN_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  REFRESH_TOKEN_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  REFRESH_TOKEN_EXPIRES_DAYS: 7,
  BCRYPT_SALT_ROUNDS: 10,
};

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: { code: 'AUTH_INVALID_CREDENTIALS', message: 'Invalid email or password.' },
  EMAIL_ALREADY_EXISTS: { code: 'AUTH_EMAIL_EXISTS', message: 'This email cannot be used for registration.' },
  UNAUTHORIZED: { code: 'AUTH_UNAUTHORIZED', message: 'Authentication required. Please sign in.' },
  FORBIDDEN: { code: 'AUTH_FORBIDDEN', message: 'You do not have permission to access this resource.' },
  SESSION_EXPIRED: { code: 'AUTH_SESSION_EXPIRED', message: 'Your session has expired. Please sign in again.' },
  SESSION_REVOKED: { code: 'AUTH_SESSION_REVOKED', message: 'Session has been revoked.' },
  USER_NOT_FOUND: { code: 'AUTH_USER_NOT_FOUND', message: 'User profile not found.' },
  ORGANIZATION_NOT_FOUND: { code: 'ORG_NOT_FOUND', message: 'Organization not found.' },
  INVALID_TOKEN: { code: 'AUTH_INVALID_TOKEN', message: 'Invalid or corrupted token.' },
};
