import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
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

// Summary / aggregated analytics
router.get('/summary', getAnalyticsSummary);

// Lap time CRUD
router.get('/laptimes', getLapTimes);
router.post('/laptimes', recordLapTime);
router.get('/laptimes/:id', getLapTimeById);
router.put('/laptimes/:id', updateLapTime);
router.delete('/laptimes/:id', deleteLapTime);

export default router;
