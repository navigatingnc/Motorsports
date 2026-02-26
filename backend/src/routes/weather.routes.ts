import { Router } from 'express';
import { getEventWeather } from '../controllers/weather.controller';
import { authenticate } from '../middleware/auth.middleware';

const router: Router = Router({ mergeParams: true });

// All weather routes require authentication
router.use(authenticate);

/**
 * GET /api/events/:id/weather
 * Returns weather forecast for the event's venue and date range.
 * Available to all authenticated roles (admin, user, viewer).
 */
router.get('/', getEventWeather);

export default router;
