# Changelog: Motorsports Management Web App

> This file is the **index** of all development phases. Full details for each phase are stored in [`changelog/phases/`](changelog/phases/).
> The agent appends new entries to this index and creates a dedicated file per phase — keeping this file lean and navigable.

---

## Summary Table

| Phase | Title | Date | Status |
| :---: | :---- | :--- | :----- |
| 1 | [Phase 1: Backend Project & DB Setup](changelog/phases/phase-01.md) | February 16, 2026 | ✅ Completed |
| 2 | [Phase 2: Backend: Vehicle Model & API](changelog/phases/phase-02.md) | February 17, 2026 | ✅ Completed |
| 3 | [Phase 3: Frontend: Project Setup & Vehicle List](changelog/phases/phase-03.md) | February 18, 2026 | ✅ Completed |
| 4 | [Phase 4: Backend: Event Model & API](changelog/phases/phase-04.md) | February 19, 2026 | ✅ Completed |
| 5 | [Phase 5: Frontend: Event List & Detail View](changelog/phases/phase-05.md) | February 20, 2026 | ✅ Completed |
| 6 | [Phase 6: Backend: `User` & `Driver` Models & Auth](changelog/phases/phase-06.md) | February 20, 2026 | ✅ Completed |
| 7 | [Phase 7: Frontend: Authentication Flow](changelog/phases/phase-07.md) | February 21, 2026 | ✅ Completed |
| 8 | [Phase 8: Backend: `SetupSheet` Model & Relations](changelog/phases/phase-08.md) | February 22, 2026 | ✅ Completed |
| 9 | [Phase 9: Frontend: Digital Setup Sheet Form](changelog/phases/phase-09.md) | February 23, 2026 | ✅ Completed |
| 10 | [Phase 10: Frontend + Backend: Performance Analytics Dashboard](changelog/phases/phase-10.md) | February 24, 2026 | ✅ Completed |
| 11 | [Phase 11: Frontend: Vehicle Detail, Create & Edit Pages + Driver Roster](changelog/phases/phase-11.md) | February 25, 2026 | ✅ Completed |
| 12 | [Phase 12: Backend + Frontend: Role-Based Access Control (RBAC)](changelog/phases/phase-12.md) | February 25, 2026 | ✅ Completed |
| 13 | [Phase 13: Backend + Frontend: Weather Integration for Events](changelog/phases/phase-13.md) | February 26, 2026 | ✅ Completed |
| 14 | [Phase 14: Backend + Frontend: Parts & Inventory Management](changelog/phases/phase-14.md) | February 26, 2026 | ✅ Completed |
| 15 | [Phase 15: Backend + Frontend: Photo & Document Uploads (S3)](changelog/phases/phase-15.md) | 2026-02-27 | ✅ Completed |
| 16 | [Phase 16: Frontend: Responsive UI Polish & Dark Mode](changelog/phases/phase-16.md) | February 28, 2026 | ✅ Completed |
| 17 | [Phase 17: DevOps: Docker Deployment Configuration](changelog/phases/phase-17.md) | March 1, 2026 | ✅ Completed |
| 18 | [Phase 18: DevOps: CI/CD with GitHub Actions](changelog/phases/phase-18.md) | March 2, 2026 | ✅ Completed |
| 19 | [Phase 19: Backend Unit & Integration Testing](changelog/phases/phase-19.md) | March 3, 2026 | ✅ Completed |
| 20 | [Phase 20: Frontend: Component & End-to-End Testing](changelog/phases/phase-20.md) | March 4, 2026 | ✅ Completed |
| 21 | [Phase 21: DevOps: Monitoring & Observability](changelog/phases/phase-21.md) | March 5, 2026 | ✅ Completed |
| 22 | [Phase 22: Backend + Frontend: Real-Time Notifications (WebSockets)](changelog/phases/phase-22.md) | March 6, 2026 | ✅ Completed |
| 23 | [Phase 23: Mobile App: React Native Scaffolding & Auth](changelog/phases/phase-23.md) | March 7, 2026 | ✅ Completed |
| 24 | [Phase 24: Mobile App: Core Screens (Vehicles, Events, Lap Times)](changelog/phases/phase-24.md) | March 8, 2026 | ✅ Completed |
| 25 | [Phase 25: Advanced Analytics: Telemetry Data Ingestion & Visualization](changelog/phases/phase-25.md) | March 9, 2026 | ✅ Completed |
| 26 | [Phase 26: AI-Powered Lap Time Coaching & Debrief](changelog/phases/phase-26.md) | March 10, 2026 | ✅ Completed |
| 27 | [Phase 27: Predictive Performance Modeling](changelog/phases/phase-27.md) | March 10, 2026 | 🚧 Not Started |
| 28 | [Phase 28: Multi-Tenant Team Management & Invitations](changelog/phases/phase-28.md) | March 10, 2026 | 🚧 Not Started |
| 29 | [Phase 29: Event Race-Day Live Dashboard (Real-Time)](changelog/phases/phase-29.md) | March 10, 2026 | 🚧 Not Started |
| 30 | [Phase 30: Offline-First Mobile App with Background Sync](changelog/phases/phase-30.md) | March 10, 2026 | 🚧 Not Started |

