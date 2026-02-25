import api from './api';
import type { AdminUser } from '../types/admin';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
}

export const adminService = {
  /**
   * Fetch all users (admin only).
   */
  getAllUsers: async (): Promise<AdminUser[]> => {
    const response = await api.get<ApiResponse<AdminUser[]>>('/api/admin/users');
    return response.data.data;
  },

  /**
   * Get a single user by ID (admin only).
   */
  getUserById: async (id: string): Promise<AdminUser> => {
    const response = await api.get<ApiResponse<AdminUser>>(`/api/admin/users/${id}`);
    return response.data.data;
  },

  /**
   * Update a user's role (admin only).
   */
  updateUserRole: async (id: string, role: string): Promise<AdminUser> => {
    const response = await api.patch<ApiResponse<AdminUser>>(`/api/admin/users/${id}/role`, { role });
    return response.data.data;
  },

  /**
   * Toggle a user's active status (admin only).
   */
  toggleUserStatus: async (id: string, isActive: boolean): Promise<AdminUser> => {
    const response = await api.patch<ApiResponse<AdminUser>>(`/api/admin/users/${id}/status`, { isActive });
    return response.data.data;
  },
};
