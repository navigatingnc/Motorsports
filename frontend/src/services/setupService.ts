import api from './api';
import type { SetupSheet, CreateSetupSheetDto } from '../types/setup';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
}

export const setupService = {
  /**
   * Get all setup sheets, optionally filtered by eventId or vehicleId.
   */
  getAllSetups: async (params?: { eventId?: string; vehicleId?: string }): Promise<SetupSheet[]> => {
    const response = await api.get<ApiResponse<SetupSheet[]>>('/api/setups', { params });
    return response.data.data;
  },

  /**
   * Get a single setup sheet by ID.
   */
  getSetupById: async (id: string): Promise<SetupSheet> => {
    const response = await api.get<ApiResponse<SetupSheet>>(`/api/setups/${id}`);
    return response.data.data;
  },

  /**
   * Create a new setup sheet.
   */
  createSetup: async (data: CreateSetupSheetDto): Promise<SetupSheet> => {
    const response = await api.post<ApiResponse<SetupSheet>>('/api/setups', data);
    return response.data.data;
  },

  /**
   * Update an existing setup sheet.
   */
  updateSetup: async (id: string, data: Partial<CreateSetupSheetDto>): Promise<SetupSheet> => {
    const response = await api.put<ApiResponse<SetupSheet>>(`/api/setups/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete a setup sheet.
   */
  deleteSetup: async (id: string): Promise<void> => {
    await api.delete(`/api/setups/${id}`);
  },
};
