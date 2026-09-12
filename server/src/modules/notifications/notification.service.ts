import { NotificationRepository } from './notification.repository';
import { Notification } from './notification.types';

export class NotificationService {
  private repo = new NotificationRepository();

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return this.repo.getUserNotifications(userId);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.repo.getUnreadCount(userId);
  }

  async markAsRead(id: string, userId: string): Promise<boolean> {
    return this.repo.markAsRead(id, userId);
  }

  async markAllAsRead(userId: string): Promise<number> {
    return this.repo.markAllAsRead(userId);
  }

  async notifyOrganization(orgId: string, title: string, message: string, type: string, entity_type?: string, entity_id?: string, link_url?: string) {
    return this.repo.notifyOrganization(orgId, {
      title,
      message,
      type,
      entity_type,
      entity_id,
      link_url,
    });
  }
}
