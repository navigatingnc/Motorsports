# Phase 10: Frontend + Backend: Performance Analytics Dashboard

**Date:** February 24, 2026  
**Status:** ✅ Completed

---

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
