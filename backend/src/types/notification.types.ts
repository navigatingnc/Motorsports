export type NotificationType = 'setup_sheet' | 'event_reminder' | 'low_stock' | 'system';

export interface CreateNotificationDto {
  recipientId: string;
  message: string;
  type?: NotificationType;
}

export interface NotificationPayload {
  id: string;
  recipientId: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
}
