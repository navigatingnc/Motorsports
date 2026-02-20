import { Router } from 'express';
import {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
} from '../controllers/driver.controller';
import { authenticate } from '../middleware/auth.middleware';

const router: Router = Router();

// All driver routes require authentication
router.use(authenticate);

// GET /api/drivers - Get all drivers
router.get('/', getAllDrivers);

// GET /api/drivers/:id - Get a single driver by ID
router.get('/:id', getDriverById);

// POST /api/drivers - Create a new driver profile
router.post('/', createDriver);

// PUT /api/drivers/:id - Update a driver profile
router.put('/:id', updateDriver);

// DELETE /api/drivers/:id - Delete a driver profile
router.delete('/:id', deleteDriver);

export default router;
