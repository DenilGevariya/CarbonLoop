import { Response, NextFunction } from 'express';
import { AuthRepository } from '../auth/auth.repository';
import { updateProfileSchema } from '../auth/auth.validation';
import { AuthenticatedRequest } from '../auth/auth.types';

export class UserController {
  private repo = new AuthRepository();

  getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, error: { code: 'AUTH_UNAUTHORIZED', message: 'Unauthorized' } });

      const user = await this.repo.findUserById(userId);
      if (!user) return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found.' } });

      const roles = await this.repo.getUserRoles(userId);
      const organizations = await this.repo.getUserOrganizations(userId);

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone,
          avatarUrl: user.avatar_url,
          isActive: user.is_active,
          isVerified: user.is_verified,
          onboardingCompletedAt: user.onboarding_completed_at,
          roles,
          organizations,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, error: { code: 'AUTH_UNAUTHORIZED', message: 'Unauthorized' } });

      const validated = updateProfileSchema.parse(req.body);
      const updated = await this.repo.updateUserProfile(userId, validated);

      res.json({
        success: true,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  };
}
