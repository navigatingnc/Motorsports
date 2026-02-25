import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import {
  recordLapTime,
  getLapTimes,
  getLapTimeById,
  updateLapTime,
  deleteLapTime,
  getAnalyticsSummary,
} from '../controllers/analytics.controller';

const router: Router = Router();

// All analytics routes require authentication
router.use(authenticate);

// GET routes — all authenticated roles (admin, user, viewer)
router.get('/summary', getAnalyticsSummary);
router.get('/laptimes', getLapTimes);
router.get('/laptimes/:id', getLapTimeById);

// Write routes — admin and user only (viewers excluded)
router.post('/laptimes', requireRole('admin', 'user'), recordLapTime);
router.put('/laptimes/:id', requireRole('admin', 'user'), updateLapTime);
router.delete('/laptimes/:id', requireRole('admin', 'user'), deleteLapTime);

export default router;
