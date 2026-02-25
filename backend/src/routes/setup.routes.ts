import { Router } from 'express';
import {
  getAllSetupSheets,
  getSetupSheetById,
  createSetupSheet,
  updateSetupSheet,
  deleteSetupSheet,
} from '../controllers/setup.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router: Router = Router();

// All setup routes require authentication
router.use(authenticate);

// GET routes — all authenticated roles (admin, user, viewer)
router.get('/', getAllSetupSheets);
router.get('/:id', getSetupSheetById);

// Write routes — admin and user only (viewers excluded)
router.post('/', requireRole('admin', 'user'), createSetupSheet);
router.put('/:id', requireRole('admin', 'user'), updateSetupSheet);
router.delete('/:id', requireRole('admin', 'user'), deleteSetupSheet);

export default router;
