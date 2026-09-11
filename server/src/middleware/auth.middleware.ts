import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../modules/auth/auth.utils';
import { AUTH_ERRORS } from '../modules/auth/auth.constants';
import { AuthenticatedRequest } from '../modules/auth/auth.types';
import { query } from '../config/database';

export function authenticateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: AUTH_ERRORS.UNAUTHORIZED,
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    req.user = decoded;
    req.token = token;

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: AUTH_ERRORS.INVALID_TOKEN,
    });
  }
}

export function optionalAuthenticateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      req.user = decoded;
      req.token = token;
    }
  } catch (err) {
    // Ignore invalid token for optional auth
  }
  next();
}

export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: AUTH_ERRORS.UNAUTHORIZED });
    }

    const userRoles = (req.user.roles || []).map((r) => r.toLowerCase());
    const isPlatformAdmin = userRoles.includes('platform_admin') || userRoles.includes('admin');

    if (isPlatformAdmin) {
      return next();
    }

    const hasRole = allowedRoles.some((r) => userRoles.includes(r.toLowerCase()));
    if (!hasRole) {
      return res.status(403).json({ success: false, error: AUTH_ERRORS.FORBIDDEN });
    }

    next();
  };
}

export function requireOrgMember(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const userId = req.user?.userId;
  const orgId = req.params.orgId || req.headers['x-organization-id'] as string;

  if (!userId) {
    return res.status(401).json({ success: false, error: AUTH_ERRORS.UNAUTHORIZED });
  }

  if (!orgId) {
    return res.status(400).json({ success: false, error: { code: 'ORG_ID_REQUIRED', message: 'Organization ID is required.' } });
  }

  query(
    `SELECT id FROM organization_members WHERE organization_id = $1 AND user_id = $2`,
    [orgId, userId]
  )
    .then((resDb) => {
      const isMember = resDb.rows.length > 0;
      const isPlatformAdmin = (req.user?.roles || []).some((r) => r.toLowerCase() === 'platform_admin' || r.toLowerCase() === 'admin');

      if (!isMember && !isPlatformAdmin) {
        return res.status(403).json({ success: false, error: AUTH_ERRORS.FORBIDDEN });
      }

      next();
    })
    .catch((err) => next(err));
}
