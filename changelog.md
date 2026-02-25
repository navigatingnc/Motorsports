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


---

## Phase 4: Backend: Event Model & API
**Status:** ✅ Completed  
**Date:** February 19, 2026

### Summary
Successfully implemented the `Event` model in Prisma and created a complete RESTful API with full CRUD operations for motorsports event management. The API includes comprehensive input validation (including date range validation), error handling, and proper HTTP status codes. All endpoints are accessible at `/api/events`. Additionally, the Prisma client was upgraded to use the `@prisma/adapter-pg` driver adapter required by Prisma ORM v7's new TypeScript-based engine.

### Work Performed

1. **Database Schema**
   - Defined `Event` model in `schema.prisma` with the following fields:
     - `id` (UUID, primary key)
     - `name` (string, required) - Event name
     - `type` (string, required) - e.g., "Race", "Qualifying", "Practice", "Test Day"
     - `venue` (string, required) - Venue/track name
     - `location` (string, required) - City/state/country
     - `startDate` (DateTime, required) - Event start date and time
     - `endDate` (DateTime, required) - Event end date and time
     - `status` (string, default "Upcoming") - "Upcoming", "In Progress", "Completed", "Cancelled"
     - `description` (text, optional)
     - `notes` (text, optional)
     - `createdAt` (timestamp, auto-generated)
     - `updatedAt` (timestamp, auto-updated)

2. **Database Migration**
   - Created and applied migration `20260219060632_add_event_model`
   - Generated Prisma Client with Event model

3. **API Implementation**
   - Created TypeScript type definitions for Event DTOs
   - Implemented event controller with five endpoints:
     - `GET /api/events` - Retrieve all events (ordered by startDate ascending)
     - `GET /api/events/:id` - Retrieve single event by ID
     - `POST /api/events` - Create new event
     - `PUT /api/events/:id` - Update existing event
     - `DELETE /api/events/:id` - Delete event
   - Added comprehensive validation for required fields, ISO 8601 date formats, and date range (endDate >= startDate)
   - Validated status values against allowed enum: Upcoming, In Progress, Completed, Cancelled

4. **Prisma v7 Driver Adapter**
   - Installed `@prisma/adapter-pg` and `pg` packages required by Prisma ORM v7
   - Updated `src/prisma.ts` to instantiate `PrismaPg` adapter and pass it to `PrismaClient`
   - Fixed `prisma.config.js` to use `module.exports` instead of `exports.default` to resolve config parsing issue

5. **Code Organization**
   - Created `src/types/event.types.ts` - TypeScript DTOs and validation constants
   - Created `src/controllers/event.controller.ts` - Business logic and request handlers
   - Created `src/routes/event.routes.ts` - Express route definitions
   - Updated `src/index.ts` to register `/api/events` route

### Code Generated

#### `backend/prisma/schema.prisma` (updated)
```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

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

model Event {
  id          String    @id @default(uuid())
  name        String
  type        String    // e.g., "Race", "Qualifying", "Practice", "Test Day"
  venue       String
  location    String
  startDate   DateTime
  endDate     DateTime
  status      String    @default("Upcoming") // "Upcoming", "In Progress", "Completed", "Cancelled"
  description String?   @db.Text
  notes       String?   @db.Text
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@map("events")
}
```

#### `backend/prisma/migrations/20260219060632_add_event_model/migration.sql`
```sql
-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Upcoming',
    "description" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);
```

#### `backend/src/types/event.types.ts`
```typescript
export interface CreateEventDto {
  name: string;
  type: string;
  venue: string;
  location: string;
  startDate: string | Date;
  endDate: string | Date;
  status?: string;
  description?: string;
  notes?: string;
}

export interface UpdateEventDto {
  name?: string;
  type?: string;
  venue?: string;
  location?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  status?: string;
  description?: string;
  notes?: string;
}

export const VALID_EVENT_TYPES = ['Race', 'Qualifying', 'Practice', 'Test Day', 'Track Day', 'Other'] as const;
export const VALID_EVENT_STATUSES = ['Upcoming', 'In Progress', 'Completed', 'Cancelled'] as const;
```

#### `backend/src/controllers/event.controller.ts`
```typescript
import { Request, Response } from 'express';
import prisma from '../prisma';
import { CreateEventDto, UpdateEventDto, VALID_EVENT_STATUSES } from '../types/event.types';

/**
 * Get all events
 */
export const getAllEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        startDate: 'asc',
      },
    });

    res.json({
      success: true,
      data: events,
      count: events.length,
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events',
    });
  }
};

/**
 * Get a single event by ID
 */
export const getEventById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      res.status(404).json({
        success: false,
        error: 'Event not found',
      });
      return;
    }

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch event',
    });
  }
};

/**
 * Create a new event
 */
export const createEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const eventData: CreateEventDto = req.body;

    // Validate required fields
    if (
      !eventData.name ||
      !eventData.type ||
      !eventData.venue ||
      !eventData.location ||
      !eventData.startDate ||
      !eventData.endDate
    ) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: name, type, venue, location, startDate, and endDate are required',
      });
      return;
    }

    // Parse and validate dates
    const startDate = new Date(eventData.startDate);
    const endDate = new Date(eventData.endDate);

    if (isNaN(startDate.getTime())) {
      res.status(400).json({
        success: false,
        error: 'Invalid startDate format. Use ISO 8601 format (e.g., 2026-03-15T09:00:00Z)',
      });
      return;
    }

    if (isNaN(endDate.getTime())) {
      res.status(400).json({
        success: false,
        error: 'Invalid endDate format. Use ISO 8601 format (e.g., 2026-03-15T17:00:00Z)',
      });
      return;
    }

    if (endDate < startDate) {
      res.status(400).json({
        success: false,
        error: 'endDate must be on or after startDate',
      });
      return;
    }

    // Validate status if provided
    if (eventData.status && !VALID_EVENT_STATUSES.includes(eventData.status as (typeof VALID_EVENT_STATUSES)[number])) {
      res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${VALID_EVENT_STATUSES.join(', ')}`,
      });
      return;
    }

    const event = await prisma.event.create({
      data: {
        name: eventData.name,
        type: eventData.type,
        venue: eventData.venue,
        location: eventData.location,
        startDate,
        endDate,
        status: eventData.status ?? 'Upcoming',
        description: eventData.description ?? null,
        notes: eventData.notes ?? null,
      },
    });

    res.status(201).json({
      success: true,
      data: event,
      message: 'Event created successfully',
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create event',
    });
  }
};

/**
 * Update an event
 */
