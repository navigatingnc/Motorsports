# Phase 4: Backend: Event Model & API

**Date:** February 19, 2026  
**Status:** ✅ Completed

---

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
