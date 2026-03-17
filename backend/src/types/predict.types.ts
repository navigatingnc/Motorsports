/**
 * Types for the Predictive Performance Modeling endpoint — Phase 27
 */

export interface PredictLapTimeDto {
  vehicleId: string;
  eventId: string;
  // The setup to be used for the prediction. The model will compare this
  // to historical setups to gauge similarity.
  setupId: string;
}

export interface PredictedLapTime {
  predictedTimeMs: number;
  predictedTimeFormatted: string;
  confidence: 'high' | 'medium' | 'low';
  contributingLaps: number;
  message: string;
}