export const updateEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const updateData: UpdateEventDto = req.body;

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      res.status(404).json({
        success: false,
        error: 'Event not found',
      });
      return;
    }

    // Parse and validate dates if provided
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (updateData.startDate !== undefined) {
      startDate = new Date(updateData.startDate);
      if (isNaN(startDate.getTime())) {
        res.status(400).json({
          success: false,
          error: 'Invalid startDate format. Use ISO 8601 format (e.g., 2026-03-15T09:00:00Z)',
        });
        return;
      }
    }

    if (updateData.endDate !== undefined) {
      endDate = new Date(updateData.endDate);
      if (isNaN(endDate.getTime())) {
        res.status(400).json({
          success: false,
          error: 'Invalid endDate format. Use ISO 8601 format (e.g., 2026-03-15T17:00:00Z)',
        });
        return;
      }
    }

    // Validate date range
    const effectiveStart = startDate ?? existingEvent.startDate;
    const effectiveEnd = endDate ?? existingEvent.endDate;

    if (effectiveEnd < effectiveStart) {
      res.status(400).json({
        success: false,
        error: 'endDate must be on or after startDate',
      });
      return;
    }

    // Validate status if provided
    if (updateData.status && !VALID_EVENT_STATUSES.includes(updateData.status as (typeof VALID_EVENT_STATUSES)[number])) {
      res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${VALID_EVENT_STATUSES.join(', ')}`,
      });
      return;
    }

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...(updateData.name !== undefined && { name: updateData.name }),
        ...(updateData.type !== undefined && { type: updateData.type }),
        ...(updateData.venue !== undefined && { venue: updateData.venue }),
        ...(updateData.location !== undefined && { location: updateData.location }),
        ...(startDate !== undefined && { startDate }),
        ...(endDate !== undefined && { endDate }),
        ...(updateData.status !== undefined && { status: updateData.status }),
        ...(updateData.description !== undefined && { description: updateData.description }),
        ...(updateData.notes !== undefined && { notes: updateData.notes }),
      },
    });

    res.json({
      success: true,
      data: event,
      message: 'Event updated successfully',
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update event',
    });
  }
};

/**
 * Delete an event
 */
export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      res.status(404).json({
        success: false,
        error: 'Event not found',
      });
      return;
    }

    await prisma.event.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete event',
    });
  }
};
```

#### `backend/src/routes/event.routes.ts`
```typescript
import { Router } from 'express';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/event.controller';

const router: Router = Router();

// GET /api/events - Get all events
router.get('/', getAllEvents);

// GET /api/events/:id - Get a single event by ID
router.get('/:id', getEventById);

// POST /api/events - Create a new event
router.post('/', createEvent);

// PUT /api/events/:id - Update an event
router.put('/:id', updateEvent);

// DELETE /api/events/:id - Delete an event
router.delete('/:id', deleteEvent);

export default router;
```

#### Updated `backend/src/index.ts`
```typescript
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import vehicleRoutes from './routes/vehicle.routes';
import eventRoutes from './routes/event.routes';

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

// Event routes
app.use('/api/events', eventRoutes);

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
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env['DATABASE_URL'] ?? '';

const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({ adapter });

export default prisma;
```

### API Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/api/events` | Get all events (sorted by startDate) | - |
| GET | `/api/events/:id` | Get event by ID | - |
| POST | `/api/events` | Create new event | `{ name, type, venue, location, startDate, endDate, status?, description?, notes? }` |
| PUT | `/api/events/:id` | Update event | `{ name?, type?, venue?, location?, startDate?, endDate?, status?, description?, notes? }` |
| DELETE | `/api/events/:id` | Delete event | - |

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { /* event object */ },
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
# Get all events
curl http://localhost:3000/api/events

# Create an event
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{"name":"Daytona 500","type":"Race","venue":"Daytona International Speedway","location":"Daytona Beach, FL","startDate":"2026-02-16T14:00:00Z","endDate":"2026-02-16T18:00:00Z"}'

# Get a specific event
curl http://localhost:3000/api/events/{id}

# Update an event
curl -X PUT http://localhost:3000/api/events/{id} \
  -H "Content-Type: application/json" \
  -d '{"status":"Completed"}'

# Delete an event
curl -X DELETE http://localhost:3000/api/events/{id}
```

### Next Phase Preview
Phase 5 will implement the frontend Event List and Event Detail pages using React, displaying events fetched from the `/api/events` endpoint.

---

---

## Phase 5: Frontend: Event List & Detail View
**Status:** ✅ Completed  
**Date:** February 20, 2026

### Summary
Implemented the full frontend event browsing experience. Created TypeScript type definitions for the `Event` entity, an `eventService` for communicating with the `/api/events` backend endpoints, an `EventListPage` that displays all events as styled cards with status badges, and an `EventDetailPage` that renders a complete structured view of a single event. Updated `App.tsx` to register all event routes and added a responsive navbar with active-link highlighting. Extended `App.css` with all required event and detail-page styles, and fixed `tsconfig.json` to include JSX support.

### Work Performed

1. **Type Definitions** — `frontend/src/types/event.ts`
   - Defined `Event` interface mirroring the Prisma `Event` model (id, name, type, venue, location, startDate, endDate, status, description, notes, createdAt, updatedAt)
   - Defined `CreateEventDto` interface for POST/PUT payloads
   - Exported `EventType` and `EventStatus` union types for type-safe usage

2. **Event Service** — `frontend/src/services/eventService.ts`
   - `getAllEvents()` — GET `/api/events`
   - `getEventById(id)` — GET `/api/events/:id`
   - `createEvent(data)` — POST `/api/events`
   - `updateEvent(id, data)` — PUT `/api/events/:id`
   - `deleteEvent(id)` — DELETE `/api/events/:id`

3. **EventListPage** — `frontend/src/pages/EventListPage.tsx`
   - Fetches all events on mount with loading and error states
   - Renders each event as a card showing name, type badge, status badge, venue, location, date range, and description
   - Delete action with confirmation dialog and optimistic UI update
   - Links to detail and edit pages; "Add New Event" button

4. **EventDetailPage** — `frontend/src/pages/EventDetailPage.tsx`
   - Fetches a single event by URL param `id`
   - Breadcrumb navigation back to the event list
   - Structured detail grid: Event Details card, Additional Information card, Record Information card
   - Displays all fields including formatted dates, status/type badges, notes, and record metadata
   - Delete action with confirmation that redirects to `/events` on success

5. **App.tsx Routing Update**
   - Added `NavLink`-based navbar with active-state highlighting for Vehicles and Events
   - Registered `/events` → `EventListPage` and `/events/:id` → `EventDetailPage`
   - Added placeholder routes for `/events/new` and `/events/:id/edit`

6. **App.css Style Additions**
   - Navbar flex layout (`.navbar-container--flex`, `.navbar-nav`, `.nav-link`, `.nav-link--active`)
   - Event list and card styles (`.event-list`, `.event-card`, `.event-card-header`, `.event-card-body`, `.event-card-footer`)
   - Event type and status badge styles (`.event-type-badge`, `.event-status-badge`, `.status-upcoming`, `.status-in-progress`, `.status-completed`, `.status-cancelled`)
   - Event meta display (`.event-meta`, `.event-meta-item`, `.event-meta-label`, `.event-meta-value`)
   - Detail page layout (`.detail-page-header`, `.detail-grid`, `.detail-card`, `.detail-field-list`, `.detail-field`, `.breadcrumb-link`)
   - Full responsive breakpoints for all new components

7. **tsconfig.json Fix**
   - Added `"jsx": "react-jsx"` to enable JSX compilation in TypeScript

8. **verbatimModuleSyntax Fixes**
   - Updated `VehicleListPage.tsx` and `vehicleService.ts` to use `import type` for type-only imports

### Code Generated

#### `frontend/src/types/event.ts`
```typescript
export interface Event {
  id: string;
  name: string;
  type: string;
  venue: string;
  location: string;
  startDate: string;
  endDate: string;
  status: string;
  description?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventDto {
  name: string;
  type: string;
  venue: string;
  location: string;
  startDate: string;
  endDate: string;
  status?: string;
  description?: string;
  notes?: string;
}

export type EventType = 'Race' | 'Qualifying' | 'Practice' | 'Test Day' | 'Track Day' | 'Other';
export type EventStatus = 'Upcoming' | 'In Progress' | 'Completed' | 'Cancelled';
```

#### `frontend/src/services/eventService.ts`
```typescript
import api from './api';
import type { Event, CreateEventDto } from '../types/event';

export const eventService = {
  getAllEvents: async (): Promise<Event[]> => {
    const response = await api.get<Event[]>('/api/events');
    return response.data;
  },
  getEventById: async (id: string): Promise<Event> => {
    const response = await api.get<Event>(`/api/events/${id}`);
    return response.data;
  },
  createEvent: async (data: CreateEventDto): Promise<Event> => {
    const response = await api.post<Event>('/api/events', data);
    return response.data;
  },
  updateEvent: async (id: string, data: Partial<CreateEventDto>): Promise<Event> => {
    const response = await api.put<Event>(`/api/events/${id}`, data);
    return response.data;
  },
  deleteEvent: async (id: string): Promise<void> => {
    await api.delete(`/api/events/${id}`);
  },
};
```

#### `frontend/src/pages/EventListPage.tsx`
```typescript
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../services/eventService';
import type { Event } from '../types/event';

const STATUS_CLASS_MAP: Record<string, string> = {
  Upcoming: 'status-upcoming',
  'In Progress': 'status-in-progress',
  Completed: 'status-completed',
  Cancelled: 'status-cancelled',
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const EventListPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventService.getAllEvents();
      setEvents(data);
    } catch (err) {
      setError('Failed to fetch events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await eventService.deleteEvent(id);
      setEvents(events.filter((event) => event.id !== id));
    } catch (err) {
      setError('Failed to delete event. Please try again.');
    }
  };

  if (loading) return <div className="container"><div className="loading">Loading events...</div></div>;
  if (error) return <div className="container"><div className="error">{error}</div><button onClick={fetchEvents} className="btn-retry">Retry</button></div>;

  return (
    <div className="container">
      <div className="header">
        <h1>Events</h1>
        <Link to="/events/new" className="btn-primary">Add New Event</Link>
      </div>
      {events.length === 0 ? (
        <div className="empty-state"><p>No events found. Add your first event to get started.</p></div>
      ) : (
        <div className="event-list">
          {events.map((event) => (
            <div key={event.id} className="event-card">
              <div className="event-card-header">
                <div className="event-card-title">
                  <h3>{event.name}</h3>
                  <span className="event-type-badge">{event.type}</span>
                </div>
                <span className={`event-status-badge ${STATUS_CLASS_MAP[event.status] ?? ''}`}>{event.status}</span>
              </div>
              <div className="event-card-body">
                <div className="event-meta">
                  <div className="event-meta-item"><span className="event-meta-label">Venue</span><span className="event-meta-value">{event.venue}</span></div>
                  <div className="event-meta-item"><span className="event-meta-label">Location</span><span className="event-meta-value">{event.location}</span></div>
                  <div className="event-meta-item"><span className="event-meta-label">Dates</span><span className="event-meta-value">{formatDate(event.startDate)} – {formatDate(event.endDate)}</span></div>
                </div>
                {event.description && <p className="event-description">{event.description}</p>}
              </div>
              <div className="event-card-footer">
                <Link to={`/events/${event.id}`} className="btn-secondary">View Details</Link>
                <Link to={`/events/${event.id}/edit`} className="btn-secondary">Edit</Link>
                <button onClick={() => handleDelete(event.id)} className="btn-danger">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventListPage;
```

#### `frontend/src/pages/EventDetailPage.tsx`
```typescript
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { eventService } from '../services/eventService';
import type { Event } from '../types/event';

const STATUS_CLASS_MAP: Record<string, string> = {
  Upcoming: 'status-upcoming',
  'In Progress': 'status-in-progress',
  Completed: 'status-completed',
  Cancelled: 'status-cancelled',
};

const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const formatDateTime = (dateStr: string): string =>
  new Date(dateStr).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (id) fetchEvent(id); }, [id]);

  const fetchEvent = async (eventId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventService.getEventById(eventId);
      setEvent(data);
    } catch (err) {
      setError('Failed to fetch event details. The event may not exist.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!event || !window.confirm(`Are you sure you want to delete "${event.name}"?`)) return;
    try {
      await eventService.deleteEvent(event.id);
      navigate('/events');
    } catch (err) {
      setError('Failed to delete event. Please try again.');
    }
  };

  if (loading) return <div className="container"><div className="loading">Loading event details...</div></div>;
  if (error || !event) return (
    <div className="container">
      <div className="error">{error ?? 'Event not found.'}</div>
      <Link to="/events" className="btn-secondary" style={{ marginTop: '1rem', display: 'inline-block' }}>Back to Events</Link>
    </div>
  );

  return (
    <div className="container">
      <div className="detail-page-header">
        <div className="detail-page-title">
          <Link to="/events" className="breadcrumb-link">← Events</Link>
          <h1>{event.name}</h1>
          <div className="detail-badges">
            <span className="event-type-badge">{event.type}</span>
            <span className={`event-status-badge ${STATUS_CLASS_MAP[event.status] ?? ''}`}>{event.status}</span>
          </div>
        </div>
        <div className="detail-page-actions">
          <Link to={`/events/${event.id}/edit`} className="btn-secondary">Edit Event</Link>
          <button onClick={handleDelete} className="btn-danger">Delete Event</button>
        </div>
      </div>
      <div className="detail-grid">
        <div className="detail-card">
          <h2 className="detail-card-title">Event Details</h2>
          <div className="detail-field-list">
            <div className="detail-field"><span className="detail-field-label">Venue</span><span className="detail-field-value">{event.venue}</span></div>
            <div className="detail-field"><span className="detail-field-label">Location</span><span className="detail-field-value">{event.location}</span></div>
            <div className="detail-field"><span className="detail-field-label">Start Date</span><span className="detail-field-value">{formatDate(event.startDate)}</span></div>
            <div className="detail-field"><span className="detail-field-label">End Date</span><span className="detail-field-value">{formatDate(event.endDate)}</span></div>
            <div className="detail-field"><span className="detail-field-label">Type</span><span className="detail-field-value">{event.type}</span></div>
            <div className="detail-field"><span className="detail-field-label">Status</span><span className={`event-status-badge ${STATUS_CLASS_MAP[event.status] ?? ''}`}>{event.status}</span></div>
          </div>
        </div>
        <div className="detail-card">
          <h2 className="detail-card-title">Additional Information</h2>
          <div className="detail-field-list">
            {event.description
              ? <div className="detail-field detail-field--full"><span className="detail-field-label">Description</span><p className="detail-field-text">{event.description}</p></div>
              : <p className="detail-empty-text">No description provided.</p>}
            {event.notes && <div className="detail-field detail-field--full"><span className="detail-field-label">Notes</span><p className="detail-field-text">{event.notes}</p></div>}
          </div>
        </div>
        <div className="detail-card detail-card--meta">
          <h2 className="detail-card-title">Record Information</h2>
          <div className="detail-field-list">
            <div className="detail-field"><span className="detail-field-label">Event ID</span><span className="detail-field-value detail-field-value--mono">{event.id}</span></div>
            <div className="detail-field"><span className="detail-field-label">Created</span><span className="detail-field-value">{formatDateTime(event.createdAt)}</span></div>
            <div className="detail-field"><span className="detail-field-label">Last Updated</span><span className="detail-field-value">{formatDateTime(event.updatedAt)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
```

#### `frontend/src/App.tsx` (updated)
```typescript
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import VehicleListPage from './pages/VehicleListPage';
import EventListPage from './pages/EventListPage';
import EventDetailPage from './pages/EventDetailPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="navbar-container navbar-container--flex">
            <h1 className="navbar-brand">🏁 Motorsports Management</h1>
            <ul className="navbar-nav">
              <li>
                <NavLink to="/vehicles" className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}>
                  Vehicles
                </NavLink>
              </li>
              <li>
                <NavLink to="/events" className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}>
                  Events
                </NavLink>
              </li>
            </ul>
          </div>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/vehicles" replace />} />
            <Route path="/vehicles" element={<VehicleListPage />} />
            <Route path="/vehicles/:id" element={<div className="container"><p>Vehicle Detail (Coming Soon)</p></div>} />
            <Route path="/vehicles/:id/edit" element={<div className="container"><p>Edit Vehicle (Coming Soon)</p></div>} />
            <Route path="/vehicles/new" element={<div className="container"><p>New Vehicle (Coming Soon)</p></div>} />
            <Route path="/events" element={<EventListPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/events/new" element={<div className="container"><p>New Event (Coming Soon)</p></div>} />
            <Route path="/events/:id/edit" element={<div className="container"><p>Edit Event (Coming Soon)</p></div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
```


---

## Phase 6: Backend: `User` & `Driver` Models & Auth
**Status:** ✅ Completed  
**Date:** February 20, 2026

### Summary
Successfully implemented the `User` and `Driver` models in Prisma with a one-to-one relationship. Built a complete authentication system using bcrypt for password hashing and JSON Web Tokens (JWT) for session management. The implementation includes `/api/auth/register` and `/api/auth/login` endpoints, a protected `/api/auth/me` profile endpoint, reusable JWT authentication middleware, and a full CRUD API for driver profiles at `/api/drivers`. All endpoints follow the established response format and include comprehensive input validation and error handling.

### Work Performed

1. **Dependencies Installed**
   - **Runtime:** `bcryptjs` (password hashing), `jsonwebtoken` (JWT generation/verification)
   - **Development:** `@types/bcryptjs`, `@types/jsonwebtoken`

2. **Database Schema — `User` Model**
   - `id` (UUID, primary key)
   - `email` (string, unique, required)
   - `passwordHash` (string, required — stores bcrypt hash, never plaintext)
   - `role` (string, default `"user"`) — valid values: `"admin"`, `"user"`, `"viewer"`
   - `firstName` / `lastName` (string, required)
   - `isActive` (boolean, default `true`)
   - `createdAt` / `updatedAt` (timestamps, auto-managed)
   - One-to-one relation to `Driver`

3. **Database Schema — `Driver` Model**
   - `id` (UUID, primary key)
   - `userId` (string, unique FK → `User.id`, cascade delete)
   - `licenseNumber` (string, optional, unique)
   - `nationality` (string, optional)
   - `dateOfBirth` (DateTime, optional)
   - `bio` (text, optional)
   - `emergencyContact` (string, optional)
   - `medicalNotes` (text, optional)
   - `createdAt` / `updatedAt` (timestamps, auto-managed)

4. **Database Migration**
   - Created and applied migration `20260220134253_add_user_driver_models`
   - Regenerated Prisma Client to include `User` and `Driver` models

5. **Auth Controller** (`src/controllers/auth.controller.ts`)
   - `POST /api/auth/register` — validates input, checks for duplicate email, hashes password with bcrypt (12 salt rounds), creates user, returns JWT
   - `POST /api/auth/login` — validates credentials, verifies bcrypt hash, checks `isActive` flag, returns JWT
   - `GET /api/auth/me` — protected endpoint returning full user profile including associated driver record

6. **Auth Middleware** (`src/middleware/auth.middleware.ts`)
   - `authenticate` — extracts Bearer token from `Authorization` header, verifies JWT signature, attaches decoded payload to `req.user`
   - `requireAdmin` — role-based guard restricting access to `admin` role users
   - Extended Express `Request` type to include `user?: JwtPayload`

7. **Driver Controller** (`src/controllers/driver.controller.ts`)
   - Full CRUD: `GET /api/drivers`, `GET /api/drivers/:id`, `POST /api/drivers`, `PUT /api/drivers/:id`, `DELETE /api/drivers/:id`
   - All endpoints protected by `authenticate` middleware
   - Responses include joined `user` data (email, name, role)

8. **Type Definitions**
   - `src/types/auth.types.ts` — `RegisterDto`, `LoginDto`, `JwtPayload`, `AuthResponse`, `VALID_ROLES`
   - `src/types/driver.types.ts` — `CreateDriverDto`, `UpdateDriverDto`

9. **Route Registration** — Updated `src/index.ts` to mount:
   - `authRoutes` at `/api/auth`
   - `driverRoutes` at `/api/drivers`

### Code Generated

#### `backend/prisma/schema.prisma` (updated)
```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

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
  category    String
  number      String?
  vin         String?  @unique
  notes       String?  @db.Text
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("vehicles")
}

model Event {
  id          String    @id @default(uuid())
  name        String
  type        String
  venue       String
  location    String
  startDate   DateTime
  endDate     DateTime
  status      String    @default("Upcoming")
  description String?   @db.Text
  notes       String?   @db.Text
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@map("events")
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  role         String   @default("user")
  firstName    String
  lastName     String
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  driver       Driver?

  @@map("users")
}

model Driver {
  id               String    @id @default(uuid())
  userId           String    @unique
  licenseNumber    String?   @unique
  nationality      String?
  dateOfBirth      DateTime?
  bio              String?   @db.Text
  emergencyContact String?
  medicalNotes     String?   @db.Text
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  user             User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("drivers")
}
```

#### `backend/prisma/migrations/20260220134253_add_user_driver_models/migration.sql`
```sql
-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "drivers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "licenseNumber" TEXT,
    "nationality" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "bio" TEXT,
    "emergencyContact" TEXT,
    "medicalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
-- CreateIndex
CREATE UNIQUE INDEX "drivers_userId_key" ON "drivers"("userId");
-- CreateIndex
CREATE UNIQUE INDEX "drivers_licenseNumber_key" ON "drivers"("licenseNumber");
-- AddForeignKey
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

#### `backend/src/types/auth.types.ts`
```typescript
export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export const VALID_ROLES = ['admin', 'user', 'viewer'] as const;
```

#### `backend/src/types/driver.types.ts`
```typescript
export interface CreateDriverDto {
  userId: string;
  licenseNumber?: string;
  nationality?: string;
  dateOfBirth?: string;
  bio?: string;
  emergencyContact?: string;
  medicalNotes?: string;
}

export interface UpdateDriverDto {
  licenseNumber?: string;
  nationality?: string;
  dateOfBirth?: string;
  bio?: string;
  emergencyContact?: string;
  medicalNotes?: string;
}
```

#### `backend/src/middleware/auth.middleware.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/auth.types';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Access denied. No token provided.',
    });
    return;
  }

  const token = authHeader.substring(7);
  const jwtSecret = process.env['JWT_SECRET'];

  if (!jwtSecret) {
    res.status(500).json({
      success: false,
      error: 'Server configuration error: JWT secret not set.',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token.',
    });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Authentication required.' });
    return;
  }
  if (req.user.role !== 'admin') {
    res.status(403).json({ success: false, error: 'Access denied. Admin role required.' });
    return;
  }
  next();
};
```

#### `backend/src/controllers/auth.controller.ts`
```typescript
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import { RegisterDto, LoginDto, JwtPayload, VALID_ROLES } from '../types/auth.types';

const SALT_ROUNDS = 12;

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, role }: RegisterDto = req.body;

    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({ success: false, error: 'Missing required fields: email, password, firstName, and lastName are required.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ success: false, error: 'Invalid email format.' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ success: false, error: 'Password must be at least 8 characters long.' });
      return;
    }

    const assignedRole = role ?? 'user';
    if (!VALID_ROLES.includes(assignedRole as (typeof VALID_ROLES)[number])) {
      res.status(400).json({ success: false, error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      res.status(409).json({ success: false, error: 'An account with this email address already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: { email: email.toLowerCase(), passwordHash, firstName, lastName, role: assignedRole },
    });

    const jwtSecret = process.env['JWT_SECRET'];
    if (!jwtSecret) { res.status(500).json({ success: false, error: 'Server configuration error.' }); return; }

    const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role };
    const expiresIn = process.env['JWT_EXPIRES_IN'] ?? '7d';
    const token = jwt.sign(payload, jwtSecret, { expiresIn } as jwt.SignOptions);

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: { token, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role } },
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ success: false, error: 'Registration failed. Please try again.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginDto = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Missing required fields: email and password are required.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) { res.status(401).json({ success: false, error: 'Invalid email or password.' }); return; }
    if (!user.isActive) { res.status(403).json({ success: false, error: 'Account is deactivated. Please contact an administrator.' }); return; }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) { res.status(401).json({ success: false, error: 'Invalid email or password.' }); return; }

    const jwtSecret = process.env['JWT_SECRET'];
    if (!jwtSecret) { res.status(500).json({ success: false, error: 'Server configuration error.' }); return; }

    const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role };
    const expiresIn = process.env['JWT_EXPIRES_IN'] ?? '7d';
    const token = jwt.sign(payload, jwtSecret, { expiresIn } as jwt.SignOptions);

    res.json({
      success: true,
      message: 'Login successful.',
      data: { token, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role } },
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ success: false, error: 'Login failed. Please try again.' });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ success: false, error: 'Not authenticated.' }); return; }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { driver: true },
    });

    if (!user) { res.status(404).json({ success: false, error: 'User not found.' }); return; }

    res.json({
      success: true,
      data: {
        id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName,
        role: user.role, isActive: user.isActive, driver: user.driver,
        createdAt: user.createdAt, updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user profile.' });
  }
};
```

#### `backend/src/controllers/driver.controller.ts`
```typescript
import { Request, Response } from 'express';
import prisma from '../prisma';
import { CreateDriverDto, UpdateDriverDto } from '../types/driver.types';

const userSelect = { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true };

export const getAllDrivers = async (req: Request, res: Response): Promise<void> => {
  try {
    const drivers = await prisma.driver.findMany({ include: { user: { select: userSelect } }, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: drivers, count: drivers.length });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch drivers.' });
  }
};

export const getDriverById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const driver = await prisma.driver.findUnique({ where: { id }, include: { user: { select: userSelect } } });
    if (!driver) { res.status(404).json({ success: false, error: 'Driver not found.' }); return; }
    res.json({ success: true, data: driver });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch driver.' });
  }
};

