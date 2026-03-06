# Phase 14: Backend + Frontend: Parts & Inventory Management

**Date:** February 26, 2026  
**Status:** ✅ Completed

---

### Summary
Built a full parts and inventory management system. The backend defines a `Part` Prisma model with 13 categories, optional vehicle association, and a configurable low-stock threshold. Six CRUD endpoints plus a quantity-adjustment endpoint and an inventory summary endpoint are exposed under `/api/parts`. The frontend delivers a `PartsPage` with a 4-card summary dashboard, a dismissable low-stock alert banner, a full inventory table with search, category/vehicle/low-stock filters, inline quantity adjustment, and a create/edit modal form.

### Work Performed

1. **Backend: Prisma Schema (`backend/prisma/schema.prisma`)**
   - Added `Part` model with fields: `name`, `partNumber`, `category`, `quantity`, `unit`, `cost`, `supplier`, `location`, `lowStockThreshold`, `notes`, `vehicleId` (optional FK to Vehicle with `onDelete: SetNull`)
   - Added `parts Part[]` relation to the `Vehicle` model

2. **Backend: Migration (`backend/prisma/migrations/20260226000000_add_part_model/migration.sql`)**
   - `CREATE TABLE "parts"` with all columns and primary key
   - `ALTER TABLE "parts" ADD CONSTRAINT "parts_vehicleId_fkey"` foreign key to `vehicles`

3. **Backend: Part Types (`backend/src/types/part.types.ts`)**
   - `CreatePartDto`, `UpdatePartDto`, `AdjustQuantityDto`
   - `VALID_PART_CATEGORIES` (13 values: Engine, Suspension, Brakes, Tyres, Bodywork, Drivetrain, Fuel System, Electrical, Electronics, Safety, Consumables, Tools, Other)
   - `VALID_PART_UNITS` (8 values: pcs, sets, pairs, liters, kg, g, m, boxes)

4. **Backend: Parts Controller (`backend/src/controllers/part.controller.ts`)**
   - `getAllParts` — filters by `?category`, `?vehicleId`, `?search` (name/partNumber/supplier/location), `?lowStock=true`; enriches each record with `isLowStock` boolean
   - `getPartById` — single part with vehicle relation
   - `createPart` — validates required fields, category enum, non-negative quantity/cost, vehicle existence
   - `updatePart` — partial update with same validations
   - `adjustPartQuantity` — delta-based quantity update (`PATCH /:id/adjust`); rejects if result would be negative
   - `deletePart` — hard delete
   - `getInventorySummary` — aggregates total parts, total items, total value, low-stock count + list, and per-category breakdown

5. **Backend: Parts Routes (`backend/src/routes/part.routes.ts`)**
   - GET routes accessible to all authenticated roles
   - POST/PUT/PATCH/DELETE require `admin` or `user` role
   - `/summary` route placed before `/:id` to avoid parameter capture

6. **Backend: Route Registration (`backend/src/index.ts`)**
   - Imported and registered `partRoutes` at `/api/parts`
   - Added `parts` to the API info endpoint

7. **Frontend: Part Types (`frontend/src/types/part.ts`)**
   - `Part`, `PartVehicle`, `CreatePartDto`, `UpdatePartDto`, `AdjustQuantityDto`, `InventorySummary`
   - `PART_CATEGORIES`, `PART_UNITS` constant arrays

8. **Frontend: Part Service (`frontend/src/services/partService.ts`)**
   - `getAllParts(params?)`, `getInventorySummary()`, `getPartById(id)`, `createPart(data)`, `updatePart(id, data)`, `adjustQuantity(id, data)`, `deletePart(id)`

