import React, { useState } from 'react';
import '../setup.css';
import type { CreateSetupSheetDto } from '../types/setup';
import { SESSION_TYPES, DOWNFORCE_LEVELS } from '../types/setup';
import { setupService } from '../services/setupService';

interface SetupSheetFormProps {
  eventId: string;
  vehicleOptions: { id: string; label: string }[];
  onSuccess: () => void;
  onCancel: () => void;
}

type FormData = Omit<CreateSetupSheetDto, 'vehicleId' | 'eventId'> & {
  vehicleId: string;
};

const emptyForm: FormData = {
  vehicleId: '',
  sessionType: 'Practice',
  sessionNumber: undefined,
  tyreFrontLeft: '',
  tyreFrontRight: '',
  tyreRearLeft: '',
  tyreRearRight: '',
  tyrePressureFrontLeft: undefined,
  tyrePressureFrontRight: undefined,
  tyrePressureRearLeft: undefined,
  tyrePressureRearRight: undefined,
  rideHeightFront: undefined,
  rideHeightRear: undefined,
  springRateFront: undefined,
  springRateRear: undefined,
  damperFront: '',
  damperRear: '',
  camberFront: undefined,
  camberRear: undefined,
  toeInFront: undefined,
  toeInRear: undefined,
  frontWingAngle: undefined,
  rearWingAngle: undefined,
  downforceLevel: '',
  brakeBias: undefined,
  brakeCompound: '',
  engineMap: '',
  differentialEntry: undefined,
  differentialMid: undefined,
  differentialExit: undefined,
  fuelLoad: undefined,
  notes: '',
  driverFeedback: '',
};