export const createDriver = async (req: Request, res: Response): Promise<void> => {
  try {
    const driverData: CreateDriverDto = req.body;
    if (!driverData.userId) { res.status(400).json({ success: false, error: 'Missing required field: userId is required.' }); return; }
    const user = await prisma.user.findUnique({ where: { id: driverData.userId } });
    if (!user) { res.status(404).json({ success: false, error: 'User not found.' }); return; }
    const existingDriver = await prisma.driver.findUnique({ where: { userId: driverData.userId } });
    if (existingDriver) { res.status(409).json({ success: false, error: 'A driver profile already exists for this user.' }); return; }
    const driver = await prisma.driver.create({
      data: {
        userId: driverData.userId,
        licenseNumber: driverData.licenseNumber ?? null,
        nationality: driverData.nationality ?? null,
        dateOfBirth: driverData.dateOfBirth ? new Date(driverData.dateOfBirth) : null,
        bio: driverData.bio ?? null,
        emergencyContact: driverData.emergencyContact ?? null,
        medicalNotes: driverData.medicalNotes ?? null,
      },
      include: { user: { select: userSelect } },
    });
    res.status(201).json({ success: true, data: driver, message: 'Driver profile created successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create driver profile.' });
  }
};

export const updateDriver = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const updateData: UpdateDriverDto = req.body;
    const existingDriver = await prisma.driver.findUnique({ where: { id } });
    if (!existingDriver) { res.status(404).json({ success: false, error: 'Driver not found.' }); return; }
    const driver = await prisma.driver.update({
      where: { id },
      data: {
        ...(updateData.licenseNumber !== undefined && { licenseNumber: updateData.licenseNumber }),
        ...(updateData.nationality !== undefined && { nationality: updateData.nationality }),
        ...(updateData.dateOfBirth !== undefined && { dateOfBirth: updateData.dateOfBirth ? new Date(updateData.dateOfBirth) : null }),
        ...(updateData.bio !== undefined && { bio: updateData.bio }),
        ...(updateData.emergencyContact !== undefined && { emergencyContact: updateData.emergencyContact }),
        ...(updateData.medicalNotes !== undefined && { medicalNotes: updateData.medicalNotes }),
      },
      include: { user: { select: userSelect } },
    });
    res.json({ success: true, data: driver, message: 'Driver profile updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update driver profile.' });
  }
};

export const deleteDriver = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const existingDriver = await prisma.driver.findUnique({ where: { id } });
    if (!existingDriver) { res.status(404).json({ success: false, error: 'Driver not found.' }); return; }
    await prisma.driver.delete({ where: { id } });
    res.json({ success: true, message: 'Driver profile deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete driver profile.' });
  }
};
```

#### `backend/src/routes/auth.routes.ts`
```typescript
import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router: Router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);

export default router;
```

#### `backend/src/routes/driver.routes.ts`
```typescript
import { Router } from 'express';
import { getAllDrivers, getDriverById, createDriver, updateDriver, deleteDriver } from '../controllers/driver.controller';
import { authenticate } from '../middleware/auth.middleware';

const router: Router = Router();

router.use(authenticate);
router.get('/', getAllDrivers);
router.get('/:id', getDriverById);
router.post('/', createDriver);
router.put('/:id', updateDriver);
router.delete('/:id', deleteDriver);

export default router;
```

#### `backend/src/index.ts` (updated)
```typescript
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

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Motorsports Management API is running', timestamp: new Date().toISOString() });
});

