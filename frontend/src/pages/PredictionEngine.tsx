/**
 * PredictionEngine.tsx — Phase 27
 *
 * A form-driven page that submits a vehicleId, eventId, and setupId to the
 * POST /api/predict/laptime endpoint and displays the predicted lap time in a
 * result card.
 */
import { useState, FormEvent } from 'react';
import { predictLapTime, type PredictedLapTime } from '../services/predictService';
import '../prediction.css';

// ── Confidence badge helper ───────────────────────────────────────────────────
const confidenceLabel: Record<PredictedLapTime['confidence'], string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const confidenceClass: Record<PredictedLapTime['confidence'], string> = {
  high: 'prediction-badge prediction-badge--high',
  medium: 'prediction-badge prediction-badge--medium',
  low: 'prediction-badge prediction-badge--low',
};

// ── Component ─────────────────────────────────────────────────────────────────
const PredictionEngine = () => {
  const [vehicleId, setVehicleId] = useState('');
  const [eventId, setEventId] = useState('');
  const [setupId, setSetupId] = useState('');
  const [result, setResult] = useState<PredictedLapTime | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setIsLoading(true);

    try {
      const prediction = await predictLapTime({ vehicleId: vehicleId.trim(), eventId: eventId.trim(), setupId: setupId.trim() });
      setResult(prediction);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'An unexpected error occurred. Please check the IDs and try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="prediction-page">
      {/* ── Page header ── */}
      <div className="prediction-header">
        <h1 className="prediction-title">Predictive Performance Modeling</h1>
        <p className="prediction-subtitle">
          Enter a vehicle, event, and setup sheet to receive a weighted-average predicted lap time
          derived from historical data, weather conditions, and setup parameters.
        </p>
      </div>

      <div className="prediction-layout">
        {/* ── Input form ── */}
        <section className="prediction-form-card">
          <h2 className="prediction-form-card__heading">Prediction Inputs</h2>
          <form className="prediction-form" onSubmit={handleSubmit} noValidate>
            <div className="prediction-form__field">
              <label htmlFor="vehicleId" className="prediction-form__label">
                Vehicle ID
              </label>
              <input
                id="vehicleId"
                type="text"
                className="prediction-form__input"
                placeholder="e.g. 3f2504e0-4f89-11d3-9a0c-0305e82c3301"
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                required
                disabled={isLoading}
              />
              <span className="prediction-form__hint">
                UUID of the vehicle to predict for.
              </span>
            </div>

            <div className="prediction-form__field">
              <label htmlFor="eventId" className="prediction-form__label">
                Event ID
              </label>
              <input
                id="eventId"
                type="text"
                className="prediction-form__input"
                placeholder="e.g. 7c9e6679-7425-40de-944b-e07fc1f90ae7"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                required
                disabled={isLoading}
              />
              <span className="prediction-form__hint">
                UUID of the event (circuit/round) to predict for.
              </span>
            </div>

            <div className="prediction-form__field">
              <label htmlFor="setupId" className="prediction-form__label">
                Setup Sheet ID
              </label>
              <input
                id="setupId"
                type="text"
                className="prediction-form__input"
                placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                value={setupId}
                onChange={(e) => setSetupId(e.target.value)}
                required
                disabled={isLoading}
              />
              <span className="prediction-form__hint">
                UUID of the setup sheet to use as the configuration baseline.
              </span>
            </div>

            <div className="prediction-form__actions">
              <button
                type="submit"
                className="prediction-form__submit"
                disabled={isLoading || !vehicleId.trim() || !eventId.trim() || !setupId.trim()}
              >
                {isLoading ? 'Predicting…' : 'Run Prediction'}
              </button>
              {(result || error) && (
                <button
                  type="button"
                  className="prediction-form__reset"
                  onClick={handleReset}
                  disabled={isLoading}
                >
                  Reset
                </button>
              )}
            </div>
          </form>
        </section>

        {/* ── Result card ── */}
        <section className="prediction-result-area" aria-live="polite">
          {isLoading && (
            <div className="prediction-result-card prediction-result-card--loading">
              <div className="prediction-result-card__spinner" />
              <p className="prediction-result-card__loading-text">
                Analysing historical data…
              </p>
            </div>
          )}

          {error && !isLoading && (
            <div className="prediction-result-card prediction-result-card--error">
              <div className="prediction-result-card__error-icon">⚠️</div>
              <h3 className="prediction-result-card__error-title">Prediction Failed</h3>
              <p className="prediction-result-card__error-body">{error}</p>
            </div>
          )}

          {result && !isLoading && (
            <div className="prediction-result-card prediction-result-card--success">
              <div className="prediction-result-card__header">
                <span className="prediction-result-card__icon">🏎️</span>
                <h3 className="prediction-result-card__title">Predicted Lap Time</h3>
              </div>

              <p className="prediction-result-card__time">
                {result.predictedTimeFormatted}
              </p>

              <div className="prediction-result-card__meta">
                <div className="prediction-result-card__meta-item">
                  <span className="prediction-result-card__meta-label">Confidence</span>
                  <span className={confidenceClass[result.confidence]}>
                    {confidenceLabel[result.confidence]}
                  </span>
                </div>
                <div className="prediction-result-card__meta-item">
                  <span className="prediction-result-card__meta-label">Contributing Laps</span>
                  <span className="prediction-result-card__meta-value">
                    {result.contributingLaps}
                  </span>
                </div>
              </div>

              <p className="prediction-result-card__message">{result.message}</p>
            </div>
          )}

          {!result && !error && !isLoading && (
            <div className="prediction-result-card prediction-result-card--empty">
              <div className="prediction-result-card__empty-icon">📊</div>
              <h3 className="prediction-result-card__empty-title">No prediction yet</h3>
              <p className="prediction-result-card__empty-body">
                Fill in the form and click <strong>Run Prediction</strong> to generate a
                weighted-average lap time estimate.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default PredictionEngine;
