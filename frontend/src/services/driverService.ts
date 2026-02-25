import api from './api';
import type { Driver, CreateDriverDto, UpdateDriverDto } from '../types/driver';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const driverService = {
  /**
   * Fetch all driver profiles (requires authentication).
   */
  getAllDrivers: async (): Promise<Driver[]> => {
    const response = await api.get<ApiResponse<Driver[]>>('/api/drivers');
    return response.data.data;
  },

  /**
   * Fetch a single driver profile by ID.
   */
  getDriverById: async (id: string): Promise<Driver> => {
    const response = await api.get<ApiResponse<Driver>>(`/api/drivers/${id}`);
    return response.data.data;
  },

  /**
   * Create a new driver profile for a given user.
   */
  createDriver: async (data: CreateDriverDto): Promise<Driver> => {
    const response = await api.post<ApiResponse<Driver>>('/api/drivers', data);
    return response.data.data;
  },

  /**
   * Update an existing driver profile.
   */
  updateDriver: async (id: string, data: UpdateDriverDto): Promise<Driver> => {
    const response = await api.put<ApiResponse<Driver>>(`/api/drivers/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete a driver profile.
   */
  deleteDriver: async (id: string): Promise<void> => {
    await api.delete(`/api/drivers/${id}`);
  },
};
