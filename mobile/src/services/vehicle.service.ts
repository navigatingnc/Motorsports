import apiClient from './api.service';
import { Vehicle, VehicleListResponse, VehicleDetailResponse, LapTimeSummary } from '../types/vehicle.types';

/**
 * Fetch all vehicles from the backend.
 */
export const getVehicles = async (): Promise<Vehicle[]> => {
  const response = await apiClient.get<VehicleListResponse>('/vehicles');
  return response.data.data;
};

/**
 * Fetch a single vehicle by ID.
 */
export const getVehicle = async (id: string): Promise<Vehicle> => {
  const response = await apiClient.get<VehicleDetailResponse>(`/vehicles/${id}`);
  return response.data.data;
};

/**
 * Fetch lap times associated with a specific vehicle.
 * Uses the analytics endpoint filtered by vehicleId.
 */
export const getVehicleLapTimes = async (vehicleId: string): Promise<LapTimeSummary[]> => {
  const response = await apiClient.get<{ success: boolean; data: LapTimeSummary[] }>(
    `/analytics/laptimes?vehicleId=${vehicleId}`
  );
  return response.data.data;
};

/**
 * Format milliseconds into a human-readable lap time string (e.g. 1:23.456).
 */
export const formatLapTime = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const millis = ms % 1000;
  if (minutes > 0) {
    return `${minutes}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
  }
  return `${seconds}.${String(millis).padStart(3, '0')}`;
};
