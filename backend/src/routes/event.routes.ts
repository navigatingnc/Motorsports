import { Router } from 'express';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/event.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router: Router = Router();

// All event routes require authentication
router.use(authenticate);

// GET routes — all authenticated roles (admin, user, viewer)
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Write routes — admin and user only (viewers excluded)
router.post('/', requireRole('admin', 'user'), createEvent);
router.put('/:id', requireRole('admin', 'user'), updateEvent);
router.delete('/:id', requireRole('admin', 'user'), deleteEvent);

export default router;
