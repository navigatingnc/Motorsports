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
