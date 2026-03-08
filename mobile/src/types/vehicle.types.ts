/**
 * Core vehicle types for the mobile app.
 * Mirrors the backend Vehicle model returned by /api/vehicles.
 */

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  category: string;
  vin?: string;
  color?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleListResponse {
  success: boolean;
  data: Vehicle[];
}

export interface VehicleDetailResponse {
  success: boolean;
  data: Vehicle;
}

export interface LapTimeSummary {
  id: string;
  lapNumber: number;
  timeMs: number;
  eventId: string;
  eventName?: string;
  createdAt: string;
}
