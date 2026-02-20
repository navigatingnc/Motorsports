import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import vehicleRoutes from './routes/vehicle.routes';
import eventRoutes from './routes/event.routes';
import authRoutes from './routes/auth.routes';
import driverRoutes from './routes/driver.routes';

dotenv.config();

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
    }
  });
});

// Auth routes (public)
app.use('/api/auth', authRoutes);

// Vehicle routes
app.use('/api/vehicles', vehicleRoutes);

// Event routes
app.use('/api/events', eventRoutes);

// Driver routes (protected)
app.use('/api/drivers', driverRoutes);

// Start server
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  console.log(`🏁[motorsports]: Motorsports Management API initialized`);
  console.log(`🔐[auth]: Authentication endpoints available at /api/auth`);
});

export default app;
