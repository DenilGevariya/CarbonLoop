import { apiClient, extractCollection, type CollectionResponse } from '@/api/client';

export interface NotificationItem {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  entity_type?: string;
  entity_id?: string;
  link_url?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export const notificationApi = {
  getNotifications: async (): Promise<NotificationItem[]> => {
    const response = await apiClient.get<NotificationItem[] | CollectionResponse<NotificationItem>>('/notifications');
    return extractCollection(response);
  },
  getUnreadCount: () => apiClient.get<{ count: number }>('/notifications/unread-count'),
  markAsRead: (id: string) => apiClient.patch<{ success: boolean }>(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.post<{ success: boolean; count: number }>('/notifications/mark-all-read'),
};
