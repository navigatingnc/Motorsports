/**
 * Lap time types for the mobile app.
 * Mirrors the backend LapTime model returned by /api/analytics/laptimes.
 */

export interface LapTime {
  id: string;
  lapNumber: number;
  timeMs: number;
  eventId: string;
  vehicleId: string;
  driverId?: string;
  notes?: string;
  createdAt: string;
}

export interface LapTimeCreateDto {
  lapNumber: number;
  timeMs: number;
  eventId: string;
  vehicleId: string;
  notes?: string;
}

export interface LapTimeListResponse {
  success: boolean;
  data: LapTime[];
}

export interface LapTimeCreateResponse {
  success: boolean;
  data: LapTime;
}
