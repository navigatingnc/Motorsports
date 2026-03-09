/**
 * Frontend type definitions for the Telemetry feature.
 *
 * These mirror the backend `telemetry.types.ts` shapes and the Prisma model
 * so that the API responses are fully typed throughout the React application.
 */

/** A single telemetry sample returned by GET /api/telemetry/:lapTimeId */
export interface TelemetrySample {
  id: string;
  lapTimeId: string;
  /** Milliseconds elapsed from the start of the lap */
  offsetMs: number;
  /** Vehicle speed in km/h */
  speed: number | null;
  /** Engine RPM */
  rpm: number | null;
  /** Throttle position 0–100 % */
  throttle: number | null;
  /** Brake pressure 0–100 % */
  brake: number | null;
  /** Current gear (0 = neutral) */
  gear: number | null;
  /** GPS latitude in decimal degrees */
  gpsLat: number | null;
  /** GPS longitude in decimal degrees */
  gpsLng: number | null;
  createdAt: string;
}

/** Lap metadata embedded in the telemetry response */
export interface TelemetryLapMeta {
  id: string;
  lapNumber: number;
  lapTimeMs: number;
  sessionType: string;
  driver: {
    user: { firstName: string; lastName: string };
  };
  vehicle: { make: string; model: string; year: number };
  event: { name: string; venue: string };
}

/** Full response shape from GET /api/telemetry/:lapTimeId */
export interface TelemetryTrace {
  lap: TelemetryLapMeta;
  sampleCount: number;
  samples: TelemetrySample[];
}

/** Body for POST /api/telemetry/batch */
export interface BatchIngestDto {
  lapTimeId: string;
  samples: {
    offsetMs: number;
    speed?: number;
    rpm?: number;
    throttle?: number;
    brake?: number;
    gear?: number;
    gpsLat?: number;
    gpsLng?: number;
  }[];
}
