import { Router } from 'express';
import {
  getAllSetupSheets,
  getSetupSheetById,
  createSetupSheet,
  updateSetupSheet,
  deleteSetupSheet,
} from '../controllers/setup.controller';
import { authenticate } from '../middleware/auth.middleware';

const router: Router = Router();

// All setup routes require authentication
router.use(authenticate);

// GET /api/setups - Get all setup sheets (supports ?eventId= and ?vehicleId= query params)
router.get('/', getAllSetupSheets);

// GET /api/setups/:id - Get a single setup sheet by ID
router.get('/:id', getSetupSheetById);

// POST /api/setups - Create a new setup sheet
router.post('/', createSetupSheet);

// PUT /api/setups/:id - Update a setup sheet
router.put('/:id', updateSetupSheet);

// DELETE /api/setups/:id - Delete a setup sheet
router.delete('/:id', deleteSetupSheet);

export default router;
