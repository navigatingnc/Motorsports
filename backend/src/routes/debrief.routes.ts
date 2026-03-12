/**
 * Debrief Routes — Phase 26
 *
 * All routes require authentication.
 * Write operations (analyze, delete) additionally require 'admin' or 'user' role.
 */
import { Router } from 'express';
import {
  analyzeDebrief,
  getDebriefsByLap,
  getDebriefById,
  deleteDebrief,
} from '../controllers/debrief.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router: Router = Router();

// All debrief routes require authentication
router.use(authenticate);

// ── Write routes (admin + user) ───────────────────────────────────────────────
router.post('/analyze', requireRole('admin', 'user'), analyzeDebrief);
router.delete('/:id', requireRole('admin', 'user'), deleteDebrief);

// ── Read routes (all authenticated users) ────────────────────────────────────
router.get('/lap/:lapTimeId', getDebriefsByLap);
router.get('/:id', getDebriefById);

export default router;
