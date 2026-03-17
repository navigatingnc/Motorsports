/**
 * Predict Service — Phase 27
 *
 * API client methods for the /api/predict endpoints.
 */
import api from './api';

export interface PredictLapTimeDto {
  vehicleId: string;
  eventId: string;
  setupId: string;
}

export interface PredictedLapTime {
  predictedTimeMs: number;
  predictedTimeFormatted: string;
  confidence: 'high' | 'medium' | 'low';
  contributingLaps: number;
  message: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

/**
 * Submit a lap time prediction request.
 */
export const predictLapTime = async (dto: PredictLapTimeDto): Promise<PredictedLapTime> => {
  const response = await api.post<ApiResponse<PredictedLapTime>>(
    '/api/predict/laptime',
    dto,
  );
  return response.data.data;
};