app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'Motorsports Management API', version: '1.0.0', endpoints: { auth: '/api/auth', vehicles: '/api/vehicles', events: '/api/events', drivers: '/api/drivers' } });
});

app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/drivers', driverRoutes);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  console.log(`🏁[motorsports]: Motorsports Management API initialized`);
  console.log(`🔐[auth]: Authentication endpoints available at /api/auth`);
});

export default app;
```

### API Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login and receive JWT |
| GET | `/api/auth/me` | Yes (Bearer) | Get current user profile |
| GET | `/api/drivers` | Yes (Bearer) | Get all driver profiles |
| GET | `/api/drivers/:id` | Yes (Bearer) | Get driver by ID |
| POST | `/api/drivers` | Yes (Bearer) | Create driver profile |
| PUT | `/api/drivers/:id` | Yes (Bearer) | Update driver profile |
| DELETE | `/api/drivers/:id` | Yes (Bearer) | Delete driver profile |

### Security Design

- Passwords are hashed using **bcrypt** with 12 salt rounds before storage — plaintext passwords are never persisted
- JWTs are signed with `HS256` algorithm using a configurable `JWT_SECRET` environment variable
- Token payload includes `userId`, `email`, and `role` for downstream authorization decisions
- The `authenticate` middleware validates the token on every protected route before the handler executes
- Email addresses are normalized to lowercase before storage and lookup to prevent duplicate accounts

### Testing Verified
- `POST /api/auth/register` — returns `201` with JWT and user object
- `POST /api/auth/login` — returns `200` with JWT and user object
- `GET /api/auth/me` — returns `200` with full user profile including driver relation
- Duplicate email registration returns `409 Conflict`
- Missing fields return `400 Bad Request`
- Invalid token returns `401 Unauthorized`

### Next Phase Preview
Phase 7 will implement the frontend authentication flow: `LoginPage.tsx`, `RegisterPage.tsx`, secure JWT storage, and an Axios interceptor to attach the auth token to all outgoing API requests.

---

## Phase 7: Frontend: Authentication Flow
**Status:** ✅ Completed  
**Date:** February 21, 2026

### Summary
Implemented the complete frontend authentication flow for the Motorsports Management application. This phase delivers a `LoginPage`, a `RegisterPage`, a global `AuthContext` powered by React Context API, a `ProtectedRoute` guard component, and an enhanced Axios interceptor. The JWT token is stored securely in `localStorage` and automatically attached to every outgoing API request. Unauthenticated users are redirected to `/login` and returned to their original destination after a successful sign-in. The navigation bar dynamically reflects the user's authentication state, displaying the user's name, role badge, and a sign-out button when logged in.

### Work Performed

1. **Auth Type Definitions (`src/types/auth.ts`)**
   - Defined `LoginDto`, `RegisterDto`, `AuthUser`, and `AuthResponse` interfaces that mirror the backend's API contract.

2. **Auth Service (`src/services/authService.ts`)**
   - Implemented `login()`, `register()`, `logout()`, `getCurrentUser()`, and `isAuthenticated()` methods.
   - `login()` and `register()` persist the JWT token and serialized user object to `localStorage` on success.
   - `logout()` removes both keys from `localStorage`.

3. **Auth Context (`src/context/AuthContext.tsx`)**
   - Created `AuthProvider` using React Context and `useState` to hold the current `AuthUser | null`.
   - Initializes state from `localStorage` so the session survives page refreshes.
   - Exposes `user`, `isAuthenticated`, `login`, `register`, and `logout` to all descendant components via the `useAuth()` hook.

4. **Protected Route (`src/components/ProtectedRoute.tsx`)**
   - Wraps any route element and redirects unauthenticated visitors to `/login`.
   - Preserves the intended destination in `location.state.from` so the user is forwarded there after login.

5. **Login Page (`src/pages/LoginPage.tsx`)**
   - Email + password form with client-side validation and loading state.
   - On success, navigates to the originally requested route (or `/vehicles` by default).
   - Displays server-side error messages (e.g., "Invalid email or password").

6. **Register Page (`src/pages/RegisterPage.tsx`)**
   - First name, last name, email, password, and confirm-password fields.
   - Client-side password match and minimum-length validation before hitting the API.
   - On success, navigates to `/vehicles`.

7. **Axios Interceptor Update (`src/services/api.ts`)**
   - Request interceptor attaches `Authorization: Bearer <token>` to every request when a token is present.
   - Response interceptor clears `localStorage` and redirects to `/login` on `401 Unauthorized`, with a guard to prevent redirect loops on auth pages.

8. **App.tsx Refactor**
   - Wrapped the application in `<AuthProvider>` (inside `<Router>`).
   - All protected routes (`/vehicles`, `/events`, etc.) are wrapped with `<ProtectedRoute>`.
   - Navbar conditionally renders auth links (Sign In / Register) or the user's name, role, and a Sign Out button.
   - Added `/login` and `/register` as public routes.
   - Added a catch-all `*` route that redirects to `/`.

9. **Entry Point Migration (`src/main.tsx`)**
   - Replaced the default Vite `main.ts` with a proper React entry point (`main.tsx`) that mounts `<App />` inside `<StrictMode>`.
   - Updated `index.html` to reference `main.tsx` and set the page title to "Motorsports Management".

10. **Auth Page Styles (`src/App.css`)**
    - Added `.auth-page`, `.auth-card`, `.auth-form`, `.form-group`, `.form-input`, `.form-row`, `.auth-error`, `.auth-submit-btn`, `.auth-link`, `.auth-footer-text` styles.
    - Added `.nav-user-info`, `.nav-user-name`, `.nav-user-role`, and `.btn-logout` styles for the authenticated navbar state.
    - Added responsive breakpoints for the two-column name row on small screens.

### Code Generated

#### `frontend/src/types/auth.ts`
```typescript
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}
```

#### `frontend/src/services/authService.ts`
```typescript
import api from './api';
import type { LoginDto, RegisterDto, AuthResponse } from '../types/auth';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const authService = {
  login: async (credentials: LoginDto): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/api/auth/login', credentials);
    const { token, user } = response.data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return { token, user };
  },

  register: async (data: RegisterDto): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/api/auth/register', data);
    const { token, user } = response.data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return { token, user };
  },

  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: (): AuthResponse['user'] | null => {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    try {
      return JSON.parse(userJson) as AuthResponse['user'];
    } catch {
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },
};
```

#### `frontend/src/context/AuthContext.tsx`
```typescript
import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/authService';
import type { AuthUser, LoginDto, RegisterDto } from '../types/auth';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (credentials: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => authService.getCurrentUser());

  const login = useCallback(async (credentials: LoginDto) => {
    const { user: loggedInUser } = await authService.login(credentials);
    setUser(loggedInUser);
  }, []);

  const register = useCallback(async (data: RegisterDto) => {
    const { user: registeredUser } = await authService.register(data);
    setUser(registeredUser);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
```

#### `frontend/src/components/ProtectedRoute.tsx`
```typescript
import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
```

#### `frontend/src/pages/LoginPage.tsx`
```typescript
import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface LocationState {
  from?: { pathname: string };
}

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState)?.from?.pathname ?? '/vehicles';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } } };
      setError(axiosError.response?.data?.error ?? 'Login failed. Please check your credentials and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-header">
          <h1 className="auth-title">Sign In</h1>
          <p className="auth-subtitle">Welcome back to Motorsports Management</p>
        </div>
        {error && <div className="auth-error" role="alert">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input id="email" type="email" className="form-input" value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
              required autoComplete="email" disabled={isSubmitting} />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input id="password" type="password" className="form-input" value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password"
              required autoComplete="current-password" disabled={isSubmitting} />
          </div>
          <button type="submit" className="btn-primary auth-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="auth-footer-text">
          Don't have an account? <Link to="/register" className="auth-link">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
```

#### `frontend/src/pages/RegisterPage.tsx`
```typescript
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters long.'); return; }
    setIsSubmitting(true);
    try {
      await register({ firstName, lastName, email, password });
      navigate('/vehicles', { replace: true });
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } } };
      setError(axiosError.response?.data?.error ?? 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-header">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join the Motorsports Management platform</p>
        </div>
        {error && <div className="auth-error" role="alert">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">First Name</label>
              <input id="firstName" type="text" className="form-input" value={firstName}
                onChange={(e) => setFirstName(e.target.value)} placeholder="John"
                required autoComplete="given-name" disabled={isSubmitting} />
            </div>
            <div className="form-group">
              <label htmlFor="lastName" className="form-label">Last Name</label>
              <input id="lastName" type="text" className="form-input" value={lastName}
                onChange={(e) => setLastName(e.target.value)} placeholder="Doe"
                required autoComplete="family-name" disabled={isSubmitting} />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input id="email" type="email" className="form-input" value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
              required autoComplete="email" disabled={isSubmitting} />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input id="password" type="password" className="form-input" value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 8 characters"
              required autoComplete="new-password" disabled={isSubmitting} />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <input id="confirmPassword" type="password" className="form-input" value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter your password"
              required autoComplete="new-password" disabled={isSubmitting} />
          </div>
          <button type="submit" className="btn-primary auth-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-footer-text">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
```

#### `frontend/src/services/api.ts` (updated)
```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

#### `frontend/src/main.tsx` (new)
```typescript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('app');
if (!rootElement) throw new Error('Root element #app not found in the document.');

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

### Build Verification
- `pnpm exec tsc --noEmit` — zero TypeScript errors
- `pnpm build` — production bundle compiled successfully (102 modules, 285 kB JS)

### Next Phase Preview
Phase 8 will implement the backend `SetupSheet` model in Prisma, create relations to `Vehicle` and `Event`, and build protected `/api/setups` CRUD endpoints.


---

## Phase 8: Backend: `SetupSheet` Model & Relations
**Status:** ✅ Completed  
**Date:** February 22, 2026

### Summary
Implemented the `SetupSheet` Prisma model with full relational links to `Vehicle`, `Event`, and `User`. Created a comprehensive Prisma migration SQL file, TypeScript DTOs, a full CRUD controller, and a protected Express router registered at `/api/setups`. All endpoints require JWT authentication; update and delete operations additionally enforce ownership (creator or admin). The TypeScript build compiles with zero errors.

### Work Performed

1. **Prisma Schema — `SetupSheet` Model**
   - Added `SetupSheet` model to `backend/prisma/schema.prisma` with 35 fields covering session context, tyre setup, suspension, aerodynamics, brakes, engine/drivetrain, fuel load, and free-text notes.
   - Added `setupSheets` back-relations to the existing `Vehicle`, `Event`, and `User` models.

2. **Database Migration**
   - Created migration file `prisma/migrations/20260222000000_add_setup_sheet_model/migration.sql` with `CREATE TABLE "setup_sheets"` DDL and three `ALTER TABLE … ADD CONSTRAINT … FOREIGN KEY` statements (CASCADE on Vehicle and Event; RESTRICT on User).

3. **TypeScript Types**
   - Created `backend/src/types/setup.types.ts` with `CreateSetupSheetDto`, `UpdateSetupSheetDto`, `VALID_SESSION_TYPES`, and `VALID_DOWNFORCE_LEVELS` constants.

4. **Controller**
   - Created `backend/src/controllers/setup.controller.ts` with five handlers: `getAllSetupSheets` (supports `?eventId=` and `?vehicleId=` query filters), `getSetupSheetById`, `createSetupSheet`, `updateSetupSheet`, `deleteSetupSheet`.
   - All read/write operations eagerly load `vehicle`, `event`, and `createdBy` relations via a shared `setupInclude` object.
   - Ownership guard on update and delete: only the creator or an admin may modify a sheet.

5. **Router**
   - Created `backend/src/routes/setup.routes.ts` applying `authenticate` middleware to all routes.

6. **Entry Point Update**
   - Updated `backend/src/index.ts` to import and mount `setupRoutes` at `/api/setups`, and added `setups` to the API info endpoint response.

7. **Prisma Client Regeneration**
   - Ran `prisma generate` to regenerate the typed client from the updated schema.

8. **Build Verification**
   - `pnpm run build` — zero TypeScript errors.

### Code Generated

#### `backend/prisma/schema.prisma` (SetupSheet model addition)
```prisma
model SetupSheet {
  id          String   @id @default(uuid())

  // Relations
  vehicleId   String
  eventId     String
  createdById String

  vehicle     Vehicle  @relation(fields: [vehicleId], references: [id], onDelete: Cascade)
  event       Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  createdBy   User     @relation(fields: [createdById], references: [id])

  // Session context
  sessionType   String
  sessionNumber Int?

  // Tyre setup
  tyreFrontLeft   String?
  tyreFrontRight  String?
  tyreRearLeft    String?
  tyreRearRight   String?
  tyrePressureFrontLeft  Float?
  tyrePressureFrontRight Float?
  tyrePressureRearLeft   Float?
  tyrePressureRearRight  Float?

  // Suspension setup
  rideHeightFront Float?
  rideHeightRear  Float?
  springRateFront Float?
  springRateRear  Float?
  damperFront     String?
  damperRear      String?
  camberFront     Float?
  camberRear      Float?
  toeInFront      Float?
  toeInRear       Float?

  // Aerodynamics
  frontWingAngle  Float?
  rearWingAngle   Float?
  downforceLevel  String?

  // Brakes
  brakeBias       Float?
  brakeCompound   String?

  // Engine / Drivetrain
  engineMap         String?
  differentialEntry Float?
  differentialMid   Float?
  differentialExit  Float?

  // Fuel
  fuelLoad        Float?

  // Notes & observations
  notes           String? @db.Text
  driverFeedback  String? @db.Text

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("setup_sheets")
}
```

#### `backend/prisma/migrations/20260222000000_add_setup_sheet_model/migration.sql`
```sql
-- CreateTable
CREATE TABLE "setup_sheets" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "sessionType" TEXT NOT NULL,
    "sessionNumber" INTEGER,
    "tyreFrontLeft" TEXT,
    "tyreFrontRight" TEXT,
    "tyreRearLeft" TEXT,
    "tyreRearRight" TEXT,
    "tyrePressureFrontLeft" DOUBLE PRECISION,
    "tyrePressureFrontRight" DOUBLE PRECISION,
    "tyrePressureRearLeft" DOUBLE PRECISION,
    "tyrePressureRearRight" DOUBLE PRECISION,
    "rideHeightFront" DOUBLE PRECISION,
    "rideHeightRear" DOUBLE PRECISION,
    "springRateFront" DOUBLE PRECISION,
    "springRateRear" DOUBLE PRECISION,
    "damperFront" TEXT,
    "damperRear" TEXT,
    "camberFront" DOUBLE PRECISION,
    "camberRear" DOUBLE PRECISION,
    "toeInFront" DOUBLE PRECISION,
    "toeInRear" DOUBLE PRECISION,
    "frontWingAngle" DOUBLE PRECISION,
    "rearWingAngle" DOUBLE PRECISION,
    "downforceLevel" TEXT,
    "brakeBias" DOUBLE PRECISION,
    "brakeCompound" TEXT,
    "engineMap" TEXT,
    "differentialEntry" DOUBLE PRECISION,
    "differentialMid" DOUBLE PRECISION,
    "differentialExit" DOUBLE PRECISION,
    "fuelLoad" DOUBLE PRECISION,
    "notes" TEXT,
    "driverFeedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "setup_sheets_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "setup_sheets" ADD CONSTRAINT "setup_sheets_vehicleId_fkey"
  FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "setup_sheets" ADD CONSTRAINT "setup_sheets_eventId_fkey"
  FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "setup_sheets" ADD CONSTRAINT "setup_sheets_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```

#### `backend/src/types/setup.types.ts`
```typescript
export interface CreateSetupSheetDto {
  vehicleId: string;
  eventId: string;
  sessionType: string;
  sessionNumber?: number;
  tyreFrontLeft?: string;
  tyreFrontRight?: string;
  tyreRearLeft?: string;
  tyreRearRight?: string;
  tyrePressureFrontLeft?: number;
  tyrePressureFrontRight?: number;
  tyrePressureRearLeft?: number;
  tyrePressureRearRight?: number;
  rideHeightFront?: number;
  rideHeightRear?: number;
  springRateFront?: number;
  springRateRear?: number;
  damperFront?: string;
  damperRear?: string;
  camberFront?: number;
  camberRear?: number;
  toeInFront?: number;
  toeInRear?: number;
  frontWingAngle?: number;
  rearWingAngle?: number;
  downforceLevel?: string;
  brakeBias?: number;
  brakeCompound?: string;
  engineMap?: string;
  differentialEntry?: number;
  differentialMid?: number;
  differentialExit?: number;
  fuelLoad?: number;
  notes?: string;
  driverFeedback?: string;
}

export interface UpdateSetupSheetDto {
  vehicleId?: string;
  eventId?: string;
  sessionType?: string;
  sessionNumber?: number;
  tyreFrontLeft?: string;
  tyreFrontRight?: string;
  tyreRearLeft?: string;
  tyreRearRight?: string;
  tyrePressureFrontLeft?: number;
  tyrePressureFrontRight?: number;
  tyrePressureRearLeft?: number;
  tyrePressureRearRight?: number;
  rideHeightFront?: number;
  rideHeightRear?: number;
  springRateFront?: number;
  springRateRear?: number;
  damperFront?: string;
  damperRear?: string;
  camberFront?: number;
  camberRear?: number;
  toeInFront?: number;
  toeInRear?: number;
  frontWingAngle?: number;
  rearWingAngle?: number;
  downforceLevel?: string;
  brakeBias?: number;
  brakeCompound?: string;
  engineMap?: string;
  differentialEntry?: number;
  differentialMid?: number;
  differentialExit?: number;
  fuelLoad?: number;
  notes?: string;
  driverFeedback?: string;
}

export const VALID_SESSION_TYPES = [
  'Practice', 'Qualifying', 'Race', 'Test', 'Warm-Up', 'Other',
] as const;

export const VALID_DOWNFORCE_LEVELS = ['Low', 'Medium', 'High'] as const;
```

#### `backend/src/controllers/setup.controller.ts`
```typescript
import { Request, Response } from 'express';
import prisma from '../prisma';
import {
  CreateSetupSheetDto,
  UpdateSetupSheetDto,
  VALID_SESSION_TYPES,
  VALID_DOWNFORCE_LEVELS,
} from '../types/setup.types';

const setupInclude = {
  vehicle: { select: { id: true, make: true, model: true, year: true, number: true, category: true } },
  event:   { select: { id: true, name: true, type: true, venue: true, location: true, startDate: true, endDate: true } },
  createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
};

export const getAllSetupSheets = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId, vehicleId } = req.query as { eventId?: string; vehicleId?: string };
    const where: Record<string, unknown> = {};
    if (eventId) where['eventId'] = eventId;
    if (vehicleId) where['vehicleId'] = vehicleId;
    const setups = await prisma.setupSheet.findMany({ where, include: setupInclude, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: setups, count: setups.length });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch setup sheets' });
  }
};

export const getSetupSheetById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const setup = await prisma.setupSheet.findUnique({ where: { id }, include: setupInclude });
    if (!setup) { res.status(404).json({ success: false, error: 'Setup sheet not found' }); return; }
    res.json({ success: true, data: setup });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch setup sheet' });
  }
};

export const createSetupSheet = async (req: Request, res: Response): Promise<void> => {
  // ... validation + prisma.setupSheet.create (see full file)
};

export const updateSetupSheet = async (req: Request, res: Response): Promise<void> => {
  // ... ownership check + prisma.setupSheet.update (see full file)
};

export const deleteSetupSheet = async (req: Request, res: Response): Promise<void> => {
  // ... ownership check + prisma.setupSheet.delete (see full file)
};
```

#### `backend/src/routes/setup.routes.ts`
```typescript
import { Router } from 'express';
import {
  getAllSetupSheets, getSetupSheetById,
  createSetupSheet, updateSetupSheet, deleteSetupSheet,
} from '../controllers/setup.controller';
import { authenticate } from '../middleware/auth.middleware';

const router: Router = Router();
router.use(authenticate);

router.get('/',     getAllSetupSheets);
router.get('/:id',  getSetupSheetById);
router.post('/',    createSetupSheet);
router.put('/:id',  updateSetupSheet);
router.delete('/:id', deleteSetupSheet);

export default router;
```

#### `backend/src/index.ts` (additions)
```typescript
import setupRoutes from './routes/setup.routes';
// ...
app.use('/api/setups', setupRoutes);
```

### API Endpoints

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/setups` | Required | List all setup sheets; supports `?eventId=` and `?vehicleId=` filters |
| `GET` | `/api/setups/:id` | Required | Get a single setup sheet with related vehicle, event, and creator |
| `POST` | `/api/setups` | Required | Create a new setup sheet |
| `PUT` | `/api/setups/:id` | Required (owner or admin) | Update a setup sheet |
| `DELETE` | `/api/setups/:id` | Required (owner or admin) | Delete a setup sheet |

### Next Phase Preview
Phase 9 will implement the frontend digital setup sheet form (`SetupSheetForm.tsx`), POST data to `/api/setups`, and display setup sheets on the `EventDetailPage`.

---

## Phase 9: Frontend: Digital Setup Sheet Form
**Status:** ✅ Completed  
**Date:** February 23, 2026

### Summary
Implemented the complete frontend digital setup sheet feature. Created TypeScript type definitions and a service layer for communicating with the protected `/api/setups` backend endpoints. Built a full-featured `SetupSheetForm.tsx` modal component that allows users to record all vehicle setup parameters — tyres, suspension, aerodynamics, brakes, engine/drivetrain, and notes — and POST them to the API. Created a `SetupSheetCard.tsx` component that renders each setup sheet with a collapsible detail view. Updated `EventDetailPage.tsx` to fetch and display all setup sheets associated with an event, with a count badge and an inline "New Setup Sheet" button that opens the form modal. Added a dedicated `setup.css` stylesheet for all new UI elements.

### Work Performed

1. **Type Definitions** — `frontend/src/types/setup.ts`
   - Defined `SetupSheet` interface mirroring the Prisma `SetupSheet` model with all 30+ fields and populated relation types for `vehicle`, `event`, and `createdBy`
   - Defined `CreateSetupSheetDto` interface for POST/PUT payloads
   - Exported `SESSION_TYPES` and `DOWNFORCE_LEVELS` constant arrays matching backend validation enums
   - Exported `SessionType` and `DownforceLevel` derived union types

2. **Setup Service** — `frontend/src/services/setupService.ts`
   - `getAllSetups(params?)` — GET `/api/setups` with optional `eventId` and `vehicleId` query filters
   - `getSetupById(id)` — GET `/api/setups/:id`
   - `createSetup(data)` — POST `/api/setups`
   - `updateSetup(id, data)` — PUT `/api/setups/:id`
   - `deleteSetup(id)` — DELETE `/api/setups/:id`
   - Properly handles the `{ success, data, count }` wrapped API response format

3. **SetupSheetForm Component** — `frontend/src/components/SetupSheetForm.tsx`
   - Full-screen overlay modal with a scrollable form
   - Six sectioned fieldsets: Session Context, Tyre Setup, Suspension, Aerodynamics, Brakes, Engine & Drivetrain, Notes & Feedback
   - Vehicle selector populated from `/api/vehicles`, session type selector with all valid options
   - Numeric inputs with appropriate step values and units for all measurement fields
   - Strips empty string values to `undefined` before submission to keep API payloads clean
   - Loading and error states with inline error banner
   - Cancel and Save actions; calls `onSuccess` callback to trigger parent refresh

4. **SetupSheetCard Component** — `frontend/src/components/SetupSheetCard.tsx`
   - Collapsible card with a header showing session badge and vehicle label
   - Collapsed summary view showing key chips (tyre compound, pressures, brake bias, fuel load, downforce level) and a driver feedback preview
   - Expanded detail view with sectioned grids for all setup parameters — only renders fields that have values
   - Delete action with confirmation dialog and `onDeleted` callback
   - Footer showing creator name and creation date

5. **EventDetailPage Update** — `frontend/src/pages/EventDetailPage.tsx`
   - Added state management for setup sheets and vehicles
   - Fetches setup sheets on mount via `setupService.getAllSetups({ eventId })`
   - Fetches vehicles on mount for the form's vehicle selector
   - Renders a "Setup Sheets" section below the event info grid with a count badge
   - Empty state with a call-to-action button when no setups exist
   - List of `SetupSheetCard` components, each with a delete callback that re-fetches the list
   - Conditionally renders the `SetupSheetForm` modal when "New Setup Sheet" is clicked

6. **Styles** — `frontend/src/setup.css`
   - Setup sheets section header and count badge
   - Setup card with header, collapsed summary chips, and expanded detail grid
   - Form modal overlay, modal container, section headers, and responsive grid layouts
   - Responsive breakpoints for 768px and 480px viewports

### Code Generated

#### `frontend/src/types/setup.ts`
```typescript
export interface SetupSheet {
  id: string;
  vehicleId: string;
  eventId: string;
  createdById: string;
  sessionType: string;
  sessionNumber?: number;
  tyreFrontLeft?: string;
  tyreFrontRight?: string;
  tyreRearLeft?: string;
  tyreRearRight?: string;
  tyrePressureFrontLeft?: number;
  tyrePressureFrontRight?: number;
  tyrePressureRearLeft?: number;
  tyrePressureRearRight?: number;
  rideHeightFront?: number;
  rideHeightRear?: number;
  springRateFront?: number;
  springRateRear?: number;
  damperFront?: string;
  damperRear?: string;
  camberFront?: number;
  camberRear?: number;
  toeInFront?: number;
  toeInRear?: number;
  frontWingAngle?: number;
  rearWingAngle?: number;
  downforceLevel?: string;
  brakeBias?: number;
  brakeCompound?: string;
  engineMap?: string;
  differentialEntry?: number;
  differentialMid?: number;
  differentialExit?: number;
  fuelLoad?: number;
  notes?: string;
  driverFeedback?: string;
  createdAt: string;
  updatedAt: string;
  vehicle?: { id: string; make: string; model: string; year: number; number?: string; };
  event?: { id: string; name: string; type: string; };
  createdBy?: { id: string; firstName: string; lastName: string; email: string; };
}

export interface CreateSetupSheetDto {
  vehicleId: string;
  eventId: string;
  sessionType: string;
  sessionNumber?: number;
  tyreFrontLeft?: string; tyreFrontRight?: string; tyreRearLeft?: string; tyreRearRight?: string;
  tyrePressureFrontLeft?: number; tyrePressureFrontRight?: number;
  tyrePressureRearLeft?: number; tyrePressureRearRight?: number;
  rideHeightFront?: number; rideHeightRear?: number;
  springRateFront?: number; springRateRear?: number;
  damperFront?: string; damperRear?: string;
  camberFront?: number; camberRear?: number;
  toeInFront?: number; toeInRear?: number;
  frontWingAngle?: number; rearWingAngle?: number; downforceLevel?: string;
  brakeBias?: number; brakeCompound?: string;
  engineMap?: string;
  differentialEntry?: number; differentialMid?: number; differentialExit?: number;
  fuelLoad?: number;
  notes?: string; driverFeedback?: string;
}

export const SESSION_TYPES = ['Practice', 'Qualifying', 'Race', 'Test', 'Warm-Up', 'Other'] as const;
export const DOWNFORCE_LEVELS = ['Low', 'Medium', 'High'] as const;
export type SessionType = (typeof SESSION_TYPES)[number];
export type DownforceLevel = (typeof DOWNFORCE_LEVELS)[number];
```

#### `frontend/src/services/setupService.ts`
```typescript
import api from './api';
import type { SetupSheet, CreateSetupSheetDto } from '../types/setup';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
}

export const setupService = {
  getAllSetups: async (params?: { eventId?: string; vehicleId?: string }): Promise<SetupSheet[]> => {
    const response = await api.get<ApiResponse<SetupSheet[]>>('/api/setups', { params });
    return response.data.data;
  },
  getSetupById: async (id: string): Promise<SetupSheet> => {
    const response = await api.get<ApiResponse<SetupSheet>>(`/api/setups/${id}`);
    return response.data.data;
  },
  createSetup: async (data: CreateSetupSheetDto): Promise<SetupSheet> => {
    const response = await api.post<ApiResponse<SetupSheet>>('/api/setups', data);
    return response.data.data;
  },
  updateSetup: async (id: string, data: Partial<CreateSetupSheetDto>): Promise<SetupSheet> => {
    const response = await api.put<ApiResponse<SetupSheet>>(`/api/setups/${id}`, data);
    return response.data.data;
  },
  deleteSetup: async (id: string): Promise<void> => {
    await api.delete(`/api/setups/${id}`);
  },
};
```

#### `frontend/src/components/SetupSheetForm.tsx`
See full file at `frontend/src/components/SetupSheetForm.tsx` (619 lines). Key structure:
- Modal overlay with scrollable form container
- Six setup sections: Session Context, Tyre Setup, Suspension, Aerodynamics, Brakes, Engine & Drivetrain, Notes & Feedback
- Controlled form state with `handleChange` normalising numeric inputs
- `handleSubmit` strips empty strings, calls `setupService.createSetup`, invokes `onSuccess` callback

#### `frontend/src/components/SetupSheetCard.tsx`
See full file at `frontend/src/components/SetupSheetCard.tsx` (217 lines). Key structure:
- Collapsible card: header with session badge, vehicle label, expand/delete buttons
- Collapsed summary: key value chips + driver feedback preview
- Expanded detail: sectioned grids for all parameters, only renders non-null fields via `SetupField` helper
- Delete with confirmation and `onDeleted` callback

#### `frontend/src/pages/EventDetailPage.tsx` (updated)
Key additions:
```typescript
// New state
const [setups, setSetups] = useState<SetupSheet[]>([]);
const [setupsLoading, setSetupsLoading] = useState<boolean>(false);
const [vehicles, setVehicles] = useState<Vehicle[]>([]);
const [showSetupForm, setShowSetupForm] = useState<boolean>(false);

// Fetch on mount
void fetchSetups(id);
void fetchVehicles();

// Setup Sheets section renders SetupSheetCard list + SetupSheetForm modal
```

#### `frontend/src/setup.css`
New dedicated stylesheet (280+ lines) covering:
- `.setup-sheets-section`, `.setup-sheets-header`, `.setup-sheets-count`, `.setup-sheets-empty`, `.setup-sheets-list`
- `.setup-card`, `.setup-card-header`, `.setup-session-badge`, `.setup-vehicle-label`
- `.setup-card-summary`, `.setup-summary-chip`, `.setup-feedback-preview`
- `.setup-card-detail`, `.setup-detail-section`, `.setup-detail-grid`, `.setup-detail-field`
- `.setup-form-overlay`, `.setup-form-modal`, `.setup-form-header`, `.setup-section`, `.setup-grid--{1,2,3,4}`
- Responsive breakpoints at 768px and 480px

### Build Verification
Frontend TypeScript compilation and Vite production build pass with zero errors. Bundle size: 305 KB JS, 15.4 KB CSS.

### Next Phase Preview
There are no further phases defined in `project_plan.md`. Phase 9 is the final planned phase of the Motorsports Management Web App.

---

## Phase 10: Frontend + Backend: Performance Analytics Dashboard
**Status:** ✅ Completed  
**Date:** February 24, 2026

### Summary
Implemented a full-stack Performance Analytics Dashboard. On the backend, a new `LapTime` Prisma model was defined with foreign-key relations to `Driver`, `Vehicle`, and `Event`. A Prisma migration was generated and applied to create the `lap_times` table. A complete `/api/analytics` route group was built, providing CRUD endpoints for lap time recording and retrieval plus a `/api/analytics/summary` endpoint that returns aggregated analytics (best laps per driver and vehicle, lap-by-lap trend data). On the frontend, Recharts was installed and an `AnalyticsDashboardPage.tsx` was created featuring a line chart for lap time trends per driver, two bar charts for driver and vehicle best-lap comparisons, a driver leaderboard table, and summary stat cards. An "Analytics" navigation link was added to the main navbar.

### Work Performed

1. **Prisma Schema — `LapTime` Model**
   - Added `LapTime` model with fields: `id`, `driverId`, `vehicleId`, `eventId`, `lapNumber`, `lapTimeMs`, `sessionType`, `sector1Ms`, `sector2Ms`, `sector3Ms`, `isValid`, `notes`, `createdAt`, `updatedAt`
   - Added `@relation` back-references on `Vehicle`, `Event`, and `Driver` models
   - Generated and applied migration `20260224060732_add_laptime_model`

2. **Backend — Types**
   - Created `src/types/laptime.types.ts` with `CreateLapTimeDto`, `UpdateLapTimeDto`, and `VALID_LAP_SESSION_TYPES`

3. **Backend — Analytics Controller**
   - `recordLapTime` — POST, validates all fields, verifies related entities exist, stores lap time
   - `getLapTimes` — GET with optional filters (`eventId`, `driverId`, `vehicleId`, `sessionType`), enriches response with formatted time strings
   - `getLapTimeById` — GET single lap time by ID
   - `updateLapTime` — PUT with partial updates
   - `deleteLapTime` — DELETE
   - `getAnalyticsSummary` — GET aggregated data: best lap per driver, best lap per vehicle, lap-by-lap trend arrays per driver
   - Helper `msToLapTimeString` converts milliseconds to `mm:ss.mmm` format

4. **Backend — Routes & Registration**
   - Created `src/routes/analytics.routes.ts` with all five endpoints plus summary route, all protected by `authenticate` middleware
   - Registered `/api/analytics` in `src/index.ts`

5. **Frontend — Types & Service**
   - Created `src/types/laptime.ts` with `LapTime`, `CreateLapTimeDto`, and `AnalyticsSummary` interfaces
   - Created `src/services/analyticsService.ts` with `recordLapTime`, `getLapTimes`, `getLapTimeById`, `deleteLapTime`, and `getSummary`

6. **Frontend — `AnalyticsDashboardPage.tsx`**
   - Event filter dropdown to scope analytics to a specific event or view all
   - Summary stat cards: total laps, drivers tracked, vehicles tracked, overall best lap
   - **Line Chart** (Recharts `LineChart`): lap number vs lap time per driver, multi-driver overlay with custom tooltip
   - **Bar Chart — Driver Comparison** (Recharts `BarChart`): best lap time per driver
   - **Bar Chart — Vehicle Performance** (Recharts `BarChart`): best lap time per vehicle
   - **Leaderboard Table**: ranked list of drivers with best lap, vehicle, and event
   - Empty state when no lap data is available

7. **Frontend — Styling & Navigation**
   - Created `src/analytics.css` with styles for stat cards, chart sections, custom tooltip, and leaderboard table
   - Added "Analytics" `NavLink` to the main navbar in `App.tsx`
   - Added `/analytics` protected route in `App.tsx`

### Code Generated

#### `backend/prisma/schema.prisma` (LapTime model addition)
```prisma
model LapTime {
  id          String   @id @default(uuid())

  // Relations
  driverId    String
  vehicleId   String
  eventId     String

  driver      Driver   @relation(fields: [driverId], references: [id], onDelete: Cascade)
  vehicle     Vehicle  @relation(fields: [vehicleId], references: [id], onDelete: Cascade)
  event       Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)

  // Lap data
  lapNumber   Int                        // Lap number within the session
  lapTimeMs   Int                        // Lap time in milliseconds for precision
  sessionType String                     // "Practice", "Qualifying", "Race", "Test"
  sector1Ms   Int?                       // Sector 1 time in milliseconds
  sector2Ms   Int?                       // Sector 2 time in milliseconds
  sector3Ms   Int?                       // Sector 3 time in milliseconds
  isValid     Boolean  @default(true)    // Whether the lap was valid (no penalties/incidents)
  notes       String?  @db.Text

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("lap_times")
}
```

#### `backend/prisma/migrations/20260224060732_add_laptime_model/migration.sql`
```sql
-- CreateTable
CREATE TABLE "lap_times" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "lapNumber" INTEGER NOT NULL,
    "lapTimeMs" INTEGER NOT NULL,
    "sessionType" TEXT NOT NULL,
    "sector1Ms" INTEGER,
    "sector2Ms" INTEGER,
    "sector3Ms" INTEGER,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "lap_times_pkey" PRIMARY KEY ("id")
);
-- AddForeignKey
ALTER TABLE "lap_times" ADD CONSTRAINT "lap_times_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "lap_times" ADD CONSTRAINT "lap_times_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "lap_times" ADD CONSTRAINT "lap_times_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

