import api from './api';
import type { Vehicle, CreateVehicleDto } from '../types/vehicle';

// ── Vehicle API Response wrapper ──────────────────────────────────────────────
// The backend returns { success: boolean, data: T, count?: number, message?: string }
// All service methods unwrap to the inner `data` field to match the pattern used
// across the rest of the application (analyticsService, driverService, etc.).

export const vehicleService = {
  // Get all vehicles
  getAllVehicles: async (): Promise<Vehicle[]> => {
    const response = await api.get<{ success: boolean; data: Vehicle[]; count: number }>(
      '/api/vehicles',
    );
    return response.data.data;
  },

  // Get vehicle by ID
  getVehicleById: async (id: string): Promise<Vehicle> => {
    const response = await api.get<{ success: boolean; data: Vehicle }>(
      `/api/vehicles/${id}`,
    );
    return response.data.data;
  },

  // Create new vehicle
  createVehicle: async (data: CreateVehicleDto): Promise<Vehicle> => {
    const response = await api.post<{ success: boolean; data: Vehicle; message: string }>(
      '/api/vehicles',
      data,
    );
    return response.data.data;
  },

  // Update vehicle
  updateVehicle: async (id: string, data: Partial<CreateVehicleDto>): Promise<Vehicle> => {
    const response = await api.put<{ success: boolean; data: Vehicle; message: string }>(
      `/api/vehicles/${id}`,
      data,
    );
    return response.data.data;
  },

  // Delete vehicle
  deleteVehicle: async (id: string): Promise<void> => {
    await api.delete(`/api/vehicles/${id}`);
  },
};
