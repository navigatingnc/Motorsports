import { useEffect, useState } from 'react';
import { driverService } from '../services/driverService';
import type { Driver } from '../types/driver';

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getInitials = (firstName: string, lastName: string): string =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

// ── Component ─────────────────────────────────────────────────────────────────

const DriversPage = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await driverService.getAllDrivers();
      setDrivers(data);
    } catch {
      setError('Failed to load drivers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchDrivers();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove the driver profile for "${name}"?`)) {
      return;
    }
    try {
      await driverService.deleteDriver(id);
      setDrivers((prev) => prev.filter((d) => d.id !== id));
    } catch {
      setError('Failed to delete driver profile. Please try again.');
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading drivers…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">{error}</div>
        <button onClick={fetchDrivers} className="btn-retry" style={{ marginTop: '1rem' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Drivers</h1>
      </div>

      {drivers.length === 0 ? (
        <div className="empty-state">
          <p>
            No driver profiles found. Drivers are created automatically when a user registers.
          </p>
          <p className="detail-empty-text" style={{ marginTop: '0.5rem' }}>
            Ask team members to register an account — their driver profile will appear here.
          </p>
        </div>
      ) : (
        <div className="driver-grid">
          {drivers.map((driver) => {
            const fullName = `${driver.user.firstName} ${driver.user.lastName}`;
            return (
              <div key={driver.id} className="driver-card">
                {/* Avatar */}
                <div className="driver-card-avatar">
                  <span className="driver-card-initials">
                    {getInitials(driver.user.firstName, driver.user.lastName)}
                  </span>
                </div>

                {/* Identity */}
                <div className="driver-card-identity">
                  <h3 className="driver-card-name">{fullName}</h3>
                  <p className="driver-card-email">{driver.user.email}</p>
                  <span className={`driver-card-role driver-card-role--${driver.user.role}`}>
                    {driver.user.role}
                  </span>
                </div>

                {/* Details */}
                <div className="driver-card-details">
                  {driver.nationality && (
                    <div className="driver-detail-item">
                      <span className="driver-detail-label">Nationality</span>
                      <span className="driver-detail-value">{driver.nationality}</span>
                    </div>
                  )}
                  {driver.licenseNumber && (
                    <div className="driver-detail-item">
                      <span className="driver-detail-label">License #</span>
                      <span className="driver-detail-value driver-detail-value--mono">
                        {driver.licenseNumber}
                      </span>
                    </div>
                  )}
                  {driver.dateOfBirth && (
                    <div className="driver-detail-item">
                      <span className="driver-detail-label">Date of Birth</span>
                      <span className="driver-detail-value">{formatDate(driver.dateOfBirth)}</span>
                    </div>
                  )}
                  {driver.emergencyContact && (
                    <div className="driver-detail-item">
                      <span className="driver-detail-label">Emergency Contact</span>
                      <span className="driver-detail-value">{driver.emergencyContact}</span>
                    </div>
                  )}
                </div>

                {/* Bio */}
                {driver.bio && (
                  <div className="driver-card-bio">
                    <p>{driver.bio}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="driver-card-footer">
                  <button
                    onClick={() => handleDelete(driver.id, fullName)}
                    className="btn-danger btn-sm"
                  >
                    Remove Profile
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

export default DriversPage;
