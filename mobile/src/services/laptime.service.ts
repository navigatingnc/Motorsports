import apiClient from './api.service';
import {
  LapTime,
  LapTimeCreateDto,
  LapTimeListResponse,
  LapTimeCreateResponse,
} from '../types/laptime.types';

/**
 * Record a new lap time via the analytics endpoint.
 */
export const recordLapTime = async (dto: LapTimeCreateDto): Promise<LapTime> => {
  const response = await apiClient.post<LapTimeCreateResponse>('/analytics/laptimes', dto);
  return response.data.data;
};

/**
 * Fetch lap times for a specific event, optionally filtered by vehicleId.
 */
export const getLapTimes = async (eventId: string, vehicleId?: string): Promise<LapTime[]> => {
  const params = new URLSearchParams({ eventId });
  if (vehicleId) params.append('vehicleId', vehicleId);
  const response = await apiClient.get<LapTimeListResponse>(
    `/analytics/laptimes?${params.toString()}`
  );
  return response.data.data;
};

/**
 * Format milliseconds into a display string: M:SS.mmm or SS.mmm
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
