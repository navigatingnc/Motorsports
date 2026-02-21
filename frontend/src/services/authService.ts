import api from './api';
import type { LoginDto, RegisterDto, AuthResponse } from '../types/auth';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const authService = {
  /**
   * Log in an existing user.
   * Stores the JWT token in localStorage on success.
   */
  login: async (credentials: LoginDto): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/api/auth/login', credentials);
    const { token, user } = response.data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return { token, user };
  },

  /**
   * Register a new user account.
   * Stores the JWT token in localStorage on success.
   */
  register: async (data: RegisterDto): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/api/auth/register', data);
    const { token, user } = response.data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return { token, user };
  },

  /**
   * Log out the current user by clearing stored credentials.
   */
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Retrieve the currently stored user from localStorage.
   */
  getCurrentUser: (): AuthResponse['user'] | null => {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    try {
      return JSON.parse(userJson) as AuthResponse['user'];
    } catch {
      return null;
    }
  },

  /**
   * Check whether a valid token is present in localStorage.
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },
};
