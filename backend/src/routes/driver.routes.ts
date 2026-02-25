import { Router } from 'express';
import {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
} from '../controllers/driver.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router: Router = Router();

// All driver routes require authentication
router.use(authenticate);

// GET routes — all authenticated roles (admin, user, viewer)
router.get('/', getAllDrivers);
router.get('/:id', getDriverById);

// Write routes — admin and user only (viewers excluded)
router.post('/', requireRole('admin', 'user'), createDriver);
router.put('/:id', requireRole('admin', 'user'), updateDriver);
router.delete('/:id', requireRole('admin', 'user'), deleteDriver);

export default router;
