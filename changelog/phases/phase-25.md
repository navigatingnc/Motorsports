# Phase 25: Advanced Analytics — Telemetry Data Ingestion & Visualization

**Date:** March 9, 2026 &nbsp;|&nbsp; **Status:** ✅ Completed  
**Branch:** `phase-25-telemetry-analytics`

---

## Summary

Phase 25 delivers end-to-end telemetry support for the Motorsports Management application. A new `Telemetry` Prisma model stores high-frequency data-logger samples (speed, RPM, throttle, brake, gear, GPS lat/lng) linked to individual laps. A high-throughput `POST /api/telemetry/batch` endpoint uses Prisma `createMany` for a single database round-trip, making it suitable for bulk uploads from real data loggers. A `GET /api/telemetry/:lapTimeId` endpoint retrieves the full trace ordered by `offsetMs`, and a `DELETE` endpoint allows re-uploading corrected data. On the frontend, `TelemetryDetailPage.tsx` renders synchronized multi-channel Recharts line charts with interactive channel toggles, a speed-coloured GPS track map rendered as an inline SVG, and a raw samples table. All new code follows the existing TypeScript, Pino logging, RBAC, and CSS custom-property dark-mode conventions established in previous phases.

---

## Tasks Completed

### Task 1 — Prisma: `Telemetry` Model

Added the `Telemetry` model to `backend/prisma/schema.prisma`:

```prisma
/// High-frequency telemetry data point captured by an on-board data logger.
model Telemetry {
  id         String   @id @default(uuid())
  lapTimeId  String
  lapTime    LapTime  @relation(fields: [lapTimeId], references: [id], onDelete: Cascade)
  offsetMs   Int      // milliseconds from lap start
  speed      Float?   // km/h
  rpm        Float?   // engine RPM
  throttle   Float?   // 0–100 %
  brake      Float?   // 0–100 %
  gear       Int?     // current gear (0 = neutral)
  gpsLat     Float?   // decimal degrees
  gpsLng     Float?   // decimal degrees
  createdAt  DateTime @default(now())

  @@index([lapTimeId, offsetMs])
  @@map("telemetry")
}
```

The `LapTime` model was updated to include a `telemetry Telemetry[]` back-relation. The composite index on `(lapTimeId, offsetMs)` ensures efficient ordered retrieval of a full lap trace.

### Task 2 — Backend: Telemetry Controller & Routes

**`backend/src/types/telemetry.types.ts`** — Type definitions for `TelemetrySample`, `TelemetrySampleDto`, and `BatchIngestDto`.

**`backend/src/controllers/telemetry.controller.ts`** — Three handlers:

| Handler | Method | Path | Description |
| :--- | :--- | :--- | :--- |
| `batchIngestTelemetry` | POST | `/api/telemetry/batch` | Bulk-ingest samples via `createMany` |
| `getTelemetryByLap` | GET | `/api/telemetry/:lapTimeId` | Retrieve full trace ordered by `offsetMs` |
| `deleteTelemetryByLap` | DELETE | `/api/telemetry/:lapTimeId` | Clear all samples for a lap |

**`backend/src/routes/telemetry.routes.ts`** — All routes require `authenticate`; write routes additionally require `requireRole('admin', 'user')`.

**`backend/src/index.ts`** — Registered `telemetryRoutes` at `/api/telemetry` and added the endpoint to the API info response.

### Task 3 — Frontend: Types, Service & TelemetryDetailPage

**`frontend/src/types/telemetry.ts`** — Frontend mirror of backend types: `TelemetrySample`, `TelemetryLapMeta`, `TelemetryTrace`, `BatchIngestDto`.

**`frontend/src/services/telemetryService.ts`** — Three methods: `batchIngest`, `getByLap`, `deleteByLap`.

**`frontend/src/pages/TelemetryDetailPage.tsx`** — Full-featured visualization page:

- **Lap metadata header** — four stat cards showing lap time, driver, vehicle, and sample count.
- **Channel toggles** — pill buttons to show/hide individual channels (speed, throttle, brake, RPM, gear) with per-channel accent colours.
- **Multi-channel Recharts `LineChart`** — downsampled to ≤ 500 points for rendering performance; custom tooltip shows formatted values; `onMouseMove` syncs cursor index to the GPS map.
- **GPS track map (SVG renderer)** — segments coloured green/yellow/red by speed ratio; a red cursor dot tracks the chart hover position; start marker in green; built-in speed legend.
- **Raw samples table** — first 50 rows with all channel values; horizontally scrollable on mobile.

**`frontend/src/telemetry.css`** — Responsive stylesheet using CSS custom properties for dark-mode compatibility; breakpoints for mobile (≤ 600 px).

**`frontend/src/App.tsx`** — Added `TelemetryDetailPage` import, `telemetry.css` import, and the `/telemetry/:lapTimeId` protected route.

---

## Generated Code

| File | Type | Description |
| :--- | :--- | :--- |
| `backend/prisma/schema.prisma` | Modified | Added `Telemetry` model and `telemetry[]` relation on `LapTime` |
| `backend/src/types/telemetry.types.ts` | New | Backend type definitions for telemetry samples and DTOs |
| `backend/src/controllers/telemetry.controller.ts` | New | Batch ingest, retrieve, and delete handlers |
| `backend/src/routes/telemetry.routes.ts` | New | Route definitions with auth + RBAC guards |
| `backend/src/index.ts` | Modified | Registered telemetry routes and updated API info |
| `frontend/src/types/telemetry.ts` | New | Frontend type definitions mirroring backend shapes |
| `frontend/src/services/telemetryService.ts` | New | API client methods for telemetry endpoints |
| `frontend/src/pages/TelemetryDetailPage.tsx` | New | Full telemetry visualization page |
| `frontend/src/telemetry.css` | New | Responsive stylesheet with dark-mode support |
| `frontend/src/App.tsx` | Modified | Added telemetry route and CSS import |

---

## Next Phase Preview

There are no further phases defined in `project_plan.md` beyond Phase 25. The project plan is now fully complete.

---
