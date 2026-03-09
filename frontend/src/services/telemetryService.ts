import api from './api';
import type { TelemetryTrace, BatchIngestDto } from '../types/telemetry';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const telemetryService = {
  /**
   * Bulk-ingest telemetry samples for a single lap.
   * POST /api/telemetry/batch
   */
  async batchIngest(dto: BatchIngestDto): Promise<{ lapTimeId: string; count: number }> {
    const response = await api.post<ApiResponse<{ lapTimeId: string; count: number }>>(
      '/api/telemetry/batch',
      dto,
    );
    return response.data.data;
  },

  /**
   * Retrieve the full telemetry trace for a given lap.
   * GET /api/telemetry/:lapTimeId
   */
  async getByLap(lapTimeId: string): Promise<TelemetryTrace> {
    const response = await api.get<ApiResponse<TelemetryTrace>>(
      `/api/telemetry/${lapTimeId}`,
    );
    return response.data.data;
  },

  /**
   * Delete all telemetry samples for a given lap.
   * DELETE /api/telemetry/:lapTimeId
   */
  async deleteByLap(lapTimeId: string): Promise<{ lapTimeId: string; count: number }> {
    const response = await api.delete<ApiResponse<{ lapTimeId: string; count: number }>>(
      `/api/telemetry/${lapTimeId}`,
    );
    return response.data.data;
  },
};
