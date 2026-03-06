# Phase 8: Backend: `SetupSheet` Model & Relations

**Date:** February 22, 2026  
**Status:** ✅ Completed

---

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
