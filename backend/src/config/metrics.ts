/**
 * Lightweight in-process metrics store.
 *
 * Exposes Prometheus-compatible text format via the /api/metrics endpoint.
 * Tracks:
 *   - http_requests_total          (counter, labelled by method, route, status)
 *   - http_request_duration_ms     (histogram buckets, labelled by method, route)
 *   - http_errors_total            (counter, labelled by method, route, status)
 *   - process_uptime_seconds       (gauge)
 *   - nodejs_heap_used_bytes       (gauge)
 */

import { Request, Response, NextFunction } from 'express';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CounterEntry {
  method: string;
  route: string;
  status: number;
  count: number;
}

interface DurationEntry {
  method: string;
  route: string;
  totalMs: number;
  count: number;
}

// ─── In-process store ─────────────────────────────────────────────────────────

const requestCounters: Map<string, CounterEntry> = new Map();
const durationStore: Map<string, DurationEntry> = new Map();
const errorCounters: Map<string, CounterEntry> = new Map();

const startTime = Date.now();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function counterKey(method: string, route: string, status: number): string {
  return `${method}:${route}:${status}`;
}

function durationKey(method: string, route: string): string {
  return `${method}:${route}`;
}

/**
 * Normalise an Express route path so that dynamic segments (e.g. /vehicles/abc123)
 * are collapsed to their parameter placeholder (/vehicles/:id).  This prevents
 * high-cardinality label explosion in the metrics output.
 */
function normaliseRoute(req: Request): string {
  // Prefer the matched route pattern when available (Express 4/5 sets this)
  const matched =
    (req.route as { path?: string } | undefined)?.path ??
    req.path;
  return matched ?? req.path;
}

// ─── Express middleware ────────────────────────────────────────────────────────

export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startMs = Date.now();

  res.on('finish', () => {
    const method = req.method;
    const route = normaliseRoute(req);
    const status = res.statusCode;
    const durationMs = Date.now() - startMs;

    // --- request counter ---
    const cKey = counterKey(method, route, status);
    const existing = requestCounters.get(cKey);
    if (existing) {
      existing.count += 1;
    } else {
      requestCounters.set(cKey, { method, route, status, count: 1 });
    }

    // --- duration ---
    const dKey = durationKey(method, route);
    const existingDur = durationStore.get(dKey);
    if (existingDur) {
      existingDur.totalMs += durationMs;
      existingDur.count += 1;
    } else {
      durationStore.set(dKey, { method, route, totalMs: durationMs, count: 1 });
    }

    // --- error counter (4xx / 5xx) ---
    if (status >= 400) {
      const eKey = counterKey(method, route, status);
      const existingErr = errorCounters.get(eKey);
      if (existingErr) {
        existingErr.count += 1;
      } else {
        errorCounters.set(eKey, { method, route, status, count: 1 });
      }
    }
  });

  next();
}

// ─── Prometheus text format serialiser ────────────────────────────────────────

function escape(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

function labels(obj: Record<string, string | number>): string {
  return Object.entries(obj)
    .map(([k, v]) => `${k}="${escape(String(v))}"`)
    .join(',');
}

export function renderPrometheusMetrics(): string {
  const lines: string[] = [];

  // --- http_requests_total ---
  lines.push('# HELP http_requests_total Total number of HTTP requests');
  lines.push('# TYPE http_requests_total counter');
  for (const entry of requestCounters.values()) {
    lines.push(
      `http_requests_total{${labels({ method: entry.method, route: entry.route, status: entry.status })}} ${entry.count}`,
    );
  }

  // --- http_request_duration_ms (average) ---
  lines.push('# HELP http_request_duration_ms_avg Average HTTP request duration in milliseconds');
  lines.push('# TYPE http_request_duration_ms_avg gauge');
  for (const entry of durationStore.values()) {
    const avg = entry.count > 0 ? (entry.totalMs / entry.count).toFixed(2) : '0';
    lines.push(
      `http_request_duration_ms_avg{${labels({ method: entry.method, route: entry.route })}} ${avg}`,
    );
  }

  // --- http_errors_total ---
  lines.push('# HELP http_errors_total Total number of HTTP error responses (4xx/5xx)');
  lines.push('# TYPE http_errors_total counter');
  for (const entry of errorCounters.values()) {
    lines.push(
      `http_errors_total{${labels({ method: entry.method, route: entry.route, status: entry.status })}} ${entry.count}`,
    );
  }

  // --- process_uptime_seconds ---
  const uptimeSec = ((Date.now() - startTime) / 1000).toFixed(3);
  lines.push('# HELP process_uptime_seconds Time in seconds since the process started');
  lines.push('# TYPE process_uptime_seconds gauge');
  lines.push(`process_uptime_seconds ${uptimeSec}`);

  // --- nodejs_heap_used_bytes ---
  const heapUsed = process.memoryUsage().heapUsed;
  lines.push('# HELP nodejs_heap_used_bytes Node.js heap memory used in bytes');
  lines.push('# TYPE nodejs_heap_used_bytes gauge');
  lines.push(`nodejs_heap_used_bytes ${heapUsed}`);

  return lines.join('\n') + '\n';
}

// ─── JSON snapshot (used by StatusPage) ───────────────────────────────────────

export function getMetricsSnapshot() {
  const totalRequests = [...requestCounters.values()].reduce((s, e) => s + e.count, 0);
  const totalErrors = [...errorCounters.values()].reduce((s, e) => s + e.count, 0);
  const uptimeSec = (Date.now() - startTime) / 1000;

  const avgLatencies: Record<string, number> = {};
  for (const [key, entry] of durationStore.entries()) {
    avgLatencies[key] = entry.count > 0 ? entry.totalMs / entry.count : 0;
  }

  return {
    uptimeSeconds: uptimeSec,
    totalRequests,
    totalErrors,
    errorRate: totalRequests > 0 ? ((totalErrors / totalRequests) * 100).toFixed(2) + '%' : '0%',
    heapUsedBytes: process.memoryUsage().heapUsed,
    avgLatenciesMs: avgLatencies,
  };
}
