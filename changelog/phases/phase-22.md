# Phase 22: Backend + Frontend: Real-Time Notifications (WebSockets)

**Date:** March 6, 2026  
**Status:** ✅ Completed

---

### Summary

Integrated Socket.IO into the Express backend with JWT-authenticated WebSocket connections. Defined a `Notification` Prisma model, built a full notification service that persists notifications to the database and emits real-time events to connected clients on key actions (new setup sheet created, low-stock part alert, event reminders). Added a notification bell component to the frontend navbar with a live unread count badge, a dismissible dropdown panel, and full dark-mode support.

### Work Performed

1. **Prisma Schema — `Notification` Model**
   - Added `Notification` model to `schema.prisma` with fields: `id`, `recipientId`, `message`, `type`, `isRead`, `createdAt`.
   - Added `notifications Notification[]` relation to the `User` model.
   - Added composite index on `(recipientId, isRead)` for efficient unread queries.

2. **Backend — Socket.IO Server (`notification.service.ts`)**
   - Installed `socket.io` package.
   - Created `backend/src/services/notification.service.ts` with `initSocketIO(httpServer)` function.
   - JWT middleware on every Socket.IO connection: verifies the token from `socket.handshake.auth.token`.
   - Per-user socket room (`user:<userId>`) for targeted delivery.
   - In-memory `userSockets` map for tracking active sessions.
   - Client event handlers: `notifications:markRead`, `notifications:markAllRead`.
   - Exported helpers: `sendNotification`, `broadcastNotification`, `notifyLowStock`, `notifyNewSetupSheet`, `notifyEventReminder`.

3. **Backend — Notification Types (`notification.types.ts`)**
   - `NotificationType` union: `'setup_sheet' | 'event_reminder' | 'low_stock' | 'system'`.
   - `CreateNotificationDto` and `NotificationPayload` interfaces.

4. **Backend — Notification Controller (`notification.controller.ts`)**
   - `GET /api/notifications` — fetch user's notifications with optional `?unreadOnly=true`.
   - `PATCH /api/notifications/read-all` — mark all as read.
   - `PATCH /api/notifications/:id/read` — mark single notification as read.
   - `DELETE /api/notifications/:id` — delete a notification (recipient or admin).
   - `POST /api/notifications/broadcast` — admin-only endpoint to send a targeted notification.

5. **Backend — Notification Routes (`notification.routes.ts`)**
   - All routes protected by `authenticate` middleware.
   - Broadcast endpoint additionally protected by `requireRole('admin')`.

6. **Backend — `index.ts` Updated**
   - Imported Node.js `http` module to create an explicit `http.Server`.
   - Called `initSocketIO(httpServer)` before listening.
   - Registered `/api/notifications` route.
   - Updated `/api` info endpoint to list the new notifications endpoint.

7. **Backend — Setup Controller Hook**
   - Added `notifyNewSetupSheet` fire-and-forget call in `createSetupSheet` after successful creation.

8. **Backend — Part Controller Hook**
   - Added `notifyLowStock` fire-and-forget call in `adjustPartQuantity` when quantity falls at or below `lowStockThreshold`.

9. **Frontend — Notification Types (`types/notification.ts`)**
   - `Notification`, `NotificationsResponse`, `NotificationType` interfaces.

10. **Frontend — Notification Service (`services/notificationService.ts`)**
    - REST helpers: `getMyNotifications`, `markRead`, `markAllRead`, `deleteNotification`.

11. **Frontend — Notification Context (`context/NotificationContext.tsx`)**
    - Installed `socket.io-client` package.
    - `NotificationProvider` manages Socket.IO connection lifecycle (connect on auth, disconnect on logout).
    - JWT token passed via `socket.handshake.auth.token`.
    - Listens for `notifications:new`, `notifications:marked`, `notifications:allMarked` events.
    - Exposes: `notifications`, `unreadCount`, `isConnected`, `markRead`, `markAllRead`, `dismiss`, `refresh`.

12. **Frontend — Notification Bell Component (`components/NotificationBell.tsx`)**
    - Bell icon button with animated unread count badge (red pill).
    - Green dot indicator for live Socket.IO connection status.
    - Dismissible dropdown panel (max 50 notifications, newest first).
    - Per-type emoji icons: 📋 setup_sheet, 🏁 event_reminder, ⚠️ low_stock, 🔔 system.
    - Relative timestamp display ("just now", "5m ago", "2h ago", "3d ago").
    - "Mark all read" button in dropdown header.
    - Click-outside-to-close behaviour via `mousedown` listener.
    - Keyboard accessible (Enter key support).

13. **Frontend — CSS (`notifications.css`)**
    - Full styling for bell button, badge, connection dot, dropdown panel, and notification items.
    - Dark mode overrides via `[data-theme="dark"]` selectors.
    - Responsive adjustments for mobile (≤480px).

14. **Frontend — `App.tsx` Updated**
    - Wrapped app in `<NotificationProvider>` (inside `<AuthProvider>`).
    - Added `<NotificationBell />` to the authenticated navbar between user info and theme toggle.
    - Imported `notifications.css`.

### Generated Code

| File | Type | Description |
| :--- | :--- | :--- |
| `backend/prisma/schema.prisma` | Modified | Added `Notification` model and `User.notifications` relation |
| `backend/src/types/notification.types.ts` | New | Backend notification type definitions |
| `backend/src/services/notification.service.ts` | New | Socket.IO server init + notification helpers |
| `backend/src/controllers/notification.controller.ts` | New | REST CRUD for notifications |
| `backend/src/routes/notification.routes.ts` | New | Express router for `/api/notifications` |
| `backend/src/index.ts` | Modified | HTTP server + Socket.IO init + new route |
| `backend/src/controllers/setup.controller.ts` | Modified | Fire-and-forget setup sheet notification |
| `backend/src/controllers/part.controller.ts` | Modified | Fire-and-forget low-stock notification |
| `frontend/src/types/notification.ts` | New | Frontend notification type definitions |
| `frontend/src/services/notificationService.ts` | New | REST service for notifications |
| `frontend/src/context/NotificationContext.tsx` | New | Socket.IO context + state management |
| `frontend/src/components/NotificationBell.tsx` | New | Navbar bell with badge and dropdown |
| `frontend/src/notifications.css` | New | Full notification UI styles with dark mode |
| `frontend/src/App.tsx` | Modified | NotificationProvider + NotificationBell wired in |

---

### Next Phase Preview
Phase 23 will initialize a `mobile/` directory using **Expo** with TypeScript and React Navigation, configure environment variables for the backend API URL, implement Login and Register screens using the existing `/api/auth` endpoints, and implement secure JWT storage with Expo SecureStore and an Axios interceptor for authenticated requests.

---