const SetupSheetForm: React.FC<SetupSheetFormProps> = ({
  eventId,
  vehicleOptions,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'number'
          ? value === ''
            ? undefined
            : parseFloat(value)
          : value === ''
          ? type === 'text' || e.target.tagName === 'TEXTAREA'
            ? ''
            : undefined
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.vehicleId) {
      setError('Please select a vehicle.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateSetupSheetDto = {
        ...formData,
        eventId,
      };
      // Strip empty strings to undefined so the API receives clean data
      const cleaned = Object.fromEntries(
        Object.entries(payload).map(([k, v]) => [k, v === '' ? undefined : v])
      ) as CreateSetupSheetDto;

      await setupService.createSetup(cleaned);
      onSuccess();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to save setup sheet. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="setup-form-overlay">
      <div className="setup-form-modal">
        <div className="setup-form-header">
          <h2 className="setup-form-title">New Setup Sheet</h2>
          <button className="setup-form-close" onClick={onCancel} aria-label="Close">
            ✕
          </button>
        </div>

        {error && <div className="setup-form-error">{error}</div>}

        <form onSubmit={handleSubmit} className="setup-form">
          {/* ── Session Context ─────────────────────────────────── */}
          <section className="setup-section">
            <h3 className="setup-section-title">Session Context</h3>
            <div className="setup-grid setup-grid--2">
              <div className="form-group">
                <label className="form-label" htmlFor="vehicleId">
                  Vehicle <span className="required">*</span>
                </label>
                <select
                  id="vehicleId"
                  name="vehicleId"
                  className="form-input"
                  value={formData.vehicleId}
                  onChange={handleChange}
                  required
                >
                  <option value="">— Select Vehicle —</option>
                  {vehicleOptions.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="sessionType">
                  Session Type <span className="required">*</span>
                </label>
                <select
                  id="sessionType"
                  name="sessionType"
                  className="form-input"
                  value={formData.sessionType}
                  onChange={handleChange}
                  required
                >
                  {SESSION_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="sessionNumber">
                  Session Number
                </label>
                <input
                  id="sessionNumber"
                  name="sessionNumber"
                  type="number"
                  min={1}
                  className="form-input"
                  value={formData.sessionNumber ?? ''}
                  onChange={handleChange}
                  placeholder="e.g. 1"
                />
              </div>
            </div>
          </section>

          {/* ── Tyre Setup ──────────────────────────────────────── */}
          <section className="setup-section">
            <h3 className="setup-section-title">Tyre Setup</h3>
            <div className="setup-grid setup-grid--4">
              {(['FrontLeft', 'FrontRight', 'RearLeft', 'RearRight'] as const).map((pos) => (
                <div className="form-group" key={`tyre-${pos}`}>
                  <label className="form-label" htmlFor={`tyre${pos}`}>
                    {pos.replace(/([A-Z])/g, ' $1').trim()} Compound
                  </label>
                  <input
                    id={`tyre${pos}`}
                    name={`tyre${pos}`}
                    type="text"
                    className="form-input"
                    value={(formData as Record<string, unknown>)[`tyre${pos}`] as string ?? ''}
                    onChange={handleChange}
                    placeholder="e.g. Soft"
                  />
                </div>
              ))}
            </div>
            <div className="setup-grid setup-grid--4" style={{ marginTop: '0.75rem' }}>
              {(['FrontLeft', 'FrontRight', 'RearLeft', 'RearRight'] as const).map((pos) => (
                <div className="form-group" key={`pressure-${pos}`}>
                  <label className="form-label" htmlFor={`tyrePressure${pos}`}>
                    {pos.replace(/([A-Z])/g, ' $1').trim()} Pressure (PSI)
                  </label>
                  <input
                    id={`tyrePressure${pos}`}
                    name={`tyrePressure${pos}`}
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={(formData as Record<string, unknown>)[`tyrePressure${pos}`] as number ?? ''}
                    onChange={handleChange}
                    placeholder="e.g. 28.5"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* ── Suspension ──────────────────────────────────────── */}
          <section className="setup-section">
            <h3 className="setup-section-title">Suspension</h3>
            <div className="setup-grid setup-grid--3">
              <div className="form-group">
                <label className="form-label" htmlFor="rideHeightFront">
                  Ride Height Front (mm)
                </label>
                <input
                  id="rideHeightFront"
                  name="rideHeightFront"
                  type="number"
                  step="0.5"
                  className="form-input"
                  value={formData.rideHeightFront ?? ''}
                  onChange={handleChange}
                  placeholder="e.g. 50"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="rideHeightRear">
                  Ride Height Rear (mm)
                </label>
                <input
                  id="rideHeightRear"
                  name="rideHeightRear"
                  type="number"
                  step="0.5"
                  className="form-input"
                  value={formData.rideHeightRear ?? ''}
                  onChange={handleChange}
                  placeholder="e.g. 60"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="springRateFront">
                  Spring Rate Front (N/mm)
                </label>
                <input
                  id="springRateFront"
                  name="springRateFront"
                  type="number"
                  step="1"
                  className="form-input"
                  value={formData.springRateFront ?? ''}
                  onChange={handleChange}
                  placeholder="e.g. 120"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="springRateRear">
                  Spring Rate Rear (N/mm)
                </label>
                <input
                  id="springRateRear"
                  name="springRateRear"
                  type="number"
                  step="1"
                  className="form-input"
                  value={formData.springRateRear ?? ''}
                  onChange={handleChange}
                  placeholder="e.g. 140"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="damperFront">
                  Damper Front
                </label>
                <input
                  id="damperFront"
                  name="damperFront"
                  type="text"
                  className="form-input"
                  value={formData.damperFront ?? ''}
                  onChange={handleChange}
                  placeholder="e.g. 8 clicks"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="damperRear">
                  Damper Rear
                </label>
                <input
                  id="damperRear"
                  name="damperRear"
                  type="text"
                  className="form-input"
                  value={formData.damperRear ?? ''}
                  onChange={handleChange}
                  placeholder="e.g. 6 clicks"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="camberFront">
                  Camber Front (°)
                </label>
                <input
                  id="camberFront"
                  name="camberFront"
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={formData.camberFront ?? ''}
                  onChange={handleChange}
                  placeholder="e.g. -2.5"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="camberRear">
                  Camber Rear (°)
                </label>
                <input
                  id="camberRear"
                  name="camberRear"
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={formData.camberRear ?? ''}
                  onChange={handleChange}
                  placeholder="e.g. -1.5"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="toeInFront">
                  Toe-In Front (mm)
                </label>
                <input
                  id="toeInFront"
                  name="toeInFront"
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={formData.toeInFront ?? ''}
                  onChange={handleChange}
                  placeholder="e.g. 0.5"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="toeInRear">
                  Toe-In Rear (mm)
                </label>
                <input
                  id="toeInRear"
                  name="toeInRear"
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={formData.toeInRear ?? ''}
                  onChange={handleChange}
                  placeholder="e.g. 1.0"
                />
              </div>
            </div>
          </section>

          {/* ── Aerodynamics ────────────────────────────────────── */}
          <section className="setup-section">
            <h3 className="setup-section-title">Aerodynamics</h3>
            <div className="setup-grid setup-grid--3">
              <div className="form-group">
                <label className="form-label" htmlFor="frontWingAngle">
                  Front Wing Angle (°)
                </label>
                <input
                  id="frontWingAngle"
                  name="frontWingAngle"
                  type="number"
                  step="0.5"
                  className="form-input"
                  value={formData.frontWingAngle ?? ''}
                  onChange={handleChange}
                  placeholder="e.g. 5"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="rearWingAngle">
                  Rear Wing Angle (°)
                </label>
                <input
                  id="rearWingAngle"
                  name="rearWingAngle"
                  type="number"
                  step="0.5"
                  className="form-input"
                  value={formData.rearWingAngle ?? ''}
                  onChange={handleChange}
                  placeholder="e.g. 12"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="downforceLevel">
                  Downforce Level
                </label>
                <select
                  id="downforceLevel"
                  name="downforceLevel"
                  className="form-input"
                  value={formData.downforceLevel ?? ''}
                  onChange={handleChange}
                >
                  <option value="">— Select —</option>
                  {DOWNFORCE_LEVELS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* ── Brakes ──────────────────────────────────────────── */}
          <section className="setup-section">
            <h3 className="setup-section-title">Brakes</h3>
            <div className="setup-grid setup-grid--2">
              <div className="form-group">
                <label className="form-label" htmlFor="brakeBias">
                  Brake Bias (% front)
                </label>
                <input
                  id="brakeBias"
                  name="brakeBias"
                  type="number"
                  step="0.5"
                  min={0}
                  max={100}
                  className="form-input"
                  value={formData.brakeBias ?? ''}
                  onChange={handleChange}
                  placeholder="e.g. 58"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="brakeCompound">
                  Brake Compound
                </label>
                <input
                  id="brakeCompound"
                  name="brakeCompound"
                  type="text"
                  className="form-input"
                  value={formData.brakeCompound ?? ''}
                  onChange={handleChange}
                  placeholder="e.g. Carbon"
                />
              </div>
            </div>
          </section>

          {/* ── Engine / Drivetrain ─────────────────────────────── */}
          <section className="setup-section">
            <h3 className="setup-section-title">Engine &amp; Drivetrain</h3>
            <div className="setup-grid setup-grid--2">
              <div className="form-group">
                <label className="form-label" htmlFor="engineMap">
                  Engine Map
                </label>
                <input
                  id="engineMap"
                  name="engineMap"
                  type="text"
                  className="form-input"
                  value={formData.engineMap ?? ''}
                  onChange={handleChange}
                  placeholder="e.g. Map 3"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="fuelLoad">
                  Fuel Load (L)
                </label>
                <input
                  id="fuelLoad"
                  name="fuelLoad"
                  type="number"
                  step="1"
                  min={0}
                  className="form-input"
                  value={formData.fuelLoad ?? ''}
                  onChange={handleChange}
                  placeholder="e.g. 80"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="differentialEntry">
                  Differential Entry (%)
                </label>
                <input
                  id="differentialEntry"
                  name="differentialEntry"
                  type="number"
                  step="1"
                  min={0}
                  max={100}
                  className="form-input"
                  value={formData.differentialEntry ?? ''}
                  onChange={handleChange}
                  placeholder="e.g. 40"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="differentialMid">
                  Differential Mid (%)
                </label>
                <input
                  id="differentialMid"
                  name="differentialMid"
                  type="number"
                  step="1"
                  min={0}
                  max={100}
                  className="form-input"
                  value={formData.differentialMid ?? ''}
                  onChange={handleChange}
                  placeholder="e.g. 55"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="differentialExit">
                  Differential Exit (%)
                </label>
                <input
                  id="differentialExit"
                  name="differentialExit"
                  type="number"
                  step="1"
                  min={0}
                  max={100}
                  className="form-input"
                  value={formData.differentialExit ?? ''}
                  onChange={handleChange}
                  placeholder="e.g. 65"
                />
              </div>
            </div>
          </section>

          {/* ── Notes ───────────────────────────────────────────── */}
          <section className="setup-section">
            <h3 className="setup-section-title">Notes &amp; Feedback</h3>
            <div className="setup-grid setup-grid--1">
              <div className="form-group">
                <label className="form-label" htmlFor="notes">
                  Engineer Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  className="form-input form-textarea"
                  rows={3}
                  value={formData.notes ?? ''}
                  onChange={handleChange}
                  placeholder="Any setup notes or observations..."
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="driverFeedback">
                  Driver Feedback
                </label>
                <textarea
                  id="driverFeedback"
                  name="driverFeedback"
                  className="form-input form-textarea"
                  rows={3}
                  value={formData.driverFeedback ?? ''}
                  onChange={handleChange}
                  placeholder="Driver comments on car balance, handling..."
                />
              </div>
            </div>
          </section>

          {/* ── Actions ─────────────────────────────────────────── */}
          <div className="setup-form-actions">
            <button type="button" className="btn-secondary" onClick={onCancel} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save Setup Sheet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetupSheetForm;
