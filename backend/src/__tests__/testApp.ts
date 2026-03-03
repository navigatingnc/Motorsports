/**
 * Creates an Express app instance wired with all routes but WITHOUT calling
 * app.listen(). This allows Supertest to bind to an ephemeral port for each
 * test suite without port conflicts.
 */
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import vehicleRoutes from '../routes/vehicle.routes';
import eventRoutes from '../routes/event.routes';
import authRoutes from '../routes/auth.routes';
import driverRoutes from '../routes/driver.routes';
import setupRoutes from '../routes/setup.routes';
import analyticsRoutes from '../routes/analytics.routes';
import adminRoutes from '../routes/admin.routes';
import partRoutes from '../routes/part.routes';

export function createTestApp(): Express {
  const app: Express = express();

  app.use(cors({ origin: '*', credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'Test server running' });
  });

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/vehicles', vehicleRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/drivers', driverRoutes);
  app.use('/api/setups', setupRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/parts', partRoutes);

  return app;
}