#### `backend/src/types/laptime.types.ts`
```typescript
export interface CreateLapTimeDto {
  driverId: string;
  vehicleId: string;
  eventId: string;
  lapNumber: number;
  lapTimeMs: number;
  sessionType: string;
  sector1Ms?: number;
  sector2Ms?: number;
  sector3Ms?: number;
  isValid?: boolean;
  notes?: string;
}

export interface UpdateLapTimeDto {
  lapNumber?: number;
  lapTimeMs?: number;
  sessionType?: string;
  sector1Ms?: number;
  sector2Ms?: number;
  sector3Ms?: number;
  isValid?: boolean;
  notes?: string;
}

export const VALID_LAP_SESSION_TYPES = ['Practice', 'Qualifying', 'Race', 'Test'] as const;
```

#### `backend/src/controllers/analytics.controller.ts`
```typescript
import { Request, Response } from 'express';
import prisma from '../prisma';
import { CreateLapTimeDto, UpdateLapTimeDto, VALID_LAP_SESSION_TYPES } from '../types/laptime.types';

const lapTimeInclude = {
  driver: {
    select: { id: true, userId: true },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  },
  vehicle: {
    select: { id: true, make: true, model: true, year: true, number: true, category: true },
  },
  event: {
    select: { id: true, name: true, type: true, venue: true, location: true, startDate: true },
  },
};

export const msToLapTimeString = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const millis = ms % 1000;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
};

export const recordLapTime = async (req: Request, res: Response): Promise<void> => { /* ... full implementation */ };
export const getLapTimes = async (req: Request, res: Response): Promise<void> => { /* ... full implementation */ };
export const getLapTimeById = async (req: Request, res: Response): Promise<void> => { /* ... full implementation */ };
export const updateLapTime = async (req: Request, res: Response): Promise<void> => { /* ... full implementation */ };
export const deleteLapTime = async (req: Request, res: Response): Promise<void> => { /* ... full implementation */ };
export const getAnalyticsSummary = async (req: Request, res: Response): Promise<void> => { /* ... full implementation */ };
```

