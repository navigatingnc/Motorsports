# Changelog: Motorsports Management Web App

This log tracks the development progress of the motorsports management application. Each entry corresponds to a completed phase from the `project_plan.md`.

---

## Phase 1: Backend Project & DB Setup
**Status:** ✅ Completed  
**Date:** February 16, 2026

### Summary
Successfully initialized the backend Node.js/TypeScript project with Express.js and connected it to a PostgreSQL database using Prisma ORM. The development environment is now fully configured and ready for API development.

### Work Performed

1. **Project Initialization**
   - Created `backend/` directory
   - Initialized Node.js project with pnpm
   - Configured TypeScript with appropriate settings for Express

2. **Dependencies Installed**
   - **Runtime:** express, cors, dotenv
   - **Development:** typescript, @types/node, @types/express, @types/cors, ts-node, nodemon
   - **Database:** prisma, @prisma/client

3. **Database Setup**
   - Installed PostgreSQL 14 on the system
   - Created database `motorsports_db` with user `motorsports`
   - Initialized Prisma with PostgreSQL datasource
   - Configured database connection string in `.env`
   - Generated Prisma Client

4. **Server Configuration**
   - Created Express server entry point (`src/index.ts`)
   - Configured CORS and JSON middleware
   - Added health check endpoint (`/health`)
   - Created Prisma client singleton (`src/prisma.ts`)

5. **Development Scripts**
   - `pnpm dev` - Development server with hot reload
   - `pnpm build` - TypeScript compilation
   - `pnpm start` - Production server
   - `pnpm prisma:generate` - Generate Prisma Client
   - `pnpm prisma:migrate` - Run migrations
   - `pnpm prisma:push` - Push schema to database

6. **Documentation**
   - Created comprehensive README.md with setup instructions
   - Documented API endpoints and project structure

### Code Generated

#### `backend/src/index.ts`
```typescript
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

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

// API routes will be added here
app.get('/api', (req: Request, res: Response) => {
  res.json({ 
    message: 'Motorsports Management API',
    version: '1.0.0'
  });
});

// Start server
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  console.log(`🏁[motorsports]: Diamond Apex Collective API initialized`);
});

export default app;
```

#### `backend/src/prisma.ts`
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

export default prisma;
```

#### `backend/docker-compose.yml`
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: motorsports_db
    restart: always
    environment:
      POSTGRES_USER: motorsports
      POSTGRES_PASSWORD: motorsports_dev_password
      POSTGRES_DB: motorsports_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

#### `backend/.env`
```env
# Database connection string
DATABASE_URL="postgresql://motorsports:motorsports_dev_password@localhost:5432/motorsports_db?schema=public"

# Server configuration
PORT=3000
NODE_ENV=development
```

#### `backend/tsconfig.json`
```json
{
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
    "module": "commonjs",
    "target": "esnext",
    "types": ["node"],
    "lib": ["esnext"],
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "strict": true,
    "jsx": "react-jsx",
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "noUncheckedSideEffectImports": true,
    "moduleDetection": "force",
    "skipLibCheck": true
  }
}
```

### Testing
The server can be started with `pnpm dev` and tested at:
- Health check: `http://localhost:3000/health`
- API info: `http://localhost:3000/api`

### Next Phase Preview
Phase 2 will implement the `Vehicle` model in Prisma and create full CRUD API endpoints for vehicle management.

---

## Phase 2: Backend: Vehicle Model & API
**Status:** ✅ Completed  
**Date:** February 17, 2026

### Summary
Successfully implemented the `Vehicle` model in Prisma and created a complete RESTful API with full CRUD operations. The API includes comprehensive input validation, error handling, and proper HTTP status codes. All endpoints are now accessible at `/api/vehicles`.

### Work Performed

1. **Database Schema**
   - Defined `Vehicle` model in `schema.prisma` with the following fields:
     - `id` (UUID, primary key)
     - `make` (string, required)
     - `model` (string, required)
     - `year` (integer, required)
     - `category` (string, required) - e.g., "Formula", "GT", "Rally"
     - `number` (string, optional) - Racing number
     - `vin` (string, optional, unique) - Vehicle Identification Number
     - `notes` (text, optional)
     - `createdAt` (timestamp, auto-generated)
     - `updatedAt` (timestamp, auto-updated)

2. **Database Migration**
   - Created and applied migration `20260217060758_add_vehicle_model`
   - Generated Prisma Client with Vehicle model
   - Added unique constraint on VIN field

3. **API Implementation**
   - Created TypeScript type definitions for Vehicle DTOs
   - Implemented vehicle controller with five endpoints:
     - `GET /api/vehicles` - Retrieve all vehicles
     - `GET /api/vehicles/:id` - Retrieve single vehicle by ID
     - `POST /api/vehicles` - Create new vehicle
     - `PUT /api/vehicles/:id` - Update existing vehicle
     - `DELETE /api/vehicles/:id` - Delete vehicle
   - Added comprehensive validation for required fields and year range
   - Implemented proper error handling for database constraints

