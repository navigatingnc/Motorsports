import { useEffect, useState, useCallback } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { analyticsService } from '../services/analyticsService';
import { eventService } from '../services/eventService';
import type { AnalyticsSummary } from '../types/laptime';
import type { Event } from '../types/event';
import '../analytics.css';
import { SkeletonStatsGrid } from '../components/Skeleton';

// Colour palette for multi-driver line chart
const CHART_COLORS = [
  '#e10600',
  '#1a73e8',
  '#34a853',
  '#fbbc04',
  '#ea4335',
  '#9c27b0',
  '#00bcd4',
  '#ff9800',
];

// Custom tooltip for the line chart showing formatted lap time
const LapTimeTrendTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: number;
}) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">Lap {label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="chart-tooltip-entry">
          {entry.name}: {msToDisplay(entry.value)}
        </p>
      ))}
    </div>
  );
};

// Custom tooltip for the bar chart
const BestLapTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label}</p>
      <p className="chart-tooltip-entry">Best Lap: {msToDisplay(payload[0]?.value ?? 0)}</p>
    </div>
  );
};

const msToDisplay = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const millis = ms % 1000;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
};

const AnalyticsDashboardPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch events for the filter dropdown
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await eventService.getAllEvents();
        // eventService returns the full axios response shape; handle both
        const list = Array.isArray(data) ? data : (data as { data?: Event[] }).data ?? [];
        setEvents(list);
      } catch (err) {
        console.error('Error fetching events:', err);
      }
    };
    void fetchEvents();
  }, []);

  const fetchSummary = useCallback(async (eventId?: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getSummary(eventId || undefined);
      setSummary(data);
    } catch (err) {
      console.error('Error fetching analytics summary:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load summary on mount and when event filter changes
  useEffect(() => {
    void fetchSummary(selectedEventId || undefined);
  }, [selectedEventId, fetchSummary]);

  // Build data for the lap time trend line chart
  const buildTrendData = () => {
    if (!summary || summary.lapTrendsByDriver.length === 0) return { data: [], drivers: [] };

    const drivers = summary.lapTrendsByDriver.map((d) => d.driverName);
    // Collect all unique lap numbers across all drivers
    const lapNumbers = Array.from(
      new Set(summary.lapTrendsByDriver.flatMap((d) => d.laps.map((l) => l.lapNumber)))
    ).sort((a, b) => a - b);

    const data = lapNumbers.map((lapNum) => {
      const point: Record<string, number | string> = { lapNumber: lapNum };
      for (const driver of summary.lapTrendsByDriver) {
        const lap = driver.laps.find((l) => l.lapNumber === lapNum);
        if (lap) {
          point[driver.driverName] = lap.lapTimeMs;
        }
      }
      return point;
    });

    return { data, drivers };
  };

  // Build data for the best-lap-by-driver bar chart
  const buildDriverBarData = () => {
    if (!summary) return [];
    return summary.bestLapsByDriver.map((d) => ({
      name: d.driverName,
      lapTimeMs: d.lapTimeMs,
      lapTimeFormatted: d.lapTimeFormatted,
    }));
  };

  // Build data for the best-lap-by-vehicle bar chart
  const buildVehicleBarData = () => {
    if (!summary) return [];
    return summary.bestLapsByVehicle.map((v) => ({
      name: v.vehicleName,
      lapTimeMs: v.lapTimeMs,
      lapTimeFormatted: v.lapTimeFormatted,
    }));
  };

  const { data: trendData, drivers: trendDrivers } = buildTrendData();
  const driverBarData = buildDriverBarData();
  const vehicleBarData = buildVehicleBarData();

  const hasData = summary && summary.totalLaps > 0;

  return (
    <div className="container">
      {/* Page Header */}
      <div className="analytics-header">
        <div>
          <h1 className="analytics-title">Performance Analytics</h1>
          <p className="analytics-subtitle">
            Lap time trends, driver comparisons, and vehicle performance insights
          </p>
        </div>
        <div className="analytics-filter">
          <label htmlFor="event-filter" className="analytics-filter-label">
            Filter by Event
          </label>
          <select
            id="event-filter"
            className="analytics-select"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            <option value="">All Events</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name} — {ev.venue}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading / Error States */}
      {loading && <SkeletonStatsGrid count={4} />}
      {error && <div className="error">{error}</div>}

      {!loading && !error && (
        <>
          {/* Summary Stats */}
          <div className="analytics-stats-grid">
            <div className="analytics-stat-card">
              <span className="analytics-stat-value">{summary?.totalLaps ?? 0}</span>
              <span className="analytics-stat-label">Total Laps Recorded</span>
            </div>
            <div className="analytics-stat-card">
              <span className="analytics-stat-value">
                {summary?.bestLapsByDriver.length ?? 0}
              </span>
              <span className="analytics-stat-label">Drivers Tracked</span>
            </div>
            <div className="analytics-stat-card">
              <span className="analytics-stat-value">
                {summary?.bestLapsByVehicle.length ?? 0}
              </span>
              <span className="analytics-stat-label">Vehicles Tracked</span>
            </div>
            <div className="analytics-stat-card">
              <span className="analytics-stat-value">
                {summary && summary.bestLapsByDriver.length > 0
                  ? summary.bestLapsByDriver.reduce((best, d) =>
                      d.lapTimeMs < best.lapTimeMs ? d : best
                    ).lapTimeFormatted
                  : '—'}
              </span>
              <span className="analytics-stat-label">Overall Best Lap</span>
            </div>
          </div>

          {!hasData ? (
            <div className="analytics-empty">
              <div className="analytics-empty-icon">📊</div>
              <h2>No Lap Data Available</h2>
              <p>
                No lap times have been recorded yet
                {selectedEventId ? ' for this event' : ''}. Lap times can be recorded via the{' '}
                <code>POST /api/analytics/laptimes</code> endpoint.
              </p>
            </div>
          ) : (
            <>
              {/* Lap Time Trend — Line Chart */}
              {trendData.length > 0 && (
                <section className="analytics-chart-section">
                  <h2 className="analytics-chart-title">Lap Time Trends by Driver</h2>
                  <p className="analytics-chart-desc">
                    Lap-by-lap performance showing consistency and improvement over a session.
                  </p>
                  <div className="analytics-chart-container">
                    <ResponsiveContainer width="100%" height={360}>
                      <LineChart
                        data={trendData}
                        margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis
                          dataKey="lapNumber"
                          label={{ value: 'Lap Number', position: 'insideBottom', offset: -5 }}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis
                          tickFormatter={(v: number) => msToDisplay(v)}
                          tick={{ fontSize: 11 }}
                          width={80}
                          label={{
                            value: 'Lap Time',
                            angle: -90,
                            position: 'insideLeft',
                            offset: 10,
                          }}
                        />
                        <Tooltip content={<LapTimeTrendTooltip />} />
                        <Legend verticalAlign="top" />
                        {trendDrivers.map((driver, idx) => (
                          <Line
                            key={driver}
                            type="monotone"
                            dataKey={driver}
                            stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                            connectNulls
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              )}

              {/* Driver Comparison — Bar Chart */}
              {driverBarData.length > 0 && (
                <section className="analytics-chart-section">
                  <h2 className="analytics-chart-title">Driver Best Lap Comparison</h2>
                  <p className="analytics-chart-desc">
                    Best recorded lap time per driver. Lower is faster.
                  </p>
                  <div className="analytics-chart-container">
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart
                        data={driverBarData}
                        margin={{ top: 10, right: 30, left: 20, bottom: 40 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 12 }}
                          angle={-20}
                          textAnchor="end"
                        />
                        <YAxis
                          tickFormatter={(v: number) => msToDisplay(v)}
                          tick={{ fontSize: 11 }}
                          width={80}
                        />
                        <Tooltip content={<BestLapTooltip />} />
                        <Legend verticalAlign="top" />
                        <Bar dataKey="lapTimeMs" name="Best Lap Time" fill="#e10600" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              )}

              {/* Vehicle Performance — Bar Chart */}
              {vehicleBarData.length > 0 && (
                <section className="analytics-chart-section">
                  <h2 className="analytics-chart-title">Vehicle Performance Comparison</h2>
                  <p className="analytics-chart-desc">
                    Best recorded lap time per vehicle. Lower is faster.
                  </p>
                  <div className="analytics-chart-container">
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart
                        data={vehicleBarData}
                        margin={{ top: 10, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11 }}
                          angle={-25}
                          textAnchor="end"
                        />
                        <YAxis
                          tickFormatter={(v: number) => msToDisplay(v)}
                          tick={{ fontSize: 11 }}
                          width={80}
                        />
                        <Tooltip content={<BestLapTooltip />} />
                        <Legend verticalAlign="top" />
                        <Bar dataKey="lapTimeMs" name="Best Lap Time" fill="#1a73e8" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              )}

              {/* Best Laps Table */}
              {summary.bestLapsByDriver.length > 0 && (
                <section className="analytics-chart-section">
                  <h2 className="analytics-chart-title">Best Laps — Driver Leaderboard</h2>
                  <div className="analytics-table-wrapper">
                    <table className="analytics-table">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Driver</th>
                          <th>Best Lap</th>
                          <th>Vehicle</th>
                          <th>Event</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...summary.bestLapsByDriver]
                          .sort((a, b) => a.lapTimeMs - b.lapTimeMs)
                          .map((row, idx) => (
                            <tr key={row.driverName} className={idx === 0 ? 'analytics-table-row--first' : ''}>
                              <td className="analytics-table-rank">
                                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                              </td>
                              <td>{row.driverName}</td>
                              <td className="analytics-table-time">{row.lapTimeFormatted}</td>
                              <td>{row.vehicleName}</td>
                              <td>{row.eventName}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboardPage;
