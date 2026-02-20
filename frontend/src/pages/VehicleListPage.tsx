import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { vehicleService } from '../services/vehicleService';
import type { Vehicle } from '../types/vehicle';

const VehicleListPage = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
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
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) {
      return;
    }

    try {
      await vehicleService.deleteVehicle(id);
      setVehicles(vehicles.filter((vehicle) => vehicle.id !== id));
    } catch (err) {
      setError('Failed to delete vehicle. Please try again.');
      console.error('Error deleting vehicle:', err);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading vehicles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">{error}</div>
        <button onClick={fetchVehicles} className="btn-retry">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Vehicles</h1>
        <Link to="/vehicles/new" className="btn-primary">
          Add New Vehicle
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <div className="empty-state">
          <p>No vehicles found. Add your first vehicle to get started.</p>
        </div>
      ) : (
        <div className="vehicle-grid">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="vehicle-card">
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
                <Link to={`/vehicles/${vehicle.id}`} className="btn-secondary">
                  View Details
                </Link>
                <Link to={`/vehicles/${vehicle.id}/edit`} className="btn-secondary">
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(vehicle.id)}
                  className="btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VehicleListPage;