#### `backend/src/routes/analytics.routes.ts`
```typescript
import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  recordLapTime, getLapTimes, getLapTimeById,
  updateLapTime, deleteLapTime, getAnalyticsSummary,
} from '../controllers/analytics.controller';

const router: Router = Router();
router.use(authenticate);

router.get('/summary', getAnalyticsSummary);
router.get('/laptimes', getLapTimes);
router.post('/laptimes', recordLapTime);
router.get('/laptimes/:id', getLapTimeById);
router.put('/laptimes/:id', updateLapTime);
router.delete('/laptimes/:id', deleteLapTime);

export default router;
```

#### `frontend/src/types/laptime.ts`
```typescript
export interface LapTime {
  id: string;
  driverId: string;
  vehicleId: string;
  eventId: string;
  lapNumber: number;
  lapTimeMs: number;
  lapTimeFormatted: string;
  sessionType: string;
  sector1Ms: number | null;
  sector2Ms: number | null;
  sector3Ms: number | null;
  sector1Formatted: string | null;
  sector2Formatted: string | null;
  sector3Formatted: string | null;
  isValid: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  driver: { id: string; userId: string; user: { id: string; firstName: string; lastName: string; email: string } };
  vehicle: { id: string; make: string; model: string; year: number; number: string | null; category: string };
  event: { id: string; name: string; type: string; venue: string; location: string; startDate: string };
}

export interface AnalyticsSummary {
  totalLaps: number;
  bestLapsByDriver: { driverName: string; lapTimeMs: number; lapTimeFormatted: string; vehicleName: string; eventName: string }[];
  bestLapsByVehicle: { vehicleName: string; lapTimeMs: number; lapTimeFormatted: string; driverName: string; eventName: string }[];
  lapTrendsByDriver: { driverName: string; laps: { lapNumber: number; lapTimeMs: number; lapTimeFormatted: string }[] }[];
}
```

