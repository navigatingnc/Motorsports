import api from './api';

export interface ApiStatus {
  status: string;
  version: string;
  environment: string;
  uptimeSeconds: number;
  uptimeFormatted: string;
  heapUsedMb: string;
  totalRequests: number;
  totalErrors: number;
  errorRate: string;
  timestamp: string;
}

export interface MetricsSnapshot {
  uptimeSeconds: number;
  totalRequests: number;
  totalErrors: number;
  errorRate: string;
  heapUsedBytes: number;
  avgLatenciesMs: Record<string, number>;
}

/**
 * Fetch the public /api/status endpoint.
 * No authentication required.
 */
export async function fetchApiStatus(): Promise<ApiStatus> {
  const response = await api.get<{ success: boolean; data: ApiStatus }>('/status');
  return response.data.data;
}

/**
 * Fetch the admin-only /api/metrics/json endpoint.
 * Requires an authenticated admin session.
 */
export async function fetchMetricsJson(): Promise<MetricsSnapshot> {
  const response = await api.get<{ success: boolean; data: MetricsSnapshot }>('/metrics/json');
  return response.data.data;
}
