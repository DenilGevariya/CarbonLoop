import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { registerSchema, loginSchema, changePasswordSchema, updateProfileSchema, onboardingSchema } from './auth.validation';
import { AUTH_CONSTANTS } from './auth.constants';
import { AuthenticatedRequest } from './auth.types';

export class AuthController {
  private service = new AuthService();

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = registerSchema.parse(req.body);
      const user = await this.service.register(validated);

      res.status(201).json({
        success: true,
        data: {
          message: 'Registration successful. Please sign in to complete your organization onboarding.',
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = loginSchema.parse(req.body);
      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip || req.socket.remoteAddress;

      const { accessToken, refreshToken, user } = await this.service.login(
        validated.email,
        validated.password,
        userAgent,
        ipAddress
      );

      // Set HttpOnly Cookie for Refresh Token
      res.cookie(AUTH_CONSTANTS.REFRESH_COOKIE_NAME, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
        path: '/api/v1/auth',
      });

      res.json({
        success: true,
        data: {
          accessToken,
          user,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies?.[AUTH_CONSTANTS.REFRESH_COOKIE_NAME] || req.body?.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          error: { code: 'AUTH_NO_REFRESH_TOKEN', message: 'No refresh token provided.' },
        });
      }

      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip || req.socket.remoteAddress;

      const { accessToken, refreshToken: newRefreshToken } = await this.service.refresh(
        refreshToken,
        userAgent,
        ipAddress
      );

      // Rotate HttpOnly Cookie
      res.cookie(AUTH_CONSTANTS.REFRESH_COOKIE_NAME, newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
        path: '/api/v1/auth',
      });

      res.json({
        success: true,
        data: { accessToken },
      });
    } catch (err) {
      // Clear invalid cookie
      res.clearCookie(AUTH_CONSTANTS.REFRESH_COOKIE_NAME, { path: '/api/v1/auth' });
      next(err);
    }
  };

  logout = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const sessionId = req.user?.sessionId;
      await this.service.logout(sessionId);

      res.clearCookie(AUTH_CONSTANTS.REFRESH_COOKIE_NAME, { path: '/api/v1/auth' });

      res.json({
        success: true,
        data: { message: 'Logged out successfully.' },
      });
    } catch (err) {
      next(err);
    }
  };

  me = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: 'AUTH_UNAUTHORIZED', message: 'Unauthorized' },
        });
      }

      const user = await this.service.getCurrentUser(userId);

      res.json({
        success: true,
        data: user,
      });
    } catch (err) {
      next(err);
    }
  };

  changePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: 'AUTH_UNAUTHORIZED', message: 'Unauthorized' },
        });
      }

      const validated = changePasswordSchema.parse(req.body);
      await this.service.changePassword(userId, validated.currentPassword, validated.newPassword);

      res.clearCookie(AUTH_CONSTANTS.REFRESH_COOKIE_NAME, { path: '/api/v1/auth' });

      res.json({
        success: true,
        data: { message: 'Password changed successfully. Please sign in again with your new password.' },
      });
    } catch (err) {
      next(err);
    }
  };

  getSessions = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, error: { code: 'AUTH_UNAUTHORIZED', message: 'Unauthorized' } });

      const sessions = await this.service.getUserSessions(userId);
      const currentSessionId = req.user?.sessionId;

      res.json({
        success: true,
        data: sessions.map((s) => ({
          id: s.id,
          userAgent: s.userAgent,
          ipAddress: s.ipAddress,
          createdAt: s.createdAt,
          lastUsedAt: s.lastUsedAt,
          isCurrent: s.id === currentSessionId,
        })),
      });
    } catch (err) {
      next(err);
    }
  };

  revokeSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      if (!userId) return res.status(401).json({ success: false, error: { code: 'AUTH_UNAUTHORIZED', message: 'Unauthorized' } });

      await this.service.revokeSession(userId, id);

      res.json({
        success: true,
        data: { message: 'Session revoked successfully.' },
      });
    } catch (err) {
      next(err);
    }
  };

  completeOnboarding = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, error: { code: 'AUTH_UNAUTHORIZED', message: 'Unauthorized' } });

      const validated = onboardingSchema.parse(req.body);
      const updatedUser = await this.service.completeOnboarding(userId, validated);

      res.json({
        success: true,
        data: {
          message: 'Organization onboarding completed successfully.',
          user: updatedUser,
        },
      });
    } catch (err) {
      next(err);
    }
  };
}
