/**
 * Telemetry type definitions for the Motorsports Management API.
 *
 * A single telemetry sample represents one data point captured by an on-board
 * data logger at a specific millisecond offset from the start of a lap.
 */

/** Shape of a single telemetry sample as returned by the API. */
export interface TelemetrySample {
  id: string;
  lapTimeId: string;
  offsetMs: number;
  speed: number | null;
  rpm: number | null;
  throttle: number | null;
  brake: number | null;
  gear: number | null;
  gpsLat: number | null;
  gpsLng: number | null;
  createdAt: string;
}

/**
 * DTO for a single sample inside a batch ingestion request.
 * All channel values are optional — loggers may omit channels they do not
 * support without breaking the ingestion pipeline.
 */
export interface TelemetrySampleDto {
  offsetMs: number;
  speed?: number;
  rpm?: number;
  throttle?: number;
  brake?: number;
  gear?: number;
  gpsLat?: number;
  gpsLng?: number;
}

/** Body shape for the POST /api/telemetry/batch endpoint. */
export interface BatchIngestDto {
  lapTimeId: string;
  samples: TelemetrySampleDto[];
}
