import { Router } from 'express';
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  adminSendNotification,
} from '../controllers/notification.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router: Router = Router();

// All notification routes require authentication
router.use(authenticate);

// ── User routes ───────────────────────────────────────────────────────────────
router.get('/', getMyNotifications);
router.patch('/read-all', markAllNotificationsRead);
router.patch('/:id/read', markNotificationRead);
router.delete('/:id', deleteNotification);

// ── Admin routes ──────────────────────────────────────────────────────────────
router.post('/broadcast', requireRole('admin'), adminSendNotification);

export default router;
