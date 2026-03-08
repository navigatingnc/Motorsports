/**
 * Core event types for the mobile app.
 * Mirrors the backend Event model returned by /api/events.
 */

export interface RaceEvent {
  id: string;
  name: string;
  venue: string;
  date: string;
  description?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventListResponse {
  success: boolean;
  data: RaceEvent[];
}

export interface EventDetailResponse {
  success: boolean;
  data: RaceEvent;
}

export interface WeatherData {
  temperature: number;
  windspeed: number;
  weathercode: number;
  description: string;
}

export interface WeatherResponse {
  success: boolean;
  data: WeatherData;
}

export interface SetupSheet {
  id: string;
  eventId: string;
  vehicleId: string;
  notes?: string;
  tyrePressureFl?: number;
  tyrePressureFr?: number;
  tyrePressureRl?: number;
  tyrePressureRr?: number;
  rideHeightFront?: number;
  rideHeightRear?: number;
  createdAt: string;
}

export interface SetupSheetListResponse {
  success: boolean;
  data: SetupSheet[];
}
