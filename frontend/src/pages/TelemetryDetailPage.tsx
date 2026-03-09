import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { telemetryService } from '../services/telemetryService';
import type { TelemetryTrace, TelemetrySample } from '../types/telemetry';
import { SkeletonCard } from '../components/Skeleton';
import '../telemetry.css';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const msToDisplay = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const millis = ms % 1000;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
};

const offsetToSeconds = (ms: number): string => (ms / 1000).toFixed(2);

// ---------------------------------------------------------------------------
// GPS Track Map (SVG renderer)
// ---------------------------------------------------------------------------

interface GpsPoint {
  lat: number;
  lng: number;
  speed: number | null;
}

const GpsTrackMap = ({
  points,
  cursorOffset,
}: {
  points: GpsPoint[];
  cursorOffset: number | null;
}) => {
  const validPoints = points.filter((p) => p.lat !== null && p.lng !== null);
  if (validPoints.length < 2) {
    return (
      <div className="telemetry-gps-empty">
        <p>No GPS data available for this lap.</p>
      </div>
    );
  }

  const W = 400;
  const H = 300;
  const PAD = 20;

  const lats = validPoints.map((p) => p.lat);
  const lngs = validPoints.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latRange = maxLat - minLat || 0.0001;
  const lngRange = maxLng - minLng || 0.0001;

  // Preserve aspect ratio
  const scaleX = (W - PAD * 2) / lngRange;
  const scaleY = (H - PAD * 2) / latRange;
  const scale = Math.min(scaleX, scaleY);

  const toX = (lng: number) => PAD + (lng - minLng) * scale;
  const toY = (lat: number) => H - PAD - (lat - minLat) * scale;

  // Colour segments by speed (green → yellow → red)
  const maxSpeed = Math.max(...validPoints.map((p) => p.speed ?? 0));

  const speedToColor = (speed: number | null): string => {
    if (speed === null || maxSpeed === 0) return '#888';
    const ratio = speed / maxSpeed;
    if (ratio > 0.66) return '#22c55e'; // green — high speed
    if (ratio > 0.33) return '#eab308'; // yellow — mid speed
    return '#ef4444';                   // red — low speed / braking
  };

  // Cursor position on the track
  let cursorX: number | null = null;
  let cursorY: number | null = null;
  if (cursorOffset !== null) {
    const closest = validPoints.reduce(
      (best, p, i) => {
        const diff = Math.abs(points.indexOf(p) - cursorOffset);
        return diff < best.diff ? { diff, idx: i } : best;
      },
      { diff: Infinity, idx: 0 },
    );
    const cp = validPoints[closest.idx];
    if (cp) {
      cursorX = toX(cp.lng);
      cursorY = toY(cp.lat);
    }
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="telemetry-gps-svg"
      aria-label="GPS track map"
    >
      {/* Speed-coloured segments */}
      {validPoints.slice(0, -1).map((p, i) => {
        const next = validPoints[i + 1]!;
        return (
          <line
            key={i}
            x1={toX(p.lng).toFixed(1)}
            y1={toY(p.lat).toFixed(1)}
            x2={toX(next.lng).toFixed(1)}
            y2={toY(next.lat).toFixed(1)}
            stroke={speedToColor(p.speed)}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        );
      })}

      {/* Start marker */}
      {validPoints[0] && (
        <circle
          cx={toX(validPoints[0].lng)}
          cy={toY(validPoints[0].lat)}
          r="5"
          fill="#22c55e"
          stroke="#fff"
          strokeWidth="1.5"
        />
      )}

      {/* Cursor marker */}
      {cursorX !== null && cursorY !== null && (
        <circle
          cx={cursorX}
          cy={cursorY}
          r="6"
          fill="#e10600"
          stroke="#fff"
          strokeWidth="2"
        />
      )}

      {/* Legend */}
      <g transform="translate(10,10)">
        <rect x="0" y="0" width="10" height="10" fill="#22c55e" rx="2" />
        <text x="14" y="9" fontSize="9" fill="var(--color-text-secondary)">High speed</text>
        <rect x="0" y="14" width="10" height="10" fill="#eab308" rx="2" />
        <text x="14" y="23" fontSize="9" fill="var(--color-text-secondary)">Mid speed</text>
        <rect x="0" y="28" width="10" height="10" fill="#ef4444" rx="2" />
        <text x="14" y="37" fontSize="9" fill="var(--color-text-secondary)">Braking</text>
      </g>
    </svg>
  );
};

// ---------------------------------------------------------------------------
// Custom tooltip for the multi-channel chart
// ---------------------------------------------------------------------------

const TelemetryTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number | null; color: string }[];
  label?: string;
}) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label}s</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="chart-tooltip-entry">
          {entry.name}: {entry.value !== null ? entry.value : '—'}
        </p>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Channel configuration
// ---------------------------------------------------------------------------

const CHANNELS = [
  { key: 'speed',    label: 'Speed (km/h)',   color: '#1a73e8', yDomain: [0, 300]  as [number, number] },
  { key: 'throttle', label: 'Throttle (%)',   color: '#34a853', yDomain: [0, 100]  as [number, number] },
  { key: 'brake',    label: 'Brake (%)',      color: '#e10600', yDomain: [0, 100]  as [number, number] },
  { key: 'rpm',      label: 'RPM',            color: '#fbbc04', yDomain: [0, 20000] as [number, number] },
  { key: 'gear',     label: 'Gear',           color: '#9c27b0', yDomain: [0, 8]    as [number, number] },
];

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

const TelemetryDetailPage = () => {
  const { lapTimeId } = useParams<{ lapTimeId: string }>();
  const navigate = useNavigate();

  const [trace, setTrace] = useState<TelemetryTrace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active channels shown in the chart
  const [activeChannels, setActiveChannels] = useState<Set<string>>(
    new Set(['speed', 'throttle', 'brake']),
  );

  // Cursor position (index into samples array) for GPS map sync
  const [cursorIndex, setCursorIndex] = useState<number | null>(null);

  // Downsampled chart data (max 500 points for performance)
  const [chartData, setChartData] = useState<Record<string, number | null>[]>([]);

  const fetchTrace = useCallback(async () => {
    if (!lapTimeId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await telemetryService.getByLap(lapTimeId);
      setTrace(data);

      // Downsample to at most 500 points for chart performance
      const samples = data.samples;
      const step = Math.max(1, Math.floor(samples.length / 500));
      const downsampled = samples
        .filter((_, i) => i % step === 0)
        .map((s) => ({
          offsetSec: parseFloat(offsetToSeconds(s.offsetMs)),
          speed:    s.speed,
          throttle: s.throttle,
          brake:    s.brake,
          rpm:      s.rpm,
          gear:     s.gear,
        }));
      setChartData(downsampled);
    } catch (err) {
      setError('Failed to load telemetry data. The lap may have no recorded telemetry.');
    } finally {
      setLoading(false);
    }
  }, [lapTimeId]);

  useEffect(() => {
    fetchTrace();
  }, [fetchTrace]);

  const toggleChannel = (key: string) => {
    setActiveChannels((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // GPS points derived from the full (non-downsampled) samples
  const gpsPoints: GpsPoint[] = trace
    ? trace.samples.map((s) => ({
        lat: s.gpsLat ?? 0,
        lng: s.gpsLng ?? 0,
        speed: s.speed,
      }))
    : [];

  const hasGps = trace
    ? trace.samples.some((s) => s.gpsLat !== null && s.gpsLng !== null)
    : false;

  if (loading) {
    return (
      <div className="container">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error || !trace) {
    return (
      <div className="container">
        <div className="telemetry-error">
          <h2>Telemetry Unavailable</h2>
          <p>{error ?? 'No telemetry data found for this lap.'}</p>
          <button className="btn btn--secondary" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>
      </div>
    );
  }

  const { lap } = trace;
  const driverName = `${lap.driver.user.firstName} ${lap.driver.user.lastName}`;
  const vehicleName = `${lap.vehicle.year} ${lap.vehicle.make} ${lap.vehicle.model}`;

  return (
    <div className="container telemetry-page">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="telemetry-header">
        <button className="btn btn--ghost telemetry-back" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="telemetry-title-block">
          <h1 className="telemetry-title">
            Telemetry — Lap {lap.lapNumber}
          </h1>
          <p className="telemetry-subtitle">
            {lap.event.name} &nbsp;·&nbsp; {lap.event.venue} &nbsp;·&nbsp;{' '}
            {lap.sessionType}
          </p>
        </div>
      </div>

      {/* ── Meta cards ─────────────────────────────────────────────────────── */}
      <div className="telemetry-meta-grid">
        <div className="telemetry-meta-card">
          <span className="telemetry-meta-label">Lap Time</span>
          <span className="telemetry-meta-value">{msToDisplay(lap.lapTimeMs)}</span>
        </div>
        <div className="telemetry-meta-card">
          <span className="telemetry-meta-label">Driver</span>
          <span className="telemetry-meta-value">{driverName}</span>
        </div>
        <div className="telemetry-meta-card">
          <span className="telemetry-meta-label">Vehicle</span>
          <span className="telemetry-meta-value">{vehicleName}</span>
        </div>
        <div className="telemetry-meta-card">
          <span className="telemetry-meta-label">Samples</span>
          <span className="telemetry-meta-value">{trace.sampleCount.toLocaleString()}</span>
        </div>
      </div>

      {/* ── Channel toggles ─────────────────────────────────────────────────── */}
      <div className="telemetry-channel-toggles">
        <span className="telemetry-toggle-label">Channels:</span>
        {CHANNELS.map((ch) => (
          <button
            key={ch.key}
            className={`telemetry-channel-btn${activeChannels.has(ch.key) ? ' active' : ''}`}
            style={
              activeChannels.has(ch.key)
                ? { borderColor: ch.color, color: ch.color, backgroundColor: `${ch.color}22` }
                : {}
            }
            onClick={() => toggleChannel(ch.key)}
          >
            {ch.label}
          </button>
        ))}
      </div>

      {/* ── Multi-channel chart ─────────────────────────────────────────────── */}
      <div className="telemetry-chart-card">
        <h2 className="telemetry-section-title">Multi-Channel Trace</h2>
        {chartData.length === 0 ? (
          <p className="telemetry-no-data">No channel data available.</p>
        ) : (
          <ResponsiveContainer width="100%" height={360}>
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 24, left: 0, bottom: 8 }}
              onMouseMove={(e) => {
                if (e.activeTooltipIndex !== undefined) {
                  setCursorIndex(typeof e.activeTooltipIndex === 'number' ? e.activeTooltipIndex : null);
                }
              }}
              onMouseLeave={() => setCursorIndex(null)}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="offsetSec"
                label={{ value: 'Time (s)', position: 'insideBottomRight', offset: -8, fontSize: 11 }}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${v}s`}
              />
              <YAxis tick={{ fontSize: 11 }} width={40} />
              <Tooltip content={<TelemetryTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {CHANNELS.filter((ch) => activeChannels.has(ch.key)).map((ch) => (
                <Line
                  key={ch.key}
                  type="monotone"
                  dataKey={ch.key}
                  name={ch.label}
                  stroke={ch.color}
                  dot={false}
                  strokeWidth={1.5}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── GPS track map ───────────────────────────────────────────────────── */}
      {hasGps && (
        <div className="telemetry-gps-card">
          <h2 className="telemetry-section-title">GPS Track Map</h2>
          <p className="telemetry-gps-hint">
            Segments are coloured by speed (green = fast, red = braking). Hover
            the chart above to highlight the corresponding position on the map.
          </p>
          <div className="telemetry-gps-container">
            <GpsTrackMap points={gpsPoints} cursorOffset={cursorIndex} />
          </div>
          <div className="telemetry-gps-legend">
            <span className="telemetry-gps-legend-dot" style={{ background: '#22c55e' }} />
            Start / Finish
          </div>
        </div>
      )}

      {/* ── Raw data table (first 50 samples) ──────────────────────────────── */}
      <div className="telemetry-table-card">
        <h2 className="telemetry-section-title">
          Raw Samples
          <span className="telemetry-table-count">
            (showing first 50 of {trace.sampleCount.toLocaleString()})
          </span>
        </h2>
        <div className="telemetry-table-wrapper">
          <table className="telemetry-table">
            <thead>
              <tr>
                <th>Offset (ms)</th>
                <th>Speed (km/h)</th>
                <th>RPM</th>
                <th>Throttle (%)</th>
                <th>Brake (%)</th>
                <th>Gear</th>
                <th>GPS Lat</th>
                <th>GPS Lng</th>
              </tr>
            </thead>
            <tbody>
              {trace.samples.slice(0, 50).map((s: TelemetrySample) => (
                <tr key={s.id}>
                  <td>{s.offsetMs.toLocaleString()}</td>
                  <td>{s.speed !== null ? s.speed.toFixed(1) : '—'}</td>
                  <td>{s.rpm !== null ? Math.round(s.rpm).toLocaleString() : '—'}</td>
                  <td>{s.throttle !== null ? s.throttle.toFixed(1) : '—'}</td>
                  <td>{s.brake !== null ? s.brake.toFixed(1) : '—'}</td>
                  <td>{s.gear !== null ? s.gear : '—'}</td>
                  <td>{s.gpsLat !== null ? s.gpsLat.toFixed(6) : '—'}</td>
                  <td>{s.gpsLng !== null ? s.gpsLng.toFixed(6) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TelemetryDetailPage;
