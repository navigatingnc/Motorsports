import { Router } from 'express';
import {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from '../controllers/vehicle.controller';

const router: Router = Router();

// GET /api/vehicles - Get all vehicles
router.get('/', getAllVehicles);

// GET /api/vehicles/:id - Get a single vehicle by ID
router.get('/:id', getVehicleById);

// POST /api/vehicles - Create a new vehicle
router.post('/', createVehicle);

// PUT /api/vehicles/:id - Update a vehicle
router.put('/:id', updateVehicle);

// DELETE /api/vehicles/:id - Delete a vehicle
router.delete('/:id', deleteVehicle);

export default router;
