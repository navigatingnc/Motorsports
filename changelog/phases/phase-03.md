# Phase 3: Frontend: Project Setup & Vehicle List

**Date:** February 18, 2026  
**Status:** ✅ Completed

---

### Summary
Successfully initialized the React frontend application using Vite and TypeScript. Implemented the core architecture including API integration with Axios, routing with React Router, and created the VehicleListPage component to display vehicles fetched from the backend API. The application features a responsive design with a motorsports-themed interface.

### Work Performed

1. **Project Initialization**
   - Created React project with Vite and TypeScript template
   - Configured project structure with proper directories
   - Set up development environment with hot module replacement

2. **Dependencies Installed**
   - **Core:** react, react-dom
   - **Routing:** react-router-dom
   - **HTTP Client:** axios
   - **Build Tool:** vite
   - **TypeScript:** @types/react, @types/react-dom

3. **Type Definitions**
   - Created `Vehicle` interface matching backend schema
   - Defined `CreateVehicleDto` for vehicle creation
   - Ensured type safety across all components and services

4. **API Integration**
   - Implemented base Axios instance with configurable base URL
   - Created request interceptor for adding JWT authentication tokens
   - Created response interceptor for handling 401 unauthorized errors
   - Built `vehicleService` with all CRUD operations:
     - `getAllVehicles()` - Fetch all vehicles
     - `getVehicleById(id)` - Fetch single vehicle
     - `createVehicle(data)` - Create new vehicle
     - `updateVehicle(id, data)` - Update existing vehicle
     - `deleteVehicle(id)` - Delete vehicle

5. **Component Development**
   - Created `VehicleListPage` component with:
     - Data fetching using useEffect hook
     - Loading and error states
     - Empty state for no vehicles
     - Vehicle grid display with cards
     - Delete functionality with confirmation
     - Navigation links to detail and edit pages (placeholders)
   - Built main `App` component with:
     - React Router configuration
     - Navigation bar with branding
     - Route definitions for all pages
     - Redirect from root to vehicles list

6. **Styling**
   - Designed comprehensive CSS with CSS custom properties
   - Implemented motorsports color scheme (red #e10600, black #1a1a1a)
   - Created responsive grid layout for vehicle cards
   - Added hover effects and transitions
   - Ensured mobile-friendly design with media queries
   - Styled navigation bar, buttons, and cards

7. **Configuration**
   - Created `.env` file for environment variables
   - Set up `VITE_API_BASE_URL` for backend connection
   - Added `.env.example` as template
   - Configured Vite for development and production builds

8. **Documentation**
   - Created comprehensive README.md with:
     - Project overview and features
     - Tech stack details
     - Installation and setup instructions
     - Development and build commands
     - Project structure documentation
     - API integration notes

### Code Generated

#### `frontend/src/types/vehicle.ts`
```typescript
export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  category: string;
  number?: string;
  vin?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicleDto {
  make: string;
  model: string;
  year: number;
  category: string;
  number?: string;
  vin?: string;
  notes?: string;
}
```

#### `frontend/src/services/api.ts`
```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

#### `frontend/src/services/vehicleService.ts`
```typescript
import api from './api';
import { Vehicle, CreateVehicleDto } from '../types/vehicle';

export const vehicleService = {
  // Get all vehicles
  getAllVehicles: async (): Promise<Vehicle[]> => {
    const response = await api.get<Vehicle[]>('/api/vehicles');
    return response.data;
  },

  // Get vehicle by ID
  getVehicleById: async (id: string): Promise<Vehicle> => {
    const response = await api.get<Vehicle>(`/api/vehicles/${id}`);
    return response.data;
  },

  // Create new vehicle
  createVehicle: async (data: CreateVehicleDto): Promise<Vehicle> => {
    const response = await api.post<Vehicle>('/api/vehicles', data);
    return response.data;
  },

  // Update vehicle
  updateVehicle: async (id: string, data: Partial<CreateVehicleDto>): Promise<Vehicle> => {
    const response = await api.put<Vehicle>(`/api/vehicles/${id}`, data);
    return response.data;
  },

  // Delete vehicle
  deleteVehicle: async (id: string): Promise<void> => {
    await api.delete(`/api/vehicles/${id}`);
  },
};
```

#### `frontend/src/pages/VehicleListPage.tsx`
```typescript
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { vehicleService } from '../services/vehicleService';
import { Vehicle } from '../types/vehicle';

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
```

#### `frontend/src/App.tsx`
```typescript
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import VehicleListPage from './pages/VehicleListPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="navbar-container">
            <h1 className="navbar-brand">🏁 Motorsports Management</h1>
          </div>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/vehicles" replace />} />
            <Route path="/vehicles" element={<VehicleListPage />} />
            {/* Placeholder routes for future phases */}
            <Route path="/vehicles/:id" element={<div>Vehicle Detail (Coming Soon)</div>} />
            <Route path="/vehicles/:id/edit" element={<div>Edit Vehicle (Coming Soon)</div>} />
            <Route path="/vehicles/new" element={<div>New Vehicle (Coming Soon)</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
```

#### `frontend/.env`
```env
VITE_API_BASE_URL=http://localhost:3000
```

#### `frontend/package.json`
```json
{
  "name": "frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.13.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^7.13.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.11",
    "@types/react-dom": "^19.0.3",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "~5.8.3",
    "vite": "^7.3.1"
  }
}
```

### Testing
The frontend can be started with `pnpm dev` and accessed at `http://localhost:5173`. It will connect to the backend API at `http://localhost:3000` to fetch and display vehicles.

**Key Features Verified:**
- React application loads successfully
- Routing works correctly with React Router
- API service is configured with interceptors
- VehicleListPage component structure is complete
- Responsive CSS styling is applied
- Environment variables are properly configured

### Next Phase Preview
Phase 4 will implement the `Event` model in the backend Prisma schema and create full CRUD API endpoints for event management, including relationships with vehicles.


---
