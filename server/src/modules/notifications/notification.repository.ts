import { query, pool } from '../../config/database';
import { Notification, CreateNotificationDTO } from './notification.types';

export class NotificationRepository {
  async createNotification(dto: CreateNotificationDTO): Promise<Notification> {
    const res = await query<Notification>(
      `INSERT INTO notifications (user_id, type, title, message, entity_type, entity_id, link_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        dto.user_id,
        dto.type,
        dto.title,
        dto.message,
        dto.entity_type || null,
        dto.entity_id || null,
        dto.link_url || null,
      ]
    );
    return res.rows[0];
  }

  async notifyOrganization(orgId: string, notification: Omit<CreateNotificationDTO, 'user_id'>): Promise<void> {
    const members = await query<{ user_id: string }>(
      `SELECT user_id FROM organization_members WHERE organization_id = $1`,
      [orgId]
    );

    for (const member of members.rows) {
      await this.createNotification({
        user_id: member.user_id,
        ...notification,
      });
    }
  }

  async getUserNotifications(userId: string, limit = 50): Promise<Notification[]> {
    const res = await query<Notification>(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [userId, limit]
    );
    return res.rows;
  }

  async getUnreadCount(userId: string): Promise<number> {
    const res = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM notifications 
       WHERE user_id = $1 AND is_read = false`,
      [userId]
    );
    return parseInt(res.rows[0]?.count || '0', 10);
  }

  async markAsRead(id: string, userId: string): Promise<boolean> {
    const res = await query(
      `UPDATE notifications 
       SET is_read = true, read_at = NOW() 
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    return (res.rowCount ?? 0) > 0;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const res = await query(
      `UPDATE notifications 
       SET is_read = true, read_at = NOW() 
       WHERE user_id = $1 AND is_read = false`,
      [userId]
    );
    return res.rowCount ?? 0;
  }
}
