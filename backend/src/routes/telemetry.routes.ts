import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import {
  batchIngestTelemetry,
  getTelemetryByLap,
  deleteTelemetryByLap,
} from '../controllers/telemetry.controller';

const router: Router = Router();

// All telemetry routes require authentication
router.use(authenticate);

/**
 * POST /api/telemetry/batch
 * Bulk-ingest telemetry samples for a single lap.
 * Requires admin or user role (viewers are read-only).
 */
router.post('/batch', requireRole('admin', 'user'), batchIngestTelemetry);

/**
 * GET /api/telemetry/:lapTimeId
 * Retrieve the full telemetry trace for a given lap, ordered by offsetMs.
 * All authenticated roles may read telemetry.
 */
router.get('/:lapTimeId', getTelemetryByLap);

/**
 * DELETE /api/telemetry/:lapTimeId
 * Delete all telemetry samples for a given lap (e.g. to re-upload corrected data).
 * Requires admin or user role.
 */
router.delete('/:lapTimeId', requireRole('admin', 'user'), deleteTelemetryByLap);

export default router;
