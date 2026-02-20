import api from './api';
import type { Vehicle, CreateVehicleDto } from '../types/vehicle';

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
