# Phase 26: AI-Powered Lap Time Coaching & Debrief

**Date:** 2026-03-10
**Status:** ✅ Complete

---

## Summary

Phase 26 introduces a fully integrated AI coaching layer to the Motorsports Management platform. An OpenAI-compatible LLM analyses lap telemetry statistics and produces natural-language coaching reports. Drivers can continue the conversation with follow-up questions, building a persistent debrief history per lap. The feature is designed to degrade gracefully: when `OPENAI_API_KEY` is not configured the backend returns an informative stub response rather than an error, making the feature safe to deploy before the API key is provisioned.

The implementation follows all established project conventions — TypeScript strict mode, Pino structured logging, JWT RBAC middleware, Prisma for persistence, CSS custom-property dark-mode theming, and the existing axios `api` client on the frontend.

---

## Tasks Completed

### Task 1 — Prisma: `Debrief` Model

Added the `Debrief` model to `backend/prisma/schema.prisma`:

```prisma
/// AI-generated coaching debrief produced by the LLM for a specific lap.
/// Stores the full conversation history so the driver can continue chatting.
model Debrief {
  id          String   @id @default(uuid())
  lapTimeId   String
  lapTime     LapTime  @relation(fields: [lapTimeId], references: [id], onDelete: Cascade)
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages    Json
  title       String   @default("Lap Debrief")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([lapTimeId])
  @@index([userId])
  @@map("debriefs")
}
```

The `LapTime` model was updated with a `debriefs Debrief[]` back-relation, and the `User` model was updated with a `debriefs Debrief[]` back-relation. A hand-written migration SQL file was added at `backend/prisma/migrations/20260310000000_add_debrief_model/migration.sql`.

### Task 2 — Backend: LLM Service, Controller & Routes

**`backend/src/types/debrief.types.ts`** — Type definitions for `DebriefMessage`, `AnalyzeDebriefDto`, `DebriefSummary`, and `DebriefPayload`.

**`backend/src/services/debrief.service.ts`** — Stateless LLM integration service:

| Export | Description |
| :--- | :--- |
| `buildTelemetrySummary()` | Formats lap metadata and computed telemetry statistics into a compact text block for the LLM prompt |
| `buildInitialMessages()` | Constructs the initial `[system, user]` message array for a new debrief |
| `appendUserMessage()` | Appends a follow-up user message to an existing conversation |
| `callLLM()` | Sends the conversation to the OpenAI-compatible API and returns the assistant reply; returns a stub message when `OPENAI_API_KEY` is absent |

The system prompt instructs the model to identify the three most impactful improvement areas, reference specific telemetry channels, and invite follow-up questions.

**`backend/src/controllers/debrief.controller.ts`** — Four handlers:

| Handler | Method | Path | Description |
| :--- | :--- | :--- | :--- |
| `analyzeDebrief` | POST | `/api/debriefs/analyze` | Create or continue a debrief session; computes telemetry statistics, calls the LLM, persists the conversation |
| `getDebriefsByLap` | GET | `/api/debriefs/lap/:lapTimeId` | List all debrief summaries for a lap (messages excluded) |
| `getDebriefById` | GET | `/api/debriefs/:id` | Retrieve a single debrief with full conversation messages |
| `deleteDebrief` | DELETE | `/api/debriefs/:id` | Delete a debrief; owner or admin only |

**`backend/src/routes/debrief.routes.ts`** — All routes require `authenticate`; write routes additionally require `requireRole('admin', 'user')`.

**`backend/src/index.ts`** — Registered `debriefRoutes` at `/api/debriefs`, added the endpoint to the API info response, and added a startup log line.

**`backend/.env.example`** — Added `OPENAI_API_KEY`, `OPENAI_BASE_URL`, and `OPENAI_MODEL` documentation.

### Task 3 — Frontend: Types, Service, CSS & DebriefPage

**`frontend/src/types/debrief.ts`** — Frontend mirror of backend types: `DebriefMessage`, `DebriefSummary`, `Debrief`, `AnalyzeDebriefResponse`, `AnalyzeDebriefDto`.

**`frontend/src/services/debriefService.ts`** — Four methods: `analyzeDebrief`, `getDebriefsByLap`, `getDebriefById`, `deleteDebrief`.

**`frontend/src/pages/DebriefPage.tsx`** — Full-featured coaching interface:

- **Lap selector** — dropdown populated from `GET /api/analytics/laptimes`; changing the selection resets the chat and reloads debrief history.
- **History sidebar** — lists past debrief sessions for the selected lap; clicking a session loads the full conversation; active session highlighted with a left border accent.
- **New Debrief button** — calls `POST /api/debriefs/analyze` with only `lapTimeId`; the backend computes telemetry statistics and generates the initial coaching report.
- **Chat panel** — renders `user` and `assistant` messages as styled bubbles (system messages filtered out); animated three-dot typing indicator while the LLM is responding; auto-scrolls to the latest message.
- **Follow-up input** — `<textarea>` with Enter-to-send (Shift+Enter for newline); disabled during loading; optimistic UI (user message appears immediately, rolled back on error).
- **Delete** — confirmation dialog before deleting; refreshes history on success.

**`frontend/src/debrief.css`** — Responsive stylesheet using CSS custom properties for dark-mode compatibility; two-column layout collapses to single column at ≤ 768 px; animated typing indicator; dark-mode overrides for message bubbles and inputs.

**`frontend/src/App.tsx`** — Added `DebriefPage` import, `debrief.css` import, `AI Debrief` nav link (between Analytics and Parts), and the `/debrief` protected route.

---

## Generated Code

| File | Type | Description |
| :--- | :--- | :--- |
| `backend/prisma/schema.prisma` | Modified | Added `Debrief` model and back-relations on `LapTime` and `User` |
| `backend/prisma/migrations/20260310000000_add_debrief_model/migration.sql` | New | SQL migration for the `debriefs` table |
| `backend/src/types/debrief.types.ts` | New | Backend type definitions for debrief DTOs and payloads |
| `backend/src/services/debrief.service.ts` | New | LLM integration service with telemetry summarisation and conversation management |
| `backend/src/controllers/debrief.controller.ts` | New | Analyze, list, get, and delete handlers |
| `backend/src/routes/debrief.routes.ts` | New | Route definitions with auth + RBAC guards |
| `backend/src/index.ts` | Modified | Registered debrief routes and updated API info |
| `backend/.env.example` | Modified | Added `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_MODEL` |
| `frontend/src/types/debrief.ts` | New | Frontend type definitions mirroring backend shapes |
| `frontend/src/services/debriefService.ts` | New | API client methods for debrief endpoints |
| `frontend/src/pages/DebriefPage.tsx` | New | Full coaching & chat interface page |
| `frontend/src/debrief.css` | New | Responsive stylesheet with dark-mode support |
| `frontend/src/App.tsx` | Modified | Added debrief route, nav link, and CSS import |

---
