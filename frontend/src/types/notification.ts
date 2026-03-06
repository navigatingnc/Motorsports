export type NotificationType = 'setup_sheet' | 'event_reminder' | 'low_stock' | 'system';

export interface Notification {
  id: string;
  recipientId: string;
  message: string;
  type: NotificationType | string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  unreadCount: number;
}