4. **Code Organization**
   - Created modular directory structure:
     - `src/types/` - TypeScript type definitions
     - `src/controllers/` - Business logic and request handlers
     - `src/routes/` - Express route definitions
   - Integrated vehicle routes into main Express application

5. **Configuration Updates**
   - Updated `tsconfig.json` to properly compile TypeScript with strict mode
   - Configured Prisma client output path to `src/generated/prisma`
   - Created `.env` file with database connection string

### Code Generated

#### `backend/prisma/schema.prisma`
```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?
// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init

generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model Vehicle {
  id          String   @id @default(uuid())
  make        String
  model       String
  year        Int
  category    String   // e.g., "Formula", "GT", "Rally", etc.
  number      String?  // Racing number
  vin         String?  @unique // Vehicle Identification Number
  notes       String?  @db.Text
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("vehicles")
}
```

#### `backend/prisma/migrations/20260217060758_add_vehicle_model/migration.sql`
```sql
-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "number" TEXT,
    "vin" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_vin_key" ON "vehicles"("vin");
```

#### `backend/src/types/vehicle.types.ts`
```typescript
export interface CreateVehicleDto {
  make: string;
  model: string;
  year: number;
  category: string;
  number?: string;
  vin?: string;
  notes?: string;
}

export interface UpdateVehicleDto {
  make?: string;
  model?: string;
  year?: number;
  category?: string;
  number?: string;
  vin?: string;
  notes?: string;
}
```

#### `backend/src/controllers/vehicle.controller.ts`
```typescript
import { Request, Response } from 'express';
import prisma from '../prisma';
import { CreateVehicleDto, UpdateVehicleDto } from '../types/vehicle.types';

/**
 * Get all vehicles
 */
export const getAllVehicles = async (req: Request, res: Response): Promise<void> => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: vehicles,
      count: vehicles.length,
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vehicles',
    });
  }
};

/**
 * Get a single vehicle by ID
 */
export const getVehicleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      res.status(404).json({
        success: false,
        error: 'Vehicle not found',
      });
      return;
    }

    res.json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vehicle',
    });
  }
};

/**
 * Create a new vehicle
 */
export const createVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const vehicleData: CreateVehicleDto = req.body;

    // Validate required fields
    if (!vehicleData.make || !vehicleData.model || !vehicleData.year || !vehicleData.category) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: make, model, year, and category are required',
      });
      return;
    }

    // Validate year
    if (vehicleData.year < 1900 || vehicleData.year > new Date().getFullYear() + 1) {
      res.status(400).json({
        success: false,
        error: 'Invalid year',
      });
      return;
    }

    const vehicle = await prisma.vehicle.create({
      data: vehicleData,
    });

    res.status(201).json({
      success: true,
      data: vehicle,
      message: 'Vehicle created successfully',
    });
  } catch (error: any) {
    console.error('Error creating vehicle:', error);
    
    // Handle unique constraint violation for VIN
    if (error.code === 'P2002' && error.meta?.target?.includes('vin')) {
      res.status(409).json({
        success: false,
        error: 'A vehicle with this VIN already exists',
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create vehicle',
    });
  }
};

/**
 * Update a vehicle
 */
export const updateVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const updateData: UpdateVehicleDto = req.body;

    // Validate year if provided
    if (updateData.year && (updateData.year < 1900 || updateData.year > new Date().getFullYear() + 1)) {
      res.status(400).json({
        success: false,
        error: 'Invalid year',
      });
      return;
    }

    // Check if vehicle exists
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id },
    });

    if (!existingVehicle) {
      res.status(404).json({
        success: false,
        error: 'Vehicle not found',
      });
      return;
    }

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      data: vehicle,
      message: 'Vehicle updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating vehicle:', error);
    
    // Handle unique constraint violation for VIN
    if (error.code === 'P2002' && error.meta?.target?.includes('vin')) {
      res.status(409).json({
        success: false,
        error: 'A vehicle with this VIN already exists',
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update vehicle',
    });
  }
};

/**
 * Delete a vehicle
 */
export const deleteVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    // Check if vehicle exists
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id },
    });

    if (!existingVehicle) {
      res.status(404).json({
        success: false,
        error: 'Vehicle not found',
      });
      return;
    }

    await prisma.vehicle.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Vehicle deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete vehicle',
    });
  }
};
```

#### `backend/src/routes/vehicle.routes.ts`
```typescript
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
```

