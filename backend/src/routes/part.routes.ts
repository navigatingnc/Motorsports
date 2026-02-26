import { Router } from 'express';
import {
  getAllParts,
  getPartById,
  createPart,
  updatePart,
  adjustPartQuantity,
  deletePart,
  getInventorySummary,
} from '../controllers/part.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router: Router = Router();

// All parts routes require authentication
router.use(authenticate);

// ── Read routes — all authenticated roles ──────────────────────────────────
router.get('/',          getAllParts);
router.get('/summary',   getInventorySummary);   // must be before /:id
router.get('/:id',       getPartById);

// ── Write routes — admin and user only ────────────────────────────────────
router.post('/',                    requireRole('admin', 'user'), createPart);
router.put('/:id',                  requireRole('admin', 'user'), updatePart);
router.patch('/:id/adjust',         requireRole('admin', 'user'), adjustPartQuantity);
router.delete('/:id',               requireRole('admin', 'user'), deletePart);

export default router;
