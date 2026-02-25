import { Router } from 'express';
import {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from '../controllers/vehicle.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router: Router = Router();

// All vehicle routes require authentication
router.use(authenticate);

// GET routes — all authenticated roles (admin, user, viewer)
router.get('/', getAllVehicles);
router.get('/:id', getVehicleById);

// Write routes — admin and user only (viewers excluded)
router.post('/', requireRole('admin', 'user'), createVehicle);
router.put('/:id', requireRole('admin', 'user'), updateVehicle);
router.delete('/:id', requireRole('admin', 'user'), deleteVehicle);

export default router;
