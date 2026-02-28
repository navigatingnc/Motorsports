import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { vehicleService } from '../services/vehicleService';
import type { CreateVehicleDto } from '../types/vehicle';
import { Skeleton } from '../components/Skeleton';

// ── Constants ─────────────────────────────────────────────────────────────────

const VEHICLE_CATEGORIES = [
  'Formula',
  'GT',
  'Rally',
  'Touring Car',
  'Sports Prototype',
  'Endurance',
  'Karting',
  'Drag',
  'Oval',
  'Off-Road',
  'Other',
] as const;

const CURRENT_YEAR = new Date().getFullYear();

// ── Types ─────────────────────────────────────────────────────────────────────

type FormData = {
  make: string;
  model: string;
  year: string;
  category: string;
  number: string;
  vin: string;
  notes: string;
};

const emptyForm: FormData = {
  make: '',
  model: '',
  year: String(CURRENT_YEAR),
  category: '',
  number: '',
  vin: '',
  notes: '',
};

// ── Component ─────────────────────────────────────────────────────────────────

const VehicleFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  // ── Load existing vehicle for edit mode ────────────────────────────────────

  useEffect(() => {
    if (!isEdit || !id) return;
    const load = async () => {
      try {
        setLoading(true);
        const vehicle = await vehicleService.getVehicleById(id);
        setFormData({
          make: vehicle.make,
          model: vehicle.model,
          year: String(vehicle.year),
          category: vehicle.category,
          number: vehicle.number ?? '',
          vin: vehicle.vin ?? '',
          notes: vehicle.notes ?? '',
        });
      } catch {
        setError('Failed to load vehicle data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id, isEdit]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (fieldErrors[name as keyof FormData]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const errors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.make.trim()) errors.make = 'Make is required.';
    if (!formData.model.trim()) errors.model = 'Model is required.';
    const yearNum = parseInt(formData.year, 10);
    if (!formData.year || isNaN(yearNum) || yearNum < 1900 || yearNum > CURRENT_YEAR + 1) {
      errors.year = `Year must be between 1900 and ${CURRENT_YEAR + 1}.`;
    }
    if (!formData.category) errors.category = 'Category is required.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    const payload: CreateVehicleDto = {
      make: formData.make.trim(),
      model: formData.model.trim(),
      year: parseInt(formData.year, 10),
      category: formData.category,
      number: formData.number.trim() || undefined,
      vin: formData.vin.trim() || undefined,
      notes: formData.notes.trim() || undefined,
    };

    setSubmitting(true);
    try {
      if (isEdit && id) {
        await vehicleService.updateVehicle(id, payload);
        navigate(`/vehicles/${id}`);
      } else {
        const created = await vehicleService.createVehicle(payload);
        navigate(`/vehicles/${created.id}`);
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(
        axiosErr?.response?.data?.error ??
          `Failed to ${isEdit ? 'update' : 'create'} vehicle. Please try again.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="container">
        <div style={{ marginBottom: '1.5rem' }}>
          <Skeleton width="8rem" height="0.85rem" className="skeleton-mb" />
          <Skeleton width="16rem" height="2rem" />
        </div>
        <div className="vehicle-form-card">
          <Skeleton width="100%" height="3rem" className="skeleton-mb" />
          <Skeleton width="100%" height="3rem" className="skeleton-mb" />
          <Skeleton width="60%" height="3rem" />
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="detail-page-header">
        <div className="detail-page-header-left">
          <Link
            to={isEdit && id ? `/vehicles/${id}` : '/vehicles'}
            className="detail-back-link"
          >
            ← {isEdit ? 'Back to Vehicle' : 'Back to Vehicles'}
          </Link>
          <h1 className="detail-page-title">
            {isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}
          </h1>
        </div>
      </div>

      {/* ── Form Card ──────────────────────────────────────────────── */}
      <div className="vehicle-form-card">
        {error && <div className="form-error-banner">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          {/* ── Identity ─────────────────────────────────────────── */}
          <fieldset className="vehicle-form-fieldset">
            <legend className="vehicle-form-legend">Vehicle Identity</legend>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="make" className="form-label">
                  Make <span className="form-required">*</span>
                </label>
                <input
                  id="make"
                  name="make"
                  type="text"
                  className={`form-input${fieldErrors.make ? ' form-input--error' : ''}`}
                  value={formData.make}
                  onChange={handleChange}
                  placeholder="e.g. Ferrari"
                  disabled={submitting}
                  maxLength={100}
                />
                {fieldErrors.make && (
                  <span className="form-field-error">{fieldErrors.make}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="model" className="form-label">
                  Model <span className="form-required">*</span>
                </label>
                <input
                  id="model"
                  name="model"
                  type="text"
                  className={`form-input${fieldErrors.model ? ' form-input--error' : ''}`}
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g. 488 GT3"
                  disabled={submitting}
                  maxLength={100}
                />
                {fieldErrors.model && (
                  <span className="form-field-error">{fieldErrors.model}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="year" className="form-label">
                  Year <span className="form-required">*</span>
                </label>
                <input
                  id="year"
                  name="year"
                  type="number"
                  className={`form-input${fieldErrors.year ? ' form-input--error' : ''}`}
                  value={formData.year}
                  onChange={handleChange}
                  min={1900}
                  max={CURRENT_YEAR + 1}
                  disabled={submitting}
                />
                {fieldErrors.year && (
                  <span className="form-field-error">{fieldErrors.year}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="category" className="form-label">
                  Category <span className="form-required">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  className={`form-input${fieldErrors.category ? ' form-input--error' : ''}`}
                  value={formData.category}
                  onChange={handleChange}
                  disabled={submitting}
                >
                  <option value="">Select a category…</option>
                  {VEHICLE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {fieldErrors.category && (
                  <span className="form-field-error">{fieldErrors.category}</span>
                )}
              </div>
            </div>
          </fieldset>

          {/* ── Optional Details ──────────────────────────────────── */}
          <fieldset className="vehicle-form-fieldset">
            <legend className="vehicle-form-legend">Optional Details</legend>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="number" className="form-label">
                  Racing Number
                </label>
                <input
                  id="number"
                  name="number"
                  type="text"
                  className="form-input"
                  value={formData.number}
                  onChange={handleChange}
                  placeholder="e.g. 63"
                  disabled={submitting}
                  maxLength={10}
                />
              </div>

              <div className="form-group">
                <label htmlFor="vin" className="form-label">
                  VIN
                </label>
                <input
                  id="vin"
                  name="vin"
                  type="text"
                  className="form-input"
                  value={formData.vin}
                  onChange={handleChange}
                  placeholder="Vehicle Identification Number"
                  disabled={submitting}
                  maxLength={17}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes" className="form-label">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                className="form-input form-textarea"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional notes about this vehicle…"
                rows={4}
                disabled={submitting}
              />
            </div>
          </fieldset>

          {/* ── Actions ───────────────────────────────────────────── */}
          <div className="vehicle-form-actions">
            <Link
              to={isEdit && id ? `/vehicles/${id}` : '/vehicles'}
              className="btn-secondary"
            >
              Cancel
            </Link>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting
                ? isEdit
                  ? 'Saving…'
                  : 'Creating…'
                : isEdit
                ? 'Save Changes'
                : 'Create Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleFormPage;
