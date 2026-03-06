import api from './api';
import type { NotificationsResponse } from '../types/notification';

export const notificationService = {
  /**
   * Fetch the current user's notifications.
   * Pass `unreadOnly: true` to retrieve only unread items.
   */
  async getMyNotifications(unreadOnly = false): Promise<NotificationsResponse> {
    const params = unreadOnly ? { unreadOnly: 'true' } : {};
    const res = await api.get<NotificationsResponse>('/notifications', { params });
    return res.data;
  },

  /** Mark a single notification as read. */
  async markRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },

  /** Mark all notifications as read. */
  async markAllRead(): Promise<void> {
    await api.patch('/notifications/read-all');
  },

  /** Delete a notification. */
  async deleteNotification(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },
};
