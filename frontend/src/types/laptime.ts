export interface LapTime {
  id: string;
  driverId: string;
  vehicleId: string;
  eventId: string;
  lapNumber: number;
  lapTimeMs: number;
  lapTimeFormatted: string;
  sessionType: string;
  sector1Ms: number | null;
  sector2Ms: number | null;
  sector3Ms: number | null;
  sector1Formatted: string | null;
  sector2Formatted: string | null;
  sector3Formatted: string | null;
  isValid: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  driver: {
    id: string;
    userId: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
    number: string | null;
    category: string;
  };
  event: {
    id: string;
    name: string;
    type: string;
    venue: string;
    location: string;
    startDate: string;
  };
}

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

export interface AnalyticsSummary {
  totalLaps: number;
  bestLapsByDriver: {
    driverName: string;
    lapTimeMs: number;
    lapTimeFormatted: string;
    vehicleName: string;
    eventName: string;
  }[];
  bestLapsByVehicle: {
    vehicleName: string;
    lapTimeMs: number;
    lapTimeFormatted: string;
    driverName: string;
    eventName: string;
  }[];
  lapTrendsByDriver: {
    driverName: string;
    laps: {
      lapNumber: number;
      lapTimeMs: number;
      lapTimeFormatted: string;
    }[];
  }[];
}
