import { useState, useEffect, useCallback } from 'react';
import { fetchApiStatus, fetchMetricsJson } from '../services/statusService';
import type { ApiStatus, MetricsSnapshot } from '../services/statusService';
import { useAuth } from '../context/AuthContext';
import '../status.css';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const isOk = status === 'ok';
  return (
    <span className={`status-badge ${isOk ? 'status-badge--ok' : 'status-badge--error'}`}>
      {isOk ? '● Operational' : '● Degraded'}
    </span>
  );
}

// ─── Metric Card ─────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  highlight?: boolean;
}

function MetricCard({ label, value, sub, highlight }: MetricCardProps) {
  return (
    <div className={`status-metric-card ${highlight ? 'status-metric-card--highlight' : ''}`}>
      <div className="status-metric-value">{value}</div>
      <div className="status-metric-label">{label}</div>
      {sub && <div className="status-metric-sub">{sub}</div>}
    </div>
  );
}

// ─── Latency Table ───────────────────────────────────────────────────────────

interface LatencyTableProps {
  latencies: Record<string, number>;
}

function LatencyTable({ latencies }: LatencyTableProps) {
  const entries = Object.entries(latencies).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    return <p className="status-empty">No request data collected yet.</p>;
  }

  return (
    <table className="status-table">
      <thead>
        <tr>
          <th>Route</th>
          <th>Avg Latency</th>
          <th>Performance</th>
        </tr>
      </thead>
      <tbody>
        {entries.map(([route, ms]) => {
          const level = ms < 100 ? 'good' : ms < 500 ? 'warn' : 'bad';
          return (
            <tr key={route}>
              <td className="status-table-route">{route}</td>
              <td>{ms.toFixed(1)} ms</td>
              <td>
                <span className={`status-latency-badge status-latency-badge--${level}`}>
                  {level === 'good' ? 'Fast' : level === 'warn' ? 'Moderate' : 'Slow'}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StatusPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
  const [metrics, setMetrics] = useState<MetricsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const status = await fetchApiStatus();
      setApiStatus(status);

      if (isAdmin) {
        const snap = await fetchMetricsJson();
        setMetrics(snap);
      }

      setLastRefreshed(new Date());
    } catch (err) {
      setError('Failed to load status data. The API may be unreachable.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  // Initial load
  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      void loadData();
    }, 30_000);
    return () => clearInterval(interval);
  }, [loadData]);

  return (
    <div className="container status-page">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="status-header">
        <div>
          <h1 className="status-title">System Status</h1>
          <p className="status-subtitle">
            Live API health, performance metrics, and uptime information.
          </p>
        </div>
        <div className="status-header-actions">
          {lastRefreshed && (
            <span className="status-last-refreshed">
              Last refreshed: {lastRefreshed.toLocaleTimeString()}
            </span>
          )}
          <button
            className="btn btn-secondary"
            onClick={() => void loadData()}
            disabled={loading}
          >
            {loading ? 'Refreshing…' : '↻ Refresh'}
          </button>
        </div>
      </div>

      {/* ── Error ──────────────────────────────────────────────────────── */}
      {error && (
        <div className="status-error-banner">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* ── Loading skeleton ───────────────────────────────────────────── */}
      {loading && !apiStatus && (
        <div className="status-skeleton-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="status-skeleton-card" />
          ))}
        </div>
      )}

      {/* ── API Status ─────────────────────────────────────────────────── */}
      {apiStatus && (
        <>
          <section className="status-section">
            <div className="status-section-header">
              <h2 className="status-section-title">API Health</h2>
              <StatusBadge status={apiStatus.status} />
            </div>
            <div className="status-metrics-grid">
              <MetricCard
                label="Version"
                value={apiStatus.version}
                sub={`Environment: ${apiStatus.environment}`}
              />
              <MetricCard
                label="Uptime"
                value={apiStatus.uptimeFormatted}
                sub={`${apiStatus.uptimeSeconds.toFixed(0)}s total`}
              />
              <MetricCard
                label="Heap Memory"
                value={`${apiStatus.heapUsedMb} MB`}
                sub="Node.js heap used"
              />
              <MetricCard
                label="Total Requests"
                value={apiStatus.totalRequests.toLocaleString()}
                sub={`Error rate: ${apiStatus.errorRate}`}
                highlight={parseFloat(apiStatus.errorRate) > 5}
              />
            </div>
          </section>

          {/* ── Admin-only metrics ─────────────────────────────────────── */}
          {isAdmin && metrics && (
            <section className="status-section">
              <h2 className="status-section-title">Route Latency Breakdown</h2>
              <p className="status-section-desc">
                Average response time per route since the last server restart.
                Admin-only view.
              </p>
              <LatencyTable latencies={metrics.avgLatenciesMs} />
            </section>
          )}

          {/* ── Prometheus scrape info ─────────────────────────────────── */}
          {isAdmin && (
            <section className="status-section status-section--info">
              <h2 className="status-section-title">Prometheus Metrics</h2>
              <p className="status-section-desc">
                Raw Prometheus-compatible metrics are available at{' '}
                <code className="status-code">/api/metrics</code> (admin
                authentication required). Point your Prometheus scraper or
                Grafana Agent at this endpoint to ingest time-series data.
              </p>
              <a
                href="/api/metrics"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                View Raw Metrics ↗
              </a>
            </section>
          )}

          {/* ── Sentry info ────────────────────────────────────────────── */}
          <section className="status-section status-section--info">
            <h2 className="status-section-title">Error Tracking</h2>
            <p className="status-section-desc">
              Both the backend and frontend are instrumented with Sentry for
              real-time error tracking and performance monitoring. Configure{' '}
              <code className="status-code">SENTRY_DSN</code> (backend) and{' '}
              <code className="status-code">VITE_SENTRY_DSN</code> (frontend)
              in your environment variables to activate error reporting.
            </p>
          </section>

          {/* ── Timestamp ─────────────────────────────────────────────── */}
          <p className="status-timestamp">
            API timestamp: {new Date(apiStatus.timestamp).toLocaleString()}
          </p>
        </>
      )}
    </div>
  );
}
