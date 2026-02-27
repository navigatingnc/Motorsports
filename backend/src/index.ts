import dotenv from 'dotenv';
dotenv.config();

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
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

const app: Express = express();
const port = process.env['PORT'] || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    message: 'Motorsports Management API is running',
    timestamp: new Date().toISOString()
  });
});

// API info endpoint
app.get('/api', (req: Request, res: Response) => {
  res.json({ 
    message: 'Motorsports Management API',
    version: '1.0.0',
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
    }
  });
});

// Auth routes (public)
app.use('/api/auth', authRoutes);

// Vehicle routes (protected)
app.use('/api/vehicles', vehicleRoutes);

// Event routes (protected)
app.use('/api/events', eventRoutes);

// Driver routes (protected)
app.use('/api/drivers', driverRoutes);

// Setup sheet routes (protected)
app.use('/api/setups', setupRoutes);

// Analytics routes (protected)
app.use('/api/analytics', analyticsRoutes);

// Admin routes (admin only)
app.use('/api/admin', adminRoutes);

// Weather routes — nested under events (protected)
app.use('/api/events/:id/weather', weatherRoutes);

// Parts / Inventory routes (protected)
app.use('/api/parts', partRoutes);
// File upload routes (protected)
app.use('/api/uploads', uploadRoutes);

// Start server
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  console.log(`🏁[motorsports]: Motorsports Management API initialized`);
  console.log(`🔐[auth]: Authentication endpoints available at /api/auth`);
  console.log(`👑[admin]: Admin endpoints available at /api/admin`);
});

export default app;
