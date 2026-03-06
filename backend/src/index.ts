import dotenv from 'dotenv';
dotenv.config();

// ── Sentry must be initialised before any other imports that use it ──────────
import { initSentry } from './config/sentry';
initSentry();

import http from 'http';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';

import logger from './config/logger';
import { metricsMiddleware } from './config/metrics';
import { initSocketIO } from './services/notification.service';

import vehicleRoutes from './routes/vehicle.routes';
import eventRoutes from './routes/event.routes';
import authRoutes from './routes/auth.routes';
import driverRoutes from './routes/driver.routes';
import setupRoutes from './routes/setup.routes';
import analyticsRoutes from './routes/analytics.routes';
import adminRoutes from './routes/admin.routes';
import weatherRoutes from './routes/weather.routes';
import partRoutes from './routes/part.routes';
import uploadRoutes from './routes/upload.routes';
import metricsRoutes from './routes/metrics.routes';
import notificationRoutes from './routes/notification.routes';

const app: Express = express();
const port = process.env['PORT'] ?? 3000;

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigin = process.env['CORS_ORIGIN'] ?? 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin, credentials: true }));

// ── Structured HTTP request logging (Pino) ───────────────────────────────────
app.use(
  pinoHttp({
    logger,
    // Skip health-check and metrics scrape noise in logs
    autoLogging: {
      ignore: (req) =>
        req.url === '/health' || req.url === '/api/status',
    },
    customLogLevel(_req, res, err) {
      if (err || res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
    serializers: {
      req(req) {
        return {
          method: req.method,
          url: req.url,
          remoteAddress: req.remoteAddress,
        };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

// ── In-process Prometheus metrics collection ─────────────────────────────────
app.use(metricsMiddleware);

// ── Body parsers ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check (legacy — kept for backwards compatibility) ─────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Motorsports Management API is running',
    timestamp: new Date().toISOString(),
  });
});

// ── API info ─────────────────────────────────────────────────────────────────
app.get('/api', (_req: Request, res: Response) => {
  res.json({
    message: 'Motorsports Management API',
    version: process.env['APP_VERSION'] ?? '1.0.0',
    endpoints: {
      auth: '/api/auth',
      vehicles: '/api/vehicles',
      events: '/api/events',
      drivers: '/api/drivers',
      setups: '/api/setups',
      analytics: '/api/analytics',
      admin: '/api/admin',
      weather: '/api/events/:id/weather',
      parts: '/api/parts',
      uploads: '/api/uploads',
      notifications: '/api/notifications',
      status: '/api/status',
      metrics: '/api/metrics',
    },
  });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/setups', setupRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events/:id/weather', weatherRoutes);
app.use('/api/parts', partRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/notifications', notificationRoutes);

// Monitoring & observability routes (/api/status, /api/metrics, /api/metrics/json)
app.use('/api', metricsRoutes);

// ── HTTP server + Socket.IO ───────────────────────────────────────────────────
const httpServer = http.createServer(app);
initSocketIO(httpServer);

// ── Start server ──────────────────────────────────────────────────────────────
httpServer.listen(port, () => {
  logger.info({ port }, '⚡️ Motorsports Management API is running');
  logger.info('🏁 Motorsports Management API initialised');
  logger.info('🔐 Authentication endpoints available at /api/auth');
  logger.info('👑 Admin endpoints available at /api/admin');
  logger.info('📊 Metrics endpoint available at /api/metrics (admin only)');
  logger.info('🩺 Status endpoint available at /api/status (public)');
  logger.info('🔔 Notifications endpoint available at /api/notifications');
  logger.info('🔌 Socket.IO real-time server active');
});

export default app;
