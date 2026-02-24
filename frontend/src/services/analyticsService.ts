import api from './api';
import type { LapTime, CreateLapTimeDto, AnalyticsSummary } from '../types/laptime';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
}

export const analyticsService = {
  /**
   * Record a new lap time
   */
  async recordLapTime(data: CreateLapTimeDto): Promise<LapTime> {
    const response = await api.post<ApiResponse<LapTime>>('/api/analytics/laptimes', data);
    return response.data.data;
  },

  /**
   * Get all lap times with optional filters
   */
  async getLapTimes(filters?: {
    eventId?: string;
    driverId?: string;
    vehicleId?: string;
    sessionType?: string;
  }): Promise<LapTime[]> {
    const response = await api.get<ApiResponse<LapTime[]>>('/api/analytics/laptimes', {
      params: filters,
    });
    return response.data.data;
  },

  /**
   * Get a single lap time by ID
   */
  async getLapTimeById(id: string): Promise<LapTime> {
    const response = await api.get<ApiResponse<LapTime>>(`/api/analytics/laptimes/${id}`);
    return response.data.data;
  },

  /**
   * Delete a lap time
   */
  async deleteLapTime(id: string): Promise<void> {
    await api.delete(`/api/analytics/laptimes/${id}`);
  },

  /**
   * Get aggregated analytics summary
   */
  async getSummary(eventId?: string): Promise<AnalyticsSummary> {
    const response = await api.get<ApiResponse<AnalyticsSummary>>('/api/analytics/summary', {
      params: eventId ? { eventId } : undefined,
    });
    return response.data.data;
  },
};