#### Updated `backend/src/index.ts`
```typescript
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import vehicleRoutes from './routes/vehicle.routes';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

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

// API routes
app.get('/api', (req: Request, res: Response) => {
  res.json({ 
    message: 'Motorsports Management API',
    version: '1.0.0'
  });
});

// Vehicle routes
app.use('/api/vehicles', vehicleRoutes);

// Start server
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  console.log(`🏁[motorsports]: Motorsports Management API initialized`);
});

export default app;
```

#### Updated `backend/src/prisma.ts`
```typescript
import { PrismaClient } from './generated/prisma';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

export default prisma;
```

### API Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/api/vehicles` | Get all vehicles | - |
| GET | `/api/vehicles/:id` | Get vehicle by ID | - |
| POST | `/api/vehicles` | Create new vehicle | `{ make, model, year, category, number?, vin?, notes? }` |
| PUT | `/api/vehicles/:id` | Update vehicle | `{ make?, model?, year?, category?, number?, vin?, notes? }` |
| DELETE | `/api/vehicles/:id` | Delete vehicle | - |

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { /* vehicle object */ },
  "message": "Operation completed successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message description"
}
```

### Testing
The API can be tested using tools like Postman, curl, or Thunder Client:

```bash
# Get all vehicles
curl http://localhost:3000/api/vehicles

# Create a vehicle
curl -X POST http://localhost:3000/api/vehicles \
  -H "Content-Type: application/json" \
  -d '{"make":"Porsche","model":"911 GT3","year":2024,"category":"GT"}'

# Get a specific vehicle
curl http://localhost:3000/api/vehicles/{id}

# Update a vehicle
curl -X PUT http://localhost:3000/api/vehicles/{id} \
  -H "Content-Type: application/json" \
  -d '{"number":"42"}'

# Delete a vehicle
curl -X DELETE http://localhost:3000/api/vehicles/{id}
```

### Next Phase Preview
Phase 3 will initialize the React frontend project with Vite and TypeScript, and create a `VehicleListPage` component to fetch and display vehicles from the API.

---

---

## Phase 3: Frontend: Project Setup & Vehicle List
**Status:** ✅ Completed  
**Date:** February 18, 2026

### Summary
Successfully initialized the React frontend application using Vite and TypeScript. Implemented the core architecture including API integration with Axios, routing with React Router, and created the VehicleListPage component to display vehicles fetched from the backend API. The application features a responsive design with a motorsports-themed interface.

### Work Performed

1. **Project Initialization**
   - Created React project with Vite and TypeScript template
   - Configured project structure with proper directories
   - Set up development environment with hot module replacement

2. **Dependencies Installed**
   - **Core:** react, react-dom
   - **Routing:** react-router-dom
   - **HTTP Client:** axios
   - **Build Tool:** vite
   - **TypeScript:** @types/react, @types/react-dom

3. **Type Definitions**
   - Created `Vehicle` interface matching backend schema
   - Defined `CreateVehicleDto` for vehicle creation
   - Ensured type safety across all components and services

4. **API Integration**
   - Implemented base Axios instance with configurable base URL
   - Created request interceptor for adding JWT authentication tokens
   - Created response interceptor for handling 401 unauthorized errors
   - Built `vehicleService` with all CRUD operations:
     - `getAllVehicles()` - Fetch all vehicles
     - `getVehicleById(id)` - Fetch single vehicle
     - `createVehicle(data)` - Create new vehicle
     - `updateVehicle(id, data)` - Update existing vehicle
     - `deleteVehicle(id)` - Delete vehicle

5. **Component Development**
   - Created `VehicleListPage` component with:
     - Data fetching using useEffect hook
     - Loading and error states
     - Empty state for no vehicles
     - Vehicle grid display with cards
     - Delete functionality with confirmation
     - Navigation links to detail and edit pages (placeholders)
   - Built main `App` component with:
     - React Router configuration
     - Navigation bar with branding
     - Route definitions for all pages
     - Redirect from root to vehicles list

6. **Styling**
   - Designed comprehensive CSS with CSS custom properties
   - Implemented motorsports color scheme (red #e10600, black #1a1a1a)
   - Created responsive grid layout for vehicle cards
   - Added hover effects and transitions
   - Ensured mobile-friendly design with media queries
   - Styled navigation bar, buttons, and cards

7. **Configuration**
   - Created `.env` file for environment variables
   - Set up `VITE_API_BASE_URL` for backend connection
   - Added `.env.example` as template
   - Configured Vite for development and production builds

8. **Documentation**
   - Created comprehensive README.md with:
     - Project overview and features
     - Tech stack details
     - Installation and setup instructions
     - Development and build commands
     - Project structure documentation
     - API integration notes

### Code Generated

#### `frontend/src/types/vehicle.ts`
```typescript
export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  category: string;
  number?: string;
  vin?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicleDto {
  make: string;
  model: string;
  year: number;
  category: string;
  number?: string;
  vin?: string;
  notes?: string;
}
```

#### `frontend/src/services/api.ts`
```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

