import { useEffect, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { vehicleService } from '../services/vehicleService';
import type { Vehicle } from '../types/vehicle';
import { SkeletonCardGrid } from '../components/Skeleton';

// ── Toast helper ───────────────────────────────────────────────────────────────────────────────
type ToastType = 'success' | 'error';
interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

const VehicleListPage = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Per-card delete loading state: tracks which vehicle id is being deleted
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);

  const location = useLocation();

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Show toast for vehicles deleted from the detail page
  useEffect(() => {
    const state = location.state as { deletedVehicle?: string } | null;
    if (state?.deletedVehicle) {
      showToast(`"${state.deletedVehicle}" was deleted successfully.`, 'success');
      // Clear state so the toast doesn't re-appear on refresh
      window.history.replaceState({}, '');
    }
  }, [location.state, showToast]);

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await vehicleService.getAllVehicles();
      setVehicles(data);
    } catch (err) {
      setError('Failed to fetch vehicles. Please try again later.');
      console.error('Error fetching vehicles:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchVehicles();
  }, [fetchVehicles]);

  const handleDelete = async (vehicle: Vehicle) => {
    const label = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
    if (!window.confirm(`Delete "${label}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(vehicle.id);
    try {
      await vehicleService.deleteVehicle(vehicle.id);
      setVehicles((prev) => prev.filter((v) => v.id !== vehicle.id));
      showToast(`"${label}" was deleted successfully.`, 'success');
    } catch (err) {
      console.error('Error deleting vehicle:', err);
      showToast('Failed to delete vehicle. Please try again.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Render: loading skeleton ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="container">
        <div className="header">
          <h1>Vehicles</h1>
        </div>
        <SkeletonCardGrid count={6} />
      </div>
    );
  }

  // ── Render: fetch error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="container">
        <div className="error">{error}</div>
        <button onClick={() => void fetchVehicles()} className="btn-retry">
          Retry
        </button>
      </div>
    );
  }

  // ── Render: vehicle list ────────────────────────────────────────────────────────────────
  return (
    <div className="container">
      {/* ── Toast container ──────────────────────────────────────────────────────── */}
      {toasts.length > 0 && (
        <div className="vehicle-toast-container" aria-live="polite">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`vehicle-toast vehicle-toast--${t.type}`}
              role="status"
            >
              {t.message}
            </div>
          ))}
        </div>
      )}

      {/* ── Page header ─────────────────────────────────────────────────────────────── */}
      <div className="header">
        <h1>Vehicles</h1>
        <Link to="/vehicles/new" className="btn-primary">
          + Add Vehicle
        </Link>
      </div>

      {/* ── Empty state ──────────────────────────────────────────────────────────────── */}
      {vehicles.length === 0 ? (
        <div className="empty-state">
          <p>No vehicles found. Add your first vehicle to get started.</p>
          <Link to="/vehicles/new" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
            + Add Your First Vehicle
          </Link>
        </div>
      ) : (
        <div className="vehicle-grid">
          {vehicles.map((vehicle) => {
            const isDeleting = deletingId === vehicle.id;
            return (
              <div key={vehicle.id} className={`vehicle-card${isDeleting ? ' vehicle-card--deleting' : ''}`}>
                <div className="vehicle-card-header">
                  <h3>
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  {vehicle.number && (
                    <span className="vehicle-number">#{vehicle.number}</span>
                  )}
                </div>
                <div className="vehicle-card-body">
                  <p className="vehicle-category">{vehicle.category}</p>
                  {vehicle.vin && (
                    <p className="vehicle-vin">VIN: {vehicle.vin}</p>
                  )}
                  {vehicle.notes && (
                    <p className="vehicle-notes">{vehicle.notes}</p>
                  )}
                </div>
                <div className="vehicle-card-footer">
                  <Link
                    to={`/vehicles/${vehicle.id}`}
                    className="btn-secondary"
                    aria-disabled={isDeleting}
                    tabIndex={isDeleting ? -1 : undefined}
                  >
                    View Details
                  </Link>
                  <Link
                    to={`/vehicles/${vehicle.id}/edit`}
                    className="btn-secondary"
                    aria-disabled={isDeleting}
                    tabIndex={isDeleting ? -1 : undefined}
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => void handleDelete(vehicle)}
                    className="btn-danger"
                    disabled={isDeleting}
                    aria-label={`Delete ${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  >
                    {isDeleting ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VehicleListPage;
