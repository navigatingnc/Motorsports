import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import {
  getPrometheusMetrics,
  getMetricsJson,
  getStatus,
} from '../controllers/metrics.controller';

const router: Router = Router();

/**
 * GET /api/status — public health/status endpoint
 * No authentication required; safe for external uptime monitors.
 */
router.get('/status', getStatus);

/**
 * GET /api/metrics        — Prometheus text format (admin only)
 * GET /api/metrics/json   — JSON snapshot (admin only)
 */
router.get('/metrics', authenticate, requireRole('admin'), getPrometheusMetrics);
router.get('/metrics/json', authenticate, requireRole('admin'), getMetricsJson);

export default router;