9. **Frontend: PartsPage (`frontend/src/pages/PartsPage.tsx`)**
   - **SummaryCards**: 4-card grid showing total part types, total items in stock, total inventory value (USD), and low-stock alert count (highlighted red when > 0)
   - **LowStockBanner**: dismissable yellow alert banner listing every part at or below its threshold with current qty, threshold, and category
   - **Filters bar**: full-text search input (name/part#/supplier/location), category dropdown, vehicle dropdown, low-stock-only checkbox, clear-filters button
   - **Inventory table**: columns for name, category (color-coded badge), part#, qty, unit, cost/unit, supplier, storage location, vehicle, status badge (OK/Low), and action buttons (±, Edit, Del)
   - **PartForm modal**: create/edit form with all 10 fields, vehicle selector, required-field validation
   - **AdjustModal**: +/- stepper with live preview of new quantity, rejects negative results

10. **Frontend: Parts CSS (`frontend/src/parts.css`)**
    - Full responsive stylesheet with breakpoints at 900px and 640px
    - Category color-coded badges, status badges, table row highlighting for low-stock items

11. **Frontend: App.tsx**
    - Added `import PartsPage` and `/parts` route (all authenticated roles)
    - Added "Parts" nav link between Analytics and Admin

### API Endpoints

| Method | Path | Auth | Description |
|:---|:---|:---|:---|
| `GET` | `/api/parts` | Any role | List parts with optional filters |
| `GET` | `/api/parts/summary` | Any role | Inventory summary (totals, by-category) |
| `GET` | `/api/parts/:id` | Any role | Single part by ID |
| `POST` | `/api/parts` | admin/user | Create new part |
| `PUT` | `/api/parts/:id` | admin/user | Update part |
| `PATCH` | `/api/parts/:id/adjust` | admin/user | Adjust quantity by delta |
| `DELETE` | `/api/parts/:id` | admin/user | Delete part |

### Code Generated

#### `backend/prisma/schema.prisma` (Part model addition)
```prisma
model Part {
  id                String   @id @default(uuid())
  name              String
  partNumber        String?
  category          String
  quantity          Int      @default(0)
  unit              String   @default("pcs")
  cost              Float?
  supplier          String?
  location          String?
  lowStockThreshold Int      @default(2)
  notes             String?  @db.Text
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  vehicleId         String?
  vehicle           Vehicle? @relation(fields: [vehicleId], references: [id], onDelete: SetNull)
  @@map("parts")
}
```

#### `backend/prisma/migrations/20260226000000_add_part_model/migration.sql`
```sql
CREATE TABLE "parts" (
    "id"                 TEXT NOT NULL,
    "name"               TEXT NOT NULL,
    "partNumber"         TEXT,
    "category"           TEXT NOT NULL,
    "quantity"           INTEGER NOT NULL DEFAULT 0,
    "unit"               TEXT NOT NULL DEFAULT 'pcs',
    "cost"               DOUBLE PRECISION,
    "supplier"           TEXT,
    "location"           TEXT,
    "lowStockThreshold"  INTEGER NOT NULL DEFAULT 2,
    "notes"              TEXT,
    "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"          TIMESTAMP(3) NOT NULL,
    "vehicleId"          TEXT,
    CONSTRAINT "parts_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "parts" ADD CONSTRAINT "parts_vehicleId_fkey"
    FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
```

#### `backend/src/types/part.types.ts`
```typescript
export interface CreatePartDto {
  name: string; partNumber?: string; category: string;
  quantity?: number; unit?: string; cost?: number;
  supplier?: string; location?: string; lowStockThreshold?: number;
  notes?: string; vehicleId?: string;
}
export interface UpdatePartDto { /* all fields optional */ }
export interface AdjustQuantityDto { adjustment: number; notes?: string; }
export const VALID_PART_CATEGORIES = [
  'Engine','Suspension','Brakes','Tyres','Bodywork','Drivetrain',
  'Fuel System','Electrical','Electronics','Safety','Consumables','Tools','Other'
] as const;
export const VALID_PART_UNITS = ['pcs','sets','pairs','liters','kg','g','m','boxes'] as const;
```

#### `backend/src/controllers/part.controller.ts` (key signatures)
```typescript
export const getAllParts          = async (req, res) => { /* filters + isLowStock enrichment */ };
export const getPartById          = async (req, res) => { /* single part */ };
export const createPart           = async (req, res) => { /* validation + create */ };
export const updatePart           = async (req, res) => { /* partial update */ };
export const adjustPartQuantity   = async (req, res) => { /* delta qty, rejects negative */ };
export const deletePart           = async (req, res) => { /* hard delete */ };
export const getInventorySummary  = async (req, res) => { /* totals + byCategory */ };
```

#### `backend/src/routes/part.routes.ts`
```typescript
router.get('/',          getAllParts);
router.get('/summary',   getInventorySummary);
router.get('/:id',       getPartById);
router.post('/',                  requireRole('admin','user'), createPart);
router.put('/:id',                requireRole('admin','user'), updatePart);
router.patch('/:id/adjust',       requireRole('admin','user'), adjustPartQuantity);
router.delete('/:id',             requireRole('admin','user'), deletePart);
```

#### `frontend/src/services/partService.ts`
```typescript
export const partService = {
  getAllParts:         async (params?) => { /* GET /api/parts?... */ },
  getInventorySummary:async ()         => { /* GET /api/parts/summary */ },
  getPartById:        async (id)       => { /* GET /api/parts/:id */ },
  createPart:         async (data)     => { /* POST /api/parts */ },
  updatePart:         async (id, data) => { /* PUT /api/parts/:id */ },
  adjustQuantity:     async (id, data) => { /* PATCH /api/parts/:id/adjust */ },
  deletePart:         async (id)       => { /* DELETE /api/parts/:id */ },
};
```

### Next Phase Preview
**Phase 15** will implement **Photo & Document Uploads (S3)** — configuring S3-compatible storage with presigned upload URLs, building `/api/uploads` endpoints for file management, and adding photo galleries to Vehicle and Event detail pages with drag-and-drop upload UI.

---


---
