# Phase 21: DevOps: Monitoring & Observability

**Date:** March 5, 2026  
**Status:** ✅ Completed

---

### Summary
Integrated comprehensive monitoring and observability into the Motorsports Management application. The backend now uses **Pino** for structured JSON logging (replacing all `console.*` calls), exposes a **Prometheus-compatible `/api/metrics` endpoint** and a public **`/api/status`** health endpoint, and is instrumented with the **Sentry Node SDK** for error tracking and performance profiling. The frontend initialises the **Sentry React SDK** on boot and includes a new **`StatusPage.tsx`** that displays live API health, version, uptime, heap memory usage, request/error counts, and per-route average latency (admin-only detail view).

### Work Performed

1. **Pino Structured Logging (Backend)**
   - Created `backend/src/config/logger.ts` — a singleton Pino logger with ISO timestamps, `service` base field, and automatic redaction of `Authorization` headers, cookies, passwords, and tokens.
   - In development (`NODE_ENV !== 'production'`) output is routed through `pino-pretty` for human-readable coloured terminal output; in production it emits newline-delimited JSON suitable for log-aggregation pipelines (Loki, CloudWatch, Datadog).
   - Log level is configurable via the `LOG_LEVEL` environment variable (default: `info`).
   - Replaced every `console.error`, `console.log`, and `console.warn` call across all ten controllers and `prisma.ts` with typed `logger.error({ err })`, `logger.info()`, and `logger.warn({ err })` calls.
   - Mounted `pino-http` as the first Express middleware in `index.ts` to log every HTTP request/response pair with method, URL, status code, and remote address. Health-check and status endpoints are excluded from auto-logging to reduce noise.

2. **Prometheus-Compatible Metrics Endpoint (Backend)**
   - Created `backend/src/config/metrics.ts` — an in-process metrics store tracking:
     - `http_requests_total` (counter, labelled by method, route, status)
     - `http_request_duration_ms_avg` (gauge — average latency per route)
     - `http_errors_total` (counter for 4xx/5xx responses)
     - `process_uptime_seconds` (gauge)
     - `nodejs_heap_used_bytes` (gauge)
   - Implemented `metricsMiddleware` — a `res.on('finish')` hook that records every response into the in-process store with route normalisation to prevent high-cardinality label explosion.
   - Implemented `renderPrometheusMetrics()` that serialises the store to the Prometheus text exposition format (version 0.0.4).
   - Implemented `getMetricsSnapshot()` returning a JSON summary used by the frontend StatusPage.
   - Created `backend/src/controllers/metrics.controller.ts` with three handlers:
     - `getPrometheusMetrics` — `GET /api/metrics` (admin only, `text/plain`)
     - `getMetricsJson` — `GET /api/metrics/json` (admin only, JSON)
     - `getStatus` — `GET /api/status` (public, JSON health/version/uptime)
   - Created `backend/src/routes/metrics.routes.ts` and registered it under `/api` in `index.ts`.

3. **Sentry Backend Integration**
   - Created `backend/src/config/sentry.ts` — initialises `@sentry/node` with `nodeProfilingIntegration` when `SENTRY_DSN` is present; gracefully no-ops when the variable is absent.
   - Configured environment, release (from `APP_VERSION`), trace sample rate (100% dev / 20% prod), and profile sample rate (100% dev / 10% prod).
   - Exported `captureException()` helper for manual error capture with optional context.
   - `initSentry()` is called as the very first statement in `index.ts`, before any other imports that might throw.

4. **Sentry Frontend Integration**
   - Created `frontend/src/config/sentry.ts` — initialises `@sentry/react` with `browserTracingIntegration` and `replayIntegration` (masks all text and blocks all media to avoid PII capture) when `VITE_SENTRY_DSN` is present.
   - `initSentry()` is called in `main.tsx` before `createRoot().render()`.
   - Exported `captureException()` helper for manual error capture from React components.

5. **StatusPage Frontend Component**
   - Created `frontend/src/services/statusService.ts` with `fetchApiStatus()` (public) and `fetchMetricsJson()` (admin) service functions.
   - Created `frontend/src/pages/StatusPage.tsx` displaying:
     - API status badge (Operational / Degraded)
     - Metric cards: version, environment, uptime, heap memory, total requests, error rate
     - Per-route average latency table with colour-coded performance badges (Fast / Moderate / Slow) — admin only
     - Prometheus scrape info section with link to raw `/api/metrics` — admin only
     - Sentry configuration guidance section
     - Auto-refresh every 30 seconds with manual refresh button
     - Skeleton loading states and error banner
   - Created `frontend/src/status.css` with full dark-mode support and responsive grid layout.
   - Added `/status` route and **Status** nav link to `App.tsx` (visible to all authenticated users).

