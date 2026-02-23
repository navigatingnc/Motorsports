import React, { useState } from 'react';
import '../setup.css';
import type { SetupSheet } from '../types/setup';
import { setupService } from '../services/setupService';

interface SetupSheetCardProps {
  setup: SetupSheet;
  onDeleted: () => void;
}

const SetupSheetCard: React.FC<SetupSheetCardProps> = ({ setup, onDeleted }) => {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Delete this setup sheet? This action cannot be undone.')) return;
    setDeleting(true);
    try {
      await setupService.deleteSetup(setup.id);
      onDeleted();
    } catch {
      alert('Failed to delete setup sheet.');
      setDeleting(false);
    }
  };

  const sessionLabel =
    setup.sessionNumber != null
      ? `${setup.sessionType} ${setup.sessionNumber}`
      : setup.sessionType;

  return (
    <div className="setup-card">
      {/* Card Header */}
      <div className="setup-card-header">
        <div className="setup-card-meta">
          <span className="setup-session-badge">{sessionLabel}</span>
          {setup.vehicle && (
            <span className="setup-vehicle-label">
              {setup.vehicle.year} {setup.vehicle.make} {setup.vehicle.model}
              {setup.vehicle.number ? ` #${setup.vehicle.number}` : ''}
            </span>
          )}
        </div>
        <div className="setup-card-actions">
          <button
            className="btn-ghost"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
          >
            {expanded ? 'Collapse ▲' : 'Expand ▼'}
          </button>
          <button className="btn-danger btn-sm" onClick={handleDelete} disabled={deleting}>
            {deleting ? '…' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Collapsed Summary */}
      {!expanded && (
        <div className="setup-card-summary">
          <div className="setup-summary-row">
            {setup.tyreFrontLeft && (
              <span className="setup-summary-chip">
                Tyres: {setup.tyreFrontLeft}
              </span>
            )}
            {setup.tyrePressureFrontLeft != null && (
              <span className="setup-summary-chip">
                FL {setup.tyrePressureFrontLeft} PSI
              </span>
            )}
            {setup.brakeBias != null && (
              <span className="setup-summary-chip">Bias {setup.brakeBias}%</span>
            )}
            {setup.fuelLoad != null && (
              <span className="setup-summary-chip">Fuel {setup.fuelLoad}L</span>
            )}
            {setup.downforceLevel && (
              <span className="setup-summary-chip">DF: {setup.downforceLevel}</span>
            )}
          </div>
          {setup.driverFeedback && (
            <p className="setup-feedback-preview">
              &ldquo;{setup.driverFeedback.slice(0, 120)}
              {setup.driverFeedback.length > 120 ? '…' : ''}&rdquo;
            </p>
          )}
        </div>
      )}

      {/* Expanded Detail */}
      {expanded && (
        <div className="setup-card-detail">
          {/* Tyres */}
          <div className="setup-detail-section">
            <h4 className="setup-detail-section-title">Tyres</h4>
            <div className="setup-detail-grid">
              <SetupField label="FL Compound" value={setup.tyreFrontLeft} />
              <SetupField label="FR Compound" value={setup.tyreFrontRight} />
              <SetupField label="RL Compound" value={setup.tyreRearLeft} />
              <SetupField label="RR Compound" value={setup.tyreRearRight} />
              <SetupField label="FL Pressure" value={setup.tyrePressureFrontLeft} unit="PSI" />
              <SetupField label="FR Pressure" value={setup.tyrePressureFrontRight} unit="PSI" />
              <SetupField label="RL Pressure" value={setup.tyrePressureRearLeft} unit="PSI" />
              <SetupField label="RR Pressure" value={setup.tyrePressureRearRight} unit="PSI" />
            </div>
          </div>

          {/* Suspension */}
          <div className="setup-detail-section">
            <h4 className="setup-detail-section-title">Suspension</h4>
            <div className="setup-detail-grid">
              <SetupField label="Ride Height F" value={setup.rideHeightFront} unit="mm" />
              <SetupField label="Ride Height R" value={setup.rideHeightRear} unit="mm" />
              <SetupField label="Spring Rate F" value={setup.springRateFront} unit="N/mm" />
              <SetupField label="Spring Rate R" value={setup.springRateRear} unit="N/mm" />
              <SetupField label="Damper F" value={setup.damperFront} />
              <SetupField label="Damper R" value={setup.damperRear} />
              <SetupField label="Camber F" value={setup.camberFront} unit="°" />
              <SetupField label="Camber R" value={setup.camberRear} unit="°" />
              <SetupField label="Toe-In F" value={setup.toeInFront} unit="mm" />
              <SetupField label="Toe-In R" value={setup.toeInRear} unit="mm" />
            </div>
          </div>

          {/* Aero */}
          <div className="setup-detail-section">
            <h4 className="setup-detail-section-title">Aerodynamics</h4>
            <div className="setup-detail-grid">
              <SetupField label="Front Wing" value={setup.frontWingAngle} unit="°" />
              <SetupField label="Rear Wing" value={setup.rearWingAngle} unit="°" />
              <SetupField label="Downforce" value={setup.downforceLevel} />
            </div>
          </div>

          {/* Brakes */}
          <div className="setup-detail-section">
            <h4 className="setup-detail-section-title">Brakes</h4>
            <div className="setup-detail-grid">
              <SetupField label="Brake Bias" value={setup.brakeBias} unit="% F" />
              <SetupField label="Compound" value={setup.brakeCompound} />
            </div>
          </div>

          {/* Engine */}
          <div className="setup-detail-section">
            <h4 className="setup-detail-section-title">Engine &amp; Drivetrain</h4>
            <div className="setup-detail-grid">
              <SetupField label="Engine Map" value={setup.engineMap} />
              <SetupField label="Fuel Load" value={setup.fuelLoad} unit="L" />
              <SetupField label="Diff Entry" value={setup.differentialEntry} unit="%" />
              <SetupField label="Diff Mid" value={setup.differentialMid} unit="%" />
              <SetupField label="Diff Exit" value={setup.differentialExit} unit="%" />
            </div>
          </div>

          {/* Notes */}
          {(setup.notes || setup.driverFeedback) && (
            <div className="setup-detail-section">
              <h4 className="setup-detail-section-title">Notes &amp; Feedback</h4>
              {setup.notes && (
                <div className="setup-notes-block">
                  <span className="setup-notes-label">Engineer Notes</span>
                  <p className="setup-notes-text">{setup.notes}</p>
                </div>
              )}
              {setup.driverFeedback && (
                <div className="setup-notes-block">
                  <span className="setup-notes-label">Driver Feedback</span>
                  <p className="setup-notes-text">{setup.driverFeedback}</p>
                </div>
              )}
            </div>
          )}

          {/* Meta */}
          <div className="setup-card-meta-footer">
            <span>
              Created by:{' '}
              {setup.createdBy
                ? `${setup.createdBy.firstName} ${setup.createdBy.lastName}`
                : 'Unknown'}
            </span>
            <span>
              {new Date(setup.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

/** Small helper to render a labelled field only when a value is present */
const SetupField: React.FC<{
  label: string;
  value?: string | number | null;
  unit?: string;
}> = ({ label, value, unit }) => {
  if (value == null || value === '') return null;
  return (
    <div className="setup-detail-field">
      <span className="setup-detail-label">{label}</span>
      <span className="setup-detail-value">
        {value}
        {unit ? ` ${unit}` : ''}
      </span>
    </div>
  );
};

export default SetupSheetCard;
