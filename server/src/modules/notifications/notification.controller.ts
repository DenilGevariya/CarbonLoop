import { Response, NextFunction } from 'express';
import { NotificationService } from './notification.service';
import { AuthenticatedRequest } from '../auth/auth.types';

const notificationService = new NotificationService();

export class NotificationController {
  async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const notifications = await notificationService.getUserNotifications(userId);
      const unreadCount = await notificationService.getUnreadCount(userId);

      res.json({
        success: true,
        data: notifications,
        unreadCount,
      });
    } catch (err) {
      next(err);
    }
  }

  async getUnreadCount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const count = await notificationService.getUnreadCount(userId);
      res.json({ success: true, count });
    } catch (err) {
      next(err);
    }
  }

  async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const id = req.params.id as string;
      const success = await notificationService.markAsRead(id, userId);
      res.json({ success });
    } catch (err) {
      next(err);
    }
  }

  async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const count = await notificationService.markAllAsRead(userId);
      res.json({ success: true, count });
    } catch (err) {
      next(err);
    }
  }
}
