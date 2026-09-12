export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  entity_type?: string | null;
  entity_id?: string | null;
  link_url?: string | null;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
}

export interface CreateNotificationDTO {
  user_id: string;
  type: string;
  title: string;
  message: string;
  entity_type?: string;
  entity_id?: string;
  link_url?: string;
}
