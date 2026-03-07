import apiClient, { storeToken, removeToken } from './api.service';
import { LoginDto, RegisterDto, AuthResponse, AuthUser } from '../types/auth.types';

/**
 * Authenticate an existing user.
 * Stores the returned JWT in SecureStore on success.
 */
export const login = async (dto: LoginDto): Promise<AuthUser> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', dto);
  const { token, user } = response.data.data;
  await storeToken(token);
  return user;
};

/**
 * Register a new user account.
 * Stores the returned JWT in SecureStore on success.
 */
export const register = async (dto: RegisterDto): Promise<AuthUser> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', dto);
  const { token, user } = response.data.data;
  await storeToken(token);
  return user;
};

/**
 * Fetch the currently authenticated user's profile.
 */
export const getMe = async (): Promise<AuthUser> => {
  const response = await apiClient.get<{ success: boolean; data: AuthUser }>('/auth/me');
  return response.data.data;
};

/**
 * Clear the stored JWT (logout).
 */
export const logout = async (): Promise<void> => {
  await removeToken();
};