6. **Environment Configuration**
   - Documented `LOG_LEVEL`, `APP_VERSION`, `SENTRY_DSN`, and `VITE_SENTRY_DSN` in `.env.example`.

### Files Generated / Modified

| File | Description |
| :--- | :--- |
| `backend/src/config/logger.ts` | Pino singleton logger with pino-pretty dev transport |
| `backend/src/config/metrics.ts` | In-process Prometheus metrics store and middleware |
| `backend/src/config/sentry.ts` | Sentry Node SDK initialisation |
| `backend/src/controllers/metrics.controller.ts` | `/api/metrics`, `/api/metrics/json`, `/api/status` handlers |
| `backend/src/routes/metrics.routes.ts` | Metrics/status router |
| `backend/src/index.ts` | Updated: Sentry init, pino-http, metricsMiddleware, metrics routes |
| `backend/src/prisma.ts` | Updated: replaced console.warn with logger.warn |
| `backend/src/controllers/*.ts` (×10) | Updated: all console.* replaced with logger.* |
| `frontend/src/config/sentry.ts` | Sentry React SDK initialisation |
| `frontend/src/main.tsx` | Updated: calls initSentry() before render |
| `frontend/src/services/statusService.ts` | fetchApiStatus() and fetchMetricsJson() |
| `frontend/src/pages/StatusPage.tsx` | Live status dashboard page |
| `frontend/src/status.css` | StatusPage styles with dark mode |
| `frontend/src/App.tsx` | Updated: StatusPage import, route, and nav link |
| `.env.example` | Updated: LOG_LEVEL, APP_VERSION, SENTRY_DSN, VITE_SENTRY_DSN |

### Code Generated

#### `backend/src/config/logger.ts`
```typescript
import pino from 'pino';

const isDevelopment = process.env['NODE_ENV'] !== 'production';

const logger = pino(
  {
    level: process.env['LOG_LEVEL'] ?? 'info',
    base: { pid: process.pid, service: 'motorsports-api' },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
      paths: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.token'],
      censor: '[REDACTED]',
    },
    formatters: { level(label) { return { level: label }; } },
  },
  isDevelopment
    ? pino.transport({ target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' } })
    : undefined,
);

export default logger;
```

#### `backend/src/config/metrics.ts` (key excerpt)
```typescript
export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startMs = Date.now();
  res.on('finish', () => {
    const method = req.method;
    const route = normaliseRoute(req);
    const status = res.statusCode;
    const durationMs = Date.now() - startMs;
    // ... increments requestCounters, durationStore, errorCounters
  });
  next();
}

export function renderPrometheusMetrics(): string {
  // Returns Prometheus text exposition format v0.0.4
  // Metrics: http_requests_total, http_request_duration_ms_avg,
  //          http_errors_total, process_uptime_seconds, nodejs_heap_used_bytes
}
```

#### `backend/src/config/sentry.ts`
```typescript
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

export function initSentry(): void {
  const dsn = process.env['SENTRY_DSN'];
  if (!dsn) { logger.info('Sentry DSN not configured — error tracking disabled'); return; }
  Sentry.init({
    dsn, environment: process.env['NODE_ENV'] ?? 'development',
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: process.env['NODE_ENV'] === 'production' ? 0.2 : 1.0,
    profilesSampleRate: process.env['NODE_ENV'] === 'production' ? 0.1 : 1.0,
    sendDefaultPii: false,
  });
}
```

#### `frontend/src/config/sentry.ts`
```typescript
import * as Sentry from '@sentry/react';

export function initSentry(): void {
  const dsn = import.meta.env['VITE_SENTRY_DSN'] as string | undefined;
  if (!dsn) return;
  Sentry.init({
    dsn, environment: import.meta.env['MODE'] ?? 'development',
    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true })],
    tracesSampleRate: import.meta.env['MODE'] === 'production' ? 0.2 : 1.0,
    replaysSessionSampleRate: import.meta.env['MODE'] === 'production' ? 0.1 : 0,
    replaysOnErrorSampleRate: 1.0,
    sendDefaultPii: false,
  });
}
```

#### `frontend/src/services/statusService.ts`
```typescript
export async function fetchApiStatus(): Promise<ApiStatus> {
  const response = await api.get<{ success: boolean; data: ApiStatus }>('/status');
  return response.data.data;
}

export async function fetchMetricsJson(): Promise<MetricsSnapshot> {
  const response = await api.get<{ success: boolean; data: MetricsSnapshot }>('/metrics/json');
  return response.data.data;
}
```

### Next Phase Preview
Phase 22 will integrate **Socket.IO** into the backend Express server with JWT-authenticated connections, define a `Notification` Prisma model, build a notification service that emits real-time events on key actions (new setup sheet, event starting soon, low-stock part alert), and add a **notification bell component** to the frontend navbar with a live unread count badge and dismissible dropdown.

---
