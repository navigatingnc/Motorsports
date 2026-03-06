import { Request, Response } from 'express';
import prisma from '../prisma';
import logger from '../config/logger';
import { sendNotification } from '../services/notification.service';
import { CreateNotificationDto } from '../types/notification.types';

// ── GET /api/notifications ────────────────────────────────────────────────────
/**
 * Return all notifications for the authenticated user.
 * Supports ?unreadOnly=true to filter to unread items only.
 */
export const getMyNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const unreadOnly = req.query['unreadOnly'] === 'true';

    const notifications = await prisma.notification.findMany({
      where: {
        recipientId: userId,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { recipientId: userId, isRead: false },
    });

    res.json({ success: true, data: notifications, unreadCount });
  } catch (error) {
    logger.error({ err: error }, 'Error fetching notifications');
    res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
  }
};

// ── PATCH /api/notifications/:id/read ────────────────────────────────────────
/**
 * Mark a single notification as read. Only the recipient may do this.
 */
export const markNotificationRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params as { id: string };

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) {
      res.status(404).json({ success: false, error: 'Notification not found' });
      return;
    }
    if (notification.recipientId !== userId) {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    logger.error({ err: error }, 'Error marking notification as read');
    res.status(500).json({ success: false, error: 'Failed to update notification' });
  }
};

// ── PATCH /api/notifications/read-all ────────────────────────────────────────
/**
 * Mark all of the authenticated user's notifications as read.
 */
export const markAllNotificationsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const result = await prisma.notification.updateMany({
      where: { recipientId: userId, isRead: false },
      data: { isRead: true },
    });

    res.json({ success: true, updatedCount: result.count });
  } catch (error) {
    logger.error({ err: error }, 'Error marking all notifications as read');
    res.status(500).json({ success: false, error: 'Failed to update notifications' });
  }
};

// ── DELETE /api/notifications/:id ────────────────────────────────────────────
/**
 * Delete a single notification. Only the recipient or an admin may do this.
 */
export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    const { id } = req.params as { id: string };

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) {
      res.status(404).json({ success: false, error: 'Notification not found' });
      return;
    }
    if (notification.recipientId !== userId && userRole !== 'admin') {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }

    await prisma.notification.delete({ where: { id } });
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    logger.error({ err: error }, 'Error deleting notification');
    res.status(500).json({ success: false, error: 'Failed to delete notification' });
  }
};

// ── POST /api/notifications/broadcast (admin only) ───────────────────────────
/**
 * Admin endpoint to send a system notification to a specific user.
 */
export const adminSendNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const dto = req.body as CreateNotificationDto;

    if (!dto.recipientId || !dto.message) {
      res.status(400).json({ success: false, error: 'recipientId and message are required' });
      return;
    }

    const notification = await sendNotification(dto);
    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    logger.error({ err: error }, 'Error sending admin notification');
    res.status(500).json({ success: false, error: 'Failed to send notification' });
  }
};
