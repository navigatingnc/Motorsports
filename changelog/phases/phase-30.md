# Phase 30: Event Race-Day Live Dashboard (Real-Time)

**Date:** 2026-03-10
**Status:** 🚧 Not Started

---

### Summary

This phase will build upon the existing WebSocket infrastructure to create a real-time, live dashboard for race day. This will provide teams with immediate, synchronized information, such as lap times, leaderboard positions, and session status. The goal is to create a central information hub that can be used by the entire team, both in the pits and remotely, to make critical in-session decisions.

### Work Performed

*   **Backend:**
    *   Extend the existing Socket.IO implementation to include dedicated rooms for race events.
    *   Create new real-time events for broadcasting lap times, leaderboard changes, and other race-day data.
*   **Frontend:**
    *   Create a new `RaceDayPage.tsx` to serve as the live dashboard.
    *   Implement various real-time components, including a live leaderboard, gap tickers, and a session clock.
    *   Add a full-screen "pit wall" mode for displaying the dashboard on large screens.

### Generated Code

| File Path | Description |
| :--- | :--- |
| `backend/src/services/RaceDayService.ts` | Service for managing real-time race day events. |
| `frontend/src/pages/RaceDayPage.tsx` | The main page for the live race day dashboard. |
| `frontend/src/components/LiveLeaderboard.tsx` | A component for displaying the real-time leaderboard. |

---