#### `frontend/src/services/analyticsService.ts`
```typescript
import api from './api';
import type { LapTime, CreateLapTimeDto, AnalyticsSummary } from '../types/laptime';

export const analyticsService = {
  async recordLapTime(data: CreateLapTimeDto): Promise<LapTime> { /* ... */ },
  async getLapTimes(filters?: { eventId?: string; driverId?: string; vehicleId?: string; sessionType?: string }): Promise<LapTime[]> { /* ... */ },
  async getLapTimeById(id: string): Promise<LapTime> { /* ... */ },
  async deleteLapTime(id: string): Promise<void> { /* ... */ },
  async getSummary(eventId?: string): Promise<AnalyticsSummary> { /* ... */ },
};
```

#### `frontend/src/pages/AnalyticsDashboardPage.tsx`
Full React component with:
- Event filter dropdown
- Summary stat cards (total laps, drivers, vehicles, overall best lap)
- Recharts `LineChart` for lap time trends per driver
- Recharts `BarChart` for driver best-lap comparison
- Recharts `BarChart` for vehicle performance comparison
- Driver leaderboard table with medal icons
- Empty state for no data

#### `frontend/src/analytics.css`
Custom stylesheet for analytics dashboard layout, stat cards, chart sections, tooltip, and leaderboard table.

### API Endpoints Added

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/analytics/laptimes` | Record a new lap time |
| `GET` | `/api/analytics/laptimes` | List lap times (filterable) |
| `GET` | `/api/analytics/laptimes/:id` | Get single lap time |
| `PUT` | `/api/analytics/laptimes/:id` | Update a lap time |
| `DELETE` | `/api/analytics/laptimes/:id` | Delete a lap time |
| `GET` | `/api/analytics/summary` | Aggregated analytics summary |

### Next Phase Preview
All ten planned phases are now complete. The project has a fully functional motorsports management application with vehicle management, event management, authentication, digital setup sheets, and performance analytics.

---

---

## Phase 11: Frontend: Vehicle Detail, Create & Edit Pages + Driver Roster
**Status:** ✅ Completed  
**Date:** February 25, 2026

### Summary
Completed the Vehicle management UI by replacing all "Coming Soon" route stubs with fully functional pages, and added a Driver Roster page. The frontend now provides end-to-end CRUD for vehicles, a lap time history view per vehicle, and a team driver directory — closing the gap between the fully-featured backend and the frontend.

### Work Performed

1. **Vehicle Detail Page** (`VehicleDetailPage.tsx`)
   - Displays full vehicle specifications (make, model, year, category, racing number, VIN)
   - Performance summary card showing total laps recorded, best lap time, the driver who set it, and the event
   - Notes card and record metadata (ID, created/updated timestamps)
   - Full lap time history table with event link, session type, lap number, driver, lap time (monospace), sector 1/2/3, and validity badge
   - Best lap row highlighted; best lap marked with a star badge
   - Delete vehicle with confirmation dialog; navigates back to `/vehicles` on success

2. **Vehicle Form Page** (`VehicleFormPage.tsx`)
   - Shared create/edit page — detects edit mode from URL param `:id`
   - In edit mode: pre-populates form by fetching the existing vehicle
   - Client-side validation: make, model, year (1900–current+1), category required
   - Category dropdown with 11 predefined motorsport categories
   - Optional fields: racing number, VIN (max 17 chars), notes (textarea)
   - Handles API errors including duplicate VIN (409 conflict)
   - Redirects to vehicle detail page on success

3. **Drivers Page** (`DriversPage.tsx`)
   - Driver roster grid with profile cards
   - Avatar circle with initials, full name, email, and role badge (admin/user/viewer)
   - Optional detail fields: nationality, license number, date of birth, emergency contact
   - Bio section with italic styling
   - Delete driver profile with confirmation

4. **Frontend Types** (`frontend/src/types/driver.ts`)
   - `DriverUser`, `Driver`, `CreateDriverDto`, `UpdateDriverDto` interfaces

5. **Driver Service** (`frontend/src/services/driverService.ts`)
   - Full CRUD service: `getAllDrivers`, `getDriverById`, `createDriver`, `updateDriver`, `deleteDriver`
   - Wraps `/api/drivers` endpoints with typed `ApiResponse<T>` unwrapping

6. **App.tsx Routing Updates**
   - Replaced `/vehicles/:id` stub → `VehicleDetailPage`
   - Replaced `/vehicles/:id/edit` stub → `VehicleFormPage`
   - Replaced `/vehicles/new` stub → `VehicleFormPage`
   - Added `/drivers` route → `DriversPage`
   - Added **Drivers** nav link to the authenticated navbar
   - Moved `/vehicles/new` route before `/vehicles/:id` to prevent path collision

7. **App.css Additions**
   - Vehicle detail: `.vehicle-number-badge`, `.vehicle-category-tag`, `.vehicle-best-lap`
   - Lap time table: `.vehicle-laptimes-*`, `.laptime-*` classes for table, rows, badges
   - Vehicle form: `.vehicle-form-card`, `.vehicle-form-fieldset`, `.vehicle-form-legend`, `.form-error-banner`, `.form-field-error`, `.form-textarea`, `.form-input--error`
   - Driver cards: `.driver-grid`, `.driver-card`, `.driver-card-avatar`, `.driver-card-role--*`, `.driver-card-details`, `.driver-card-bio`
   - Shared detail header: `.detail-page-header-left`, `.detail-back-link`, `.detail-page-header-actions`
   - Responsive breakpoints for all new components

### Generated Code

#### `frontend/src/pages/VehicleDetailPage.tsx`
```typescript
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { vehicleService } from '../services/vehicleService';
import { analyticsService } from '../services/analyticsService';
import type { Vehicle } from '../types/vehicle';
import type { LapTime } from '../types/laptime';
// Full vehicle detail page with specs, performance summary, notes, metadata,
// and complete lap time history table. Best lap highlighted with star badge.
// Delete with confirmation dialog navigates back to /vehicles on success.
```

#### `frontend/src/pages/VehicleFormPage.tsx`
```typescript
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { vehicleService } from '../services/vehicleService';
import type { CreateVehicleDto } from '../types/vehicle';
// Shared create/edit form. isEdit = Boolean(id param).
// Validates make, model, year (1900–currentYear+1), category.
// Category dropdown: Formula, GT, Rally, Touring Car, Sports Prototype,
// Endurance, Karting, Drag, Oval, Off-Road, Other.
// Handles duplicate VIN 409 conflict from API.
```

#### `frontend/src/pages/DriversPage.tsx`
```typescript
import { useEffect, useState } from 'react';
import { driverService } from '../services/driverService';
import type { Driver } from '../types/driver';
// Driver roster grid. Avatar with initials, name, email, role badge.
// Optional: nationality, license number, DOB, emergency contact, bio.
// Delete profile with confirmation.
```

#### `frontend/src/types/driver.ts`
```typescript
export interface DriverUser {
  id: string; email: string; firstName: string; lastName: string; role: string;
}
export interface Driver {
  id: string; userId: string; licenseNumber: string | null;
  nationality: string | null; dateOfBirth: string | null;
  bio: string | null; emergencyContact: string | null;
  medicalNotes: string | null; createdAt: string; updatedAt: string;
  user: DriverUser;
}
export interface CreateDriverDto { userId: string; licenseNumber?: string; nationality?: string; dateOfBirth?: string; bio?: string; emergencyContact?: string; medicalNotes?: string; }
export interface UpdateDriverDto { licenseNumber?: string; nationality?: string; dateOfBirth?: string; bio?: string; emergencyContact?: string; medicalNotes?: string; }
```

#### `frontend/src/services/driverService.ts`
```typescript
import api from './api';
import type { Driver, CreateDriverDto, UpdateDriverDto } from '../types/driver';
export const driverService = {
  getAllDrivers: async (): Promise<Driver[]> => { /* GET /api/drivers */ },
  getDriverById: async (id: string): Promise<Driver> => { /* GET /api/drivers/:id */ },
  createDriver: async (data: CreateDriverDto): Promise<Driver> => { /* POST /api/drivers */ },
  updateDriver: async (id: string, data: UpdateDriverDto): Promise<Driver> => { /* PUT /api/drivers/:id */ },
  deleteDriver: async (id: string): Promise<void> => { /* DELETE /api/drivers/:id */ },
};
```

### Routes Added / Updated

| Route | Component | Change |
| :--- | :--- | :--- |
| `/vehicles/new` | `VehicleFormPage` | Replaced "Coming Soon" stub |
| `/vehicles/:id` | `VehicleDetailPage` | Replaced "Coming Soon" stub |
| `/vehicles/:id/edit` | `VehicleFormPage` | Replaced "Coming Soon" stub |
| `/drivers` | `DriversPage` | New route |

### Files Added
- `frontend/src/pages/VehicleDetailPage.tsx`
- `frontend/src/pages/VehicleFormPage.tsx`
- `frontend/src/pages/DriversPage.tsx`
- `frontend/src/types/driver.ts`
- `frontend/src/services/driverService.ts`

### Files Modified
- `frontend/src/App.tsx` — routing + Drivers nav link
- `frontend/src/App.css` — Phase 11 styles

### Next Phase Preview
**Phase 12** will implement **Event Create & Edit Forms** — replacing the remaining "Coming Soon" stubs for `/events/new` and `/events/:id/edit` with full form pages, completing the Event management CRUD UI.

---

## Phase 12: Backend + Frontend: Role-Based Access Control (RBAC)
**Status:** ✅ Completed  
**Date:** February 25, 2026

### Summary
Implemented a comprehensive Role-Based Access Control (RBAC) system across the entire application. Created a flexible `requireRole()` middleware that accepts any combination of roles, applied it to all backend routes (viewers = read-only, users = read/write, admins = full access), built admin-only user management endpoints, created an Admin Panel page for managing users, and added role-based navigation visibility and route guards on the frontend.

### Work Performed

1. **Flexible `requireRole()` Middleware**
   - Created `requireRole(...allowedRoles)` middleware that accepts a variadic list of role strings
   - Returns 403 Forbidden with a descriptive message when the user's role is not in the allowed list
   - Preserved existing `authenticate` and `requireAdmin` middleware for backward compatibility

2. **Backend Route Protection**
   - **Vehicle routes**: GET endpoints open to all authenticated roles; POST/PUT/DELETE restricted to `admin` and `user`
   - **Event routes**: Same pattern — read for all, write for admin/user
   - **Driver routes**: Same pattern — read for all, write for admin/user
   - **Setup routes**: Same pattern — read for all, write for admin/user
   - **Analytics routes**: GET/summary open to all; POST/PUT/DELETE lap times restricted to admin/user
   - All routes now require authentication via `router.use(authenticate)`

3. **Admin User Management API**
   - `GET /api/admin/users` — List all users with driver profile info
   - `GET /api/admin/users/:id` — Get detailed user info including recent setup sheets
   - `PATCH /api/admin/users/:id/role` — Update a user's role (admin/user/viewer) with self-change prevention
   - `PATCH /api/admin/users/:id/status` — Activate/deactivate a user account with self-change prevention
   - All admin endpoints protected with `authenticate` + `requireRole('admin')`

4. **Frontend Admin Panel Page**
   - Created `AdminPanelPage.tsx` with a full user management table
   - Inline role editing via dropdown select per user row
   - Activate/deactivate toggle buttons with confirmation feedback
   - User stats summary (total users, active count, admin count)
   - Success/error toast messages with auto-dismiss
   - Self-action prevention (cannot change own role or deactivate own account)
   - "You" badge indicator for the current admin user

5. **Frontend Role-Based Navigation & Route Guards**
   - Created `RoleGuard.tsx` component that restricts routes by allowed roles
   - Admin nav link only visible to admin users, styled with gold accent color
   - Write routes (vehicle create/edit, event create/edit) guarded with `RoleGuard` for admin/user only
   - Admin panel route guarded for admin-only access
   - Role-specific styling for user role badge in navbar (admin=gold, user=white, viewer=dim)

6. **Registered Admin Routes in Backend**
   - Added `adminRoutes` import and mount at `/api/admin` in `src/index.ts`
   - Updated API info endpoint to include admin endpoint listing

### Code Generated

#### `backend/src/middleware/auth.middleware.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/auth.types';

