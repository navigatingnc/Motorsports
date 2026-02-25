import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { vehicleService } from '../services/vehicleService';
import { analyticsService } from '../services/analyticsService';
import type { Vehicle } from '../types/vehicle';
import type { LapTime } from '../types/laptime';

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatDateTime = (dateStr: string): string =>
  new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const msToLapTime = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const millis = ms % 1000;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
};

// ── Component ─────────────────────────────────────────────────────────────────

const VehicleDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [lapTimes, setLapTimes] = useState<LapTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [lapTimesLoading, setLapTimesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchVehicle = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await vehicleService.getVehicleById(id);
      setVehicle(data);
    } catch {
      setError('Failed to load vehicle. It may have been deleted.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchLapTimes = useCallback(async () => {
    if (!id) return;
    try {
      setLapTimesLoading(true);
      const data = await analyticsService.getLapTimes({ vehicleId: id });
      // Sort by event date desc, then lap number asc
      data.sort((a, b) => {
        const dateDiff = new Date(b.event.startDate).getTime() - new Date(a.event.startDate).getTime();
        if (dateDiff !== 0) return dateDiff;
        return a.lapNumber - b.lapNumber;
      });
      setLapTimes(data);
    } catch {
      // Non-critical — silently fail
      setLapTimes([]);
    } finally {
      setLapTimesLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchVehicle();
    void fetchLapTimes();
  }, [fetchVehicle, fetchLapTimes]);

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!vehicle) return;
    if (
      !window.confirm(
        `Are you sure you want to delete "${vehicle.year} ${vehicle.make} ${vehicle.model}"? This action cannot be undone.`
      )
    ) {
      return;
    }
    try {
      await vehicleService.deleteVehicle(vehicle.id);
      navigate('/vehicles');
    } catch {
      setError('Failed to delete vehicle. Please try again.');
    }
  };

  // ── Best lap for this vehicle ──────────────────────────────────────────────

  const bestLap = lapTimes.length > 0
    ? lapTimes.reduce((best, lt) => (lt.lapTimeMs < best.lapTimeMs ? lt : best), lapTimes[0]!)
    : null;

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading vehicle…</div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="container">
        <div className="error">{error ?? 'Vehicle not found.'}</div>
        <Link to="/vehicles" className="btn-secondary" style={{ marginTop: '1rem', display: 'inline-block' }}>
          ← Back to Vehicles
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="detail-page-header">
        <div className="detail-page-header-left">
          <Link to="/vehicles" className="detail-back-link">
            ← Vehicles
          </Link>
          <h1 className="detail-page-title">
            {vehicle.year} {vehicle.make} {vehicle.model}
            {vehicle.number && (
              <span className="vehicle-number-badge">#{vehicle.number}</span>
            )}
          </h1>
          <span className="vehicle-category-tag">{vehicle.category}</span>
        </div>
        <div className="detail-page-header-actions">
          <Link to={`/vehicles/${vehicle.id}/edit`} className="btn-secondary">
            Edit Vehicle
          </Link>
          <button onClick={handleDelete} className="btn-danger">
            Delete
          </button>
        </div>
      </div>

      {/* ── Detail Cards ─────────────────────────────────────────────── */}
      <div className="detail-grid">
        {/* Core Specs */}
        <div className="detail-card">
          <h2 className="detail-card-title">Vehicle Specifications</h2>
          <div className="detail-field-list">
            <div className="detail-field">
              <span className="detail-field-label">Make</span>
              <span className="detail-field-value">{vehicle.make}</span>
            </div>
            <div className="detail-field">
              <span className="detail-field-label">Model</span>
              <span className="detail-field-value">{vehicle.model}</span>
            </div>
            <div className="detail-field">
              <span className="detail-field-label">Year</span>
              <span className="detail-field-value">{vehicle.year}</span>
            </div>
            <div className="detail-field">
              <span className="detail-field-label">Category</span>
              <span className="detail-field-value">{vehicle.category}</span>
            </div>
            {vehicle.number && (
              <div className="detail-field">
                <span className="detail-field-label">Racing Number</span>
                <span className="detail-field-value">#{vehicle.number}</span>
              </div>
            )}
            {vehicle.vin && (
              <div className="detail-field">
                <span className="detail-field-label">VIN</span>
                <span className="detail-field-value detail-field-value--mono">{vehicle.vin}</span>
              </div>
            )}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="detail-card">
          <h2 className="detail-card-title">Performance Summary</h2>
          <div className="detail-field-list">
            <div className="detail-field">
              <span className="detail-field-label">Total Laps Recorded</span>
              <span className="detail-field-value">{lapTimesLoading ? '…' : lapTimes.length}</span>
            </div>
            {bestLap && (
              <>
                <div className="detail-field">
                  <span className="detail-field-label">Best Lap Time</span>
                  <span className="detail-field-value vehicle-best-lap">
                    {msToLapTime(bestLap.lapTimeMs)}
                  </span>
                </div>
                <div className="detail-field">
                  <span className="detail-field-label">Best Lap Set By</span>
                  <span className="detail-field-value">
                    {bestLap.driver.user.firstName} {bestLap.driver.user.lastName}
                  </span>
                </div>
                <div className="detail-field">
                  <span className="detail-field-label">Best Lap Event</span>
                  <span className="detail-field-value">{bestLap.event.name}</span>
                </div>
              </>
            )}
            {!lapTimesLoading && lapTimes.length === 0 && (
              <p className="detail-empty-text">No lap times recorded for this vehicle yet.</p>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="detail-card">
          <h2 className="detail-card-title">Notes</h2>
          <div className="detail-field-list">
            {vehicle.notes ? (
              <div className="detail-field detail-field--full">
                <p className="detail-field-text">{vehicle.notes}</p>
              </div>
            ) : (
              <p className="detail-empty-text">No notes recorded for this vehicle.</p>
            )}
          </div>
        </div>

        {/* Record Metadata */}
        <div className="detail-card detail-card--meta">
          <h2 className="detail-card-title">Record Information</h2>
          <div className="detail-field-list">
            <div className="detail-field">
              <span className="detail-field-label">Vehicle ID</span>
              <span className="detail-field-value detail-field-value--mono">{vehicle.id}</span>
            </div>
            <div className="detail-field">
              <span className="detail-field-label">Created</span>
              <span className="detail-field-value">{formatDateTime(vehicle.createdAt)}</span>
            </div>
            <div className="detail-field">
              <span className="detail-field-label">Last Updated</span>
              <span className="detail-field-value">{formatDateTime(vehicle.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Lap Time History ──────────────────────────────────────────── */}
      <section className="vehicle-laptimes-section">
        <div className="vehicle-laptimes-header">
          <h2 className="vehicle-laptimes-title">
            Lap Time History
            {!lapTimesLoading && (
              <span className="vehicle-laptimes-count">{lapTimes.length}</span>
            )}
          </h2>
          <Link to="/analytics" className="btn-secondary">
            View Analytics Dashboard
          </Link>
        </div>

        {lapTimesLoading ? (
          <div className="loading">Loading lap times…</div>
        ) : lapTimes.length === 0 ? (
          <div className="vehicle-laptimes-empty">
            <p>No lap times have been recorded for this vehicle yet.</p>
            <p className="detail-empty-text">
              Use the Analytics Dashboard to record lap times.
            </p>
          </div>
        ) : (
          <div className="vehicle-laptimes-table-wrapper">
            <table className="vehicle-laptimes-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Session</th>
                  <th>Lap #</th>
                  <th>Driver</th>
                  <th>Lap Time</th>
                  <th>Sector 1</th>
                  <th>Sector 2</th>
                  <th>Sector 3</th>
                  <th>Valid</th>
                </tr>
              </thead>
              <tbody>
                {lapTimes.map((lt) => (
                  <tr key={lt.id} className={lt.id === bestLap?.id ? 'laptime-row--best' : ''}>
                    <td>
                      <Link to={`/events/${lt.event.id}`} className="laptime-event-link">
                        {lt.event.name}
                      </Link>
                    </td>
                    <td>{lt.sessionType}</td>
                    <td className="laptime-number">{lt.lapNumber}</td>
                    <td>{lt.driver.user.firstName} {lt.driver.user.lastName}</td>
                    <td className="laptime-time">
                      {msToLapTime(lt.lapTimeMs)}
                      {lt.id === bestLap?.id && (
                        <span className="laptime-best-badge" title="Best lap for this vehicle">★</span>
                      )}
                    </td>
                    <td className="laptime-sector">
                      {lt.sector1Ms != null ? msToLapTime(lt.sector1Ms) : '—'}
                    </td>
                    <td className="laptime-sector">
                      {lt.sector2Ms != null ? msToLapTime(lt.sector2Ms) : '—'}
                    </td>
                    <td className="laptime-sector">
                      {lt.sector3Ms != null ? msToLapTime(lt.sector3Ms) : '—'}
                    </td>
                    <td>
                      <span className={`laptime-valid-badge ${lt.isValid ? 'laptime-valid-badge--valid' : 'laptime-valid-badge--invalid'}`}>
                        {lt.isValid ? 'Yes' : 'No'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default VehicleDetailPage;