---

## Recent Entries

> The 5 most recent phases are summarised below. For full history, browse [`changelog/phases/`](changelog/phases/).

### Phase 26: AI-Powered Lap Time Coaching & Debrief
**Date:** March 10, 2026 &nbsp;|&nbsp; **Status:** ✅ Completed

Integrated an OpenAI-compatible LLM to analyse lap telemetry statistics and produce natural-language coaching reports. Added a persistent `Debrief` model (Prisma + migration), a stateless LLM service, four REST endpoints under `/api/debriefs`, and a full chat-based `DebriefPage` on the frontend with history sidebar, message bubbles, typing indicator, and dark-mode CSS.

[Full details →](changelog/phases/phase-26.md)

---

### Phase 27: Predictive Performance Modeling
**Date:** March 10, 2026 &nbsp;|&nbsp; **Status:** 🚧 Not Started

This phase will introduce a predictive modeling capability to the platform, allowing teams to forecast lap times and understand the potential impact of setup changes. By building a backend service that leverages a regression model, the system will be able to move beyond historical analysis and provide forward-looking insights. This will empower teams to make more informed, data-driven decisions on vehicle setup and race strategy.

[Full details →](changelog/phases/phase-27.md)

---

### Phase 28: Multi-Tenant Team Management & Invitations
**Date:** March 10, 2026 &nbsp;|&nbsp; **Status:** 🚧 Not Started

This phase will re-architect the platform to support multi-tenancy, a critical step for enabling commercial use and managing multiple teams within a single instance. By introducing a `Team` model and scoping all data to a `teamId`, the system will ensure complete data isolation between different organizations. A new invitation system will allow team owners to securely add new members, laying the groundwork for a scalable, SaaS-ready architecture.

[Full details →](changelog/phases/phase-28.md)

---

### Phase 29: Event Race-Day Live Dashboard (Real-Time)
**Date:** March 10, 2026 &nbsp;|&nbsp; **Status:** 🚧 Not Started

This phase will build upon the existing WebSocket infrastructure to create a real-time, live dashboard for race day. This will provide teams with immediate, synchronized information, such as lap times, leaderboard positions, and session status. The goal is to create a central information hub that can be used by the entire team, both in the pits and remotely, to make critical in-session decisions.

[Full details →](changelog/phases/phase-29.md)

---

### Phase 30: Offline-First Mobile App with Background Sync
**Date:** March 10, 2026 &nbsp;|&nbsp; **Status:** 🚧 Not Started

This phase will enhance the React Native mobile app with offline-first capabilities, ensuring that it remains functional even in disconnected track environments. By integrating a local database and a background synchronization mechanism, users will be able to continue recording data, such as lap times and setup changes, without an active internet connection. This data will be stored locally and automatically synced with the server once connectivity is restored, preventing data loss and improving the app's reliability.

[Full details →](changelog/phases/phase-30.md)

---

## Adding New Entries

When completing a new phase, the agent must:

1. Create `changelog/phases/phase-XX.md` with the full phase details.
2. Append a new row to the **Summary Table** above.
3. Update the **Recent Entries** section (keep only the last 5 phases).
4. Commit both files together.

This keeps `changelog.md` permanently small (~100 lines) while preserving full history.