// Extend Express Request to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Access denied. No token provided.',
    });
    return;
  }

  const token = authHeader.substring(7);
  const jwtSecret = process.env['JWT_SECRET'];

  if (!jwtSecret) {
    res.status(500).json({
      success: false,
      error: 'Server configuration error: JWT secret not set.',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token.',
    });
  }
};

/**
 * Middleware to restrict access to admin role only
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required.',
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: 'Access denied. Admin role required.',
    });
    return;
  }

  next();
};

/**
 * Flexible role-based authorization middleware.
 * Accepts one or more roles that are allowed to access the route.
 */
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.user.role}.`,
      });
      return;
    }

    next();
  };
};
```

#### `backend/src/controllers/admin.controller.ts`
```typescript
import { Request, Response } from 'express';
import prisma from '../prisma';
import { VALID_ROLES } from '../types/auth.types';

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, isActive: true, createdAt: true, updatedAt: true,
        driver: { select: { id: true, licenseNumber: true, nationality: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: users, count: users.length });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch users.' });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, isActive: true, createdAt: true, updatedAt: true,
        driver: true,
        setupSheets: { select: { id: true, sessionType: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!user) { res.status(404).json({ success: false, error: 'User not found.' }); return; }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user.' });
  }
};

export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const { role } = req.body as { role: string };
    if (!role) { res.status(400).json({ success: false, error: 'Role is required.' }); return; }
    if (!VALID_ROLES.includes(role as (typeof VALID_ROLES)[number])) {
      res.status(400).json({ success: false, error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` }); return;
    }
    if (req.user && req.user.userId === id) {
      res.status(400).json({ success: false, error: 'You cannot change your own role.' }); return;
    }
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) { res.status(404).json({ success: false, error: 'User not found.' }); return; }
    const updatedUser = await prisma.user.update({
      where: { id }, data: { role },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, updatedAt: true },
    });
    res.json({ success: true, message: `User role updated to "${role}".`, data: updatedUser });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ success: false, error: 'Failed to update user role.' });
  }
};

export const toggleUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const { isActive } = req.body as { isActive: boolean };
    if (typeof isActive !== 'boolean') {
      res.status(400).json({ success: false, error: 'isActive must be a boolean value.' }); return;
    }
    if (req.user && req.user.userId === id) {
      res.status(400).json({ success: false, error: 'You cannot change your own account status.' }); return;
    }
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) { res.status(404).json({ success: false, error: 'User not found.' }); return; }
    const updatedUser = await prisma.user.update({
      where: { id }, data: { isActive },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, updatedAt: true },
    });
    res.json({ success: true, message: `User account ${isActive ? 'activated' : 'deactivated'}.`, data: updatedUser });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ success: false, error: 'Failed to update user status.' });
  }
};
```

#### `backend/src/routes/admin.routes.ts`
```typescript
import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { getAllUsers, getUserById, updateUserRole, toggleUserStatus } from '../controllers/admin.controller';

const router: Router = Router();

router.use(authenticate);
router.use(requireRole('admin'));

router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/status', toggleUserStatus);

export default router;
```

#### `backend/src/routes/vehicle.routes.ts` (updated)
```typescript
import { Router } from 'express';
import { getAllVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle } from '../controllers/vehicle.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router: Router = Router();
router.use(authenticate);

router.get('/', getAllVehicles);
router.get('/:id', getVehicleById);
router.post('/', requireRole('admin', 'user'), createVehicle);
router.put('/:id', requireRole('admin', 'user'), updateVehicle);
router.delete('/:id', requireRole('admin', 'user'), deleteVehicle);

export default router;
```

#### `frontend/src/types/admin.ts`
```typescript
export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  driver?: { id: string; licenseNumber?: string; nationality?: string; } | null;
}

export const VALID_ROLES = ['admin', 'user', 'viewer'] as const;
export type UserRole = (typeof VALID_ROLES)[number];
```

#### `frontend/src/services/adminService.ts`
```typescript
import api from './api';
import type { AdminUser } from '../types/admin';

interface ApiResponse<T> { success: boolean; message?: string; data: T; count?: number; }

export const adminService = {
  getAllUsers: async (): Promise<AdminUser[]> => {
    const response = await api.get<ApiResponse<AdminUser[]>>('/api/admin/users');
    return response.data.data;
  },
  getUserById: async (id: string): Promise<AdminUser> => {
    const response = await api.get<ApiResponse<AdminUser>>(`/api/admin/users/${id}`);
    return response.data.data;
  },
  updateUserRole: async (id: string, role: string): Promise<AdminUser> => {
    const response = await api.patch<ApiResponse<AdminUser>>(`/api/admin/users/${id}/role`, { role });
    return response.data.data;
  },
  toggleUserStatus: async (id: string, isActive: boolean): Promise<AdminUser> => {
    const response = await api.patch<ApiResponse<AdminUser>>(`/api/admin/users/${id}/status`, { isActive });
    return response.data.data;
  },
};
```

#### `frontend/src/components/RoleGuard.tsx`
```typescript
import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  fallback?: string;
}

const RoleGuard = ({ children, allowedRoles, fallback = '/' }: RoleGuardProps) => {
  const { user } = useAuth();
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={fallback} replace />;
  }
  return <>{children}</>;
};

export default RoleGuard;
```

#### `frontend/src/pages/AdminPanelPage.tsx`
```typescript
// Full admin panel with user management table, role editing, status toggling,
// stats summary, success/error feedback, and self-action prevention.
// (See full source in repository)
```

### Files Created
- `backend/src/controllers/admin.controller.ts`
- `backend/src/routes/admin.routes.ts`
- `frontend/src/types/admin.ts`
- `frontend/src/services/adminService.ts`
- `frontend/src/components/RoleGuard.tsx`
- `frontend/src/pages/AdminPanelPage.tsx`

### Files Modified
- `backend/src/middleware/auth.middleware.ts` — added `requireRole()` middleware
- `backend/src/index.ts` — registered admin routes at `/api/admin`
- `backend/src/routes/vehicle.routes.ts` — added `authenticate` + `requireRole` RBAC
- `backend/src/routes/event.routes.ts` — added `authenticate` + `requireRole` RBAC
- `backend/src/routes/driver.routes.ts` — added `requireRole` to write routes
- `backend/src/routes/setup.routes.ts` — added `requireRole` to write routes
- `backend/src/routes/analytics.routes.ts` — added `requireRole` to write routes
- `frontend/src/App.tsx` — added Admin nav link, RoleGuard on write routes, admin route
- `frontend/src/App.css` — added admin panel and RBAC-related styles
- `project_plan.md` — added phases 12–17, marked Phase 12 as Done

### RBAC Permission Matrix

| Action | Admin | User | Viewer |
|:---|:---:|:---:|:---:|
| View vehicles, events, drivers, setups, analytics | ✅ | ✅ | ✅ |
| Create/edit/delete vehicles, events, drivers, setups, lap times | ✅ | ✅ | ❌ |
| Access admin panel | ✅ | ❌ | ❌ |
| Manage user roles | ✅ | ❌ | ❌ |
| Activate/deactivate users | ✅ | ❌ | ❌ |

### Next Phase Preview
**Phase 13** will implement **Weather Integration for Events** — integrating a weather API to fetch forecasts by event venue and date, building a backend proxy endpoint, and displaying a weather widget on the Event Detail page.

---