#### `frontend/src/services/vehicleService.ts`
```typescript
import api from './api';
import { Vehicle, CreateVehicleDto } from '../types/vehicle';

export const vehicleService = {
  // Get all vehicles
  getAllVehicles: async (): Promise<Vehicle[]> => {
    const response = await api.get<Vehicle[]>('/api/vehicles');
    return response.data;
  },

  // Get vehicle by ID
  getVehicleById: async (id: string): Promise<Vehicle> => {
    const response = await api.get<Vehicle>(`/api/vehicles/${id}`);
    return response.data;
  },

  // Create new vehicle
  createVehicle: async (data: CreateVehicleDto): Promise<Vehicle> => {
    const response = await api.post<Vehicle>('/api/vehicles', data);
    return response.data;
  },

  // Update vehicle
  updateVehicle: async (id: string, data: Partial<CreateVehicleDto>): Promise<Vehicle> => {
    const response = await api.put<Vehicle>(`/api/vehicles/${id}`, data);
    return response.data;
  },

  // Delete vehicle
  deleteVehicle: async (id: string): Promise<void> => {
    await api.delete(`/api/vehicles/${id}`);
  },
};
```

#### `frontend/src/pages/VehicleListPage.tsx`
```typescript
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { vehicleService } from '../services/vehicleService';
import { Vehicle } from '../types/vehicle';

const VehicleListPage = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await vehicleService.getAllVehicles();
      setVehicles(data);
    } catch (err) {
      setError('Failed to fetch vehicles. Please try again later.');
      console.error('Error fetching vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) {
      return;
    }

    try {
      await vehicleService.deleteVehicle(id);
      setVehicles(vehicles.filter((vehicle) => vehicle.id !== id));
    } catch (err) {
      setError('Failed to delete vehicle. Please try again.');
      console.error('Error deleting vehicle:', err);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading vehicles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">{error}</div>
        <button onClick={fetchVehicles} className="btn-retry">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Vehicles</h1>
        <Link to="/vehicles/new" className="btn-primary">
          Add New Vehicle
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <div className="empty-state">
          <p>No vehicles found. Add your first vehicle to get started.</p>
        </div>
      ) : (
        <div className="vehicle-grid">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="vehicle-card">
              <div className="vehicle-card-header">
                <h3>
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h3>
                {vehicle.number && (
                  <span className="vehicle-number">#{vehicle.number}</span>
                )}
              </div>
              <div className="vehicle-card-body">
                <p className="vehicle-category">{vehicle.category}</p>
                {vehicle.vin && (
                  <p className="vehicle-vin">VIN: {vehicle.vin}</p>
                )}
                {vehicle.notes && (
                  <p className="vehicle-notes">{vehicle.notes}</p>
                )}
              </div>
              <div className="vehicle-card-footer">
                <Link to={`/vehicles/${vehicle.id}`} className="btn-secondary">
                  View Details
                </Link>
                <Link to={`/vehicles/${vehicle.id}/edit`} className="btn-secondary">
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(vehicle.id)}
                  className="btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VehicleListPage;
```

#### `frontend/src/App.tsx`
```typescript
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import VehicleListPage from './pages/VehicleListPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="navbar-container">
            <h1 className="navbar-brand">🏁 Motorsports Management</h1>
          </div>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/vehicles" replace />} />
            <Route path="/vehicles" element={<VehicleListPage />} />
            {/* Placeholder routes for future phases */}
            <Route path="/vehicles/:id" element={<div>Vehicle Detail (Coming Soon)</div>} />
            <Route path="/vehicles/:id/edit" element={<div>Edit Vehicle (Coming Soon)</div>} />
            <Route path="/vehicles/new" element={<div>New Vehicle (Coming Soon)</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
```

#### `frontend/.env`
```env
VITE_API_BASE_URL=http://localhost:3000
```

#### `frontend/package.json`
```json
{
  "name": "frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.13.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^7.13.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.11",
    "@types/react-dom": "^19.0.3",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "~5.8.3",
    "vite": "^7.3.1"
  }
}
```

### Testing
The frontend can be started with `pnpm dev` and accessed at `http://localhost:5173`. It will connect to the backend API at `http://localhost:3000` to fetch and display vehicles.

**Key Features Verified:**
- React application loads successfully
- Routing works correctly with React Router
- API service is configured with interceptors
- VehicleListPage component structure is complete
- Responsive CSS styling is applied
- Environment variables are properly configured

### Next Phase Preview
Phase 4 will implement the `Event` model in the backend Prisma schema and create full CRUD API endpoints for event management, including relationships with vehicles.

