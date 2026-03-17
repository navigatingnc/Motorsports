/**
 * Predict Routes — Phase 27
 */
import { Router } from 'express';
import { predictLapTime } from '../controllers/predict.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router: Router = Router();

// All predict routes require authentication
router.use(authenticate);

// POST /api/predict/laptime - accessible by admin and user roles
router.post('/laptime', requireRole('admin', 'user'), predictLapTime);

export default router;
