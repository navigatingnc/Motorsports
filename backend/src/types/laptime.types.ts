export interface CreateLapTimeDto {
  driverId: string;
  vehicleId: string;
  eventId: string;
  lapNumber: number;
  lapTimeMs: number;
  sessionType: string;
  sector1Ms?: number;
  sector2Ms?: number;
  sector3Ms?: number;
  isValid?: boolean;
  notes?: string;
}

export interface UpdateLapTimeDto {
  lapNumber?: number;
  lapTimeMs?: number;
  sessionType?: string;
  sector1Ms?: number;
  sector2Ms?: number;
  sector3Ms?: number;
  isValid?: boolean;
  notes?: string;
}

export const VALID_LAP_SESSION_TYPES = ['Practice', 'Qualifying', 'Race', 'Test'] as const;
