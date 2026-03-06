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

---

## Recent Entries

> The 5 most recent phases are summarised below. For full history, browse [`changelog/phases/`](changelog/phases/).

### Phase 18: DevOps: CI/CD with GitHub Actions
**Date:** March 2, 2026 &nbsp;|&nbsp; **Status:** ✅ Completed

Implemented a complete CI/CD pipeline using GitHub Actions with three purpose-built workflows. The pipeline provides ...

[Full details →](changelog/phases/phase-18.md)

---

### Phase 19: Backend Unit & Integration Testing
**Date:** March 3, 2026 &nbsp;|&nbsp; **Status:** ✅ Completed

Established a comprehensive backend testing suite using **Jest**, **ts-jest**, **Supertest**, and **jest-mock-extende...

[Full details →](changelog/phases/phase-19.md)

---

### Phase 20: Frontend: Component & End-to-End Testing
**Date:** March 4, 2026 &nbsp;|&nbsp; **Status:** ✅ Completed

Installed and configured **Vitest 4** with **React Testing Library** for component-level tests and **Playwright 1.58*...

[Full details →](changelog/phases/phase-20.md)

---

### Phase 21: DevOps: Monitoring & Observability
**Date:** March 5, 2026 &nbsp;|&nbsp; **Status:** ✅ Completed

Integrated comprehensive monitoring and observability into the Motorsports Management application. The backend now us...

[Full details →](changelog/phases/phase-21.md)

---

### Phase 22: Backend + Frontend: Real-Time Notifications (WebSockets)
**Date:** March 6, 2026 &nbsp;|&nbsp; **Status:** ✅ Completed

Integrated Socket.IO into the Express backend with JWT-authenticated WebSocket connections. Defined a `Notification` ...

[Full details →](changelog/phases/phase-22.md)

---

## Adding New Entries

When completing a new phase, the agent must:

1. Create `changelog/phases/phase-XX.md` with the full phase details.
2. Append a new row to the **Summary Table** above.
3. Update the **Recent Entries** section (keep only the last 5 phases).
4. Commit both files together.

This keeps `changelog.md` permanently small (~100 lines) while preserving full history.
