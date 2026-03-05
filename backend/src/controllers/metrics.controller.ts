import { Request, Response } from 'express';
import { renderPrometheusMetrics, getMetricsSnapshot } from '../config/metrics';
import logger from '../config/logger';

/**
 * GET /api/metrics
 *
 * Returns Prometheus-compatible plain-text metrics.  Clients such as a
 * Prometheus scraper, Grafana Agent, or the frontend StatusPage can consume
 * this endpoint.
 *
 * Access is restricted to admin role (enforced at the router level).
 */
export const getPrometheusMetrics = (_req: Request, res: Response): void => {
  try {
    const body = renderPrometheusMetrics();
    res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.status(200).send(body);
  } catch (error) {
    logger.error({ err: error }, 'Failed to render Prometheus metrics');
    res.status(500).json({ success: false, error: 'Failed to render metrics' });
  }
};

/**
 * GET /api/metrics/json
 *
 * Returns a JSON snapshot of the same metrics — used by the frontend
 * StatusPage to display live stats without needing a Prometheus parser.
 *
 * Access is restricted to admin role (enforced at the router level).
 */
export const getMetricsJson = (_req: Request, res: Response): void => {
  try {
    const snapshot = getMetricsSnapshot();
    res.json({ success: true, data: snapshot });
  } catch (error) {
    logger.error({ err: error }, 'Failed to fetch metrics snapshot');
    res.status(500).json({ success: false, error: 'Failed to fetch metrics' });
  }
};

/**
 * GET /api/status
 *
 * Public endpoint returning API health, version, and uptime.
 * Used by the frontend StatusPage and external uptime monitors.
 */
export const getStatus = (_req: Request, res: Response): void => {
  const snapshot = getMetricsSnapshot();
  res.json({
    success: true,
    data: {
      status: 'ok',
      version: process.env['APP_VERSION'] ?? '1.0.0',
      environment: process.env['NODE_ENV'] ?? 'development',
      uptimeSeconds: snapshot.uptimeSeconds,
      uptimeFormatted: formatUptime(snapshot.uptimeSeconds),
      heapUsedMb: (snapshot.heapUsedBytes / 1024 / 1024).toFixed(2),
      totalRequests: snapshot.totalRequests,
      totalErrors: snapshot.totalErrors,
      errorRate: snapshot.errorRate,
      timestamp: new Date().toISOString(),
    },
  });
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}
