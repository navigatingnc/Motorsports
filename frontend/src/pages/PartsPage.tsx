import { useEffect, useState, useCallback } from 'react';
import { partService } from '../services/partService';
import { vehicleService } from '../services/vehicleService';
import type { Part, CreatePartDto, UpdatePartDto, InventorySummary } from '../types/part';
import { PART_CATEGORIES, PART_UNITS } from '../types/part';
import type { Vehicle } from '../types/vehicle';
import '../parts.css';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatCurrency = (value: number | null | undefined): string => {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

const CATEGORY_COLORS: Record<string, string> = {
  Engine:       '#e10600',
  Suspension:   '#0066cc',
  Brakes:       '#cc6600',
  Tyres:        '#006633',
  Bodywork:     '#6600cc',
  Drivetrain:   '#cc0066',
  'Fuel System':'#cc9900',
  Electrical:   '#0099cc',
  Electronics:  '#009999',
  Safety:       '#cc3300',
  Consumables:  '#669900',
  Tools:        '#666666',
  Other:        '#999999',
};

// ---------------------------------------------------------------------------
// Summary Cards
// ---------------------------------------------------------------------------

interface SummaryCardsProps {
  summary: InventorySummary;
}

const SummaryCards = ({ summary }: SummaryCardsProps) => (
  <div className="parts-summary-grid">
    <div className="parts-summary-card">
      <div className="parts-summary-value">{summary.totalParts}</div>
      <div className="parts-summary-label">Total Part Types</div>
    </div>
    <div className="parts-summary-card">
      <div className="parts-summary-value">{summary.totalItems.toLocaleString()}</div>
      <div className="parts-summary-label">Total Items in Stock</div>
    </div>
    <div className="parts-summary-card">
      <div className="parts-summary-value">{formatCurrency(summary.totalValue)}</div>
      <div className="parts-summary-label">Total Inventory Value</div>
    </div>
    <div className={`parts-summary-card ${summary.lowStockCount > 0 ? 'parts-summary-card--alert' : ''}`}>
      <div className="parts-summary-value">{summary.lowStockCount}</div>
      <div className="parts-summary-label">Low Stock Alerts</div>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Low-Stock Alert Banner
// ---------------------------------------------------------------------------

interface LowStockBannerProps {
  parts: InventorySummary['lowStockParts'];
  onDismiss: () => void;
}

const LowStockBanner = ({ parts, onDismiss }: LowStockBannerProps) => {
  if (parts.length === 0) return null;
  return (
    <div className="parts-low-stock-banner">
      <div className="parts-low-stock-banner-header">
        <span className="parts-low-stock-icon">⚠️</span>
        <strong>{parts.length} part{parts.length > 1 ? 's' : ''} at or below low-stock threshold</strong>
        <button className="parts-banner-dismiss" onClick={onDismiss} aria-label="Dismiss">✕</button>
      </div>
      <ul className="parts-low-stock-list">
        {parts.map((p) => (
          <li key={p.id}>
            <span className="parts-low-stock-name">{p.name}</span>
            <span className="parts-low-stock-qty">
              {p.quantity} / {p.lowStockThreshold} {p.unit}
            </span>
            <span className="parts-low-stock-cat">{p.category}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Part Form Modal (Create / Edit)
// ---------------------------------------------------------------------------

interface PartFormProps {
  part?: Part | null;
  vehicles: Vehicle[];
  onSave: (data: CreatePartDto | UpdatePartDto) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
  error: string | null;
}

const PartForm = ({ part, vehicles, onSave, onCancel, saving, error }: PartFormProps) => {
  const isEdit = !!part;

  const [form, setForm] = useState<CreatePartDto>({
    name:               part?.name ?? '',
    partNumber:         part?.partNumber ?? '',
    category:           part?.category ?? 'Other',
    quantity:           part?.quantity ?? 0,
    unit:               part?.unit ?? 'pcs',
    cost:               part?.cost ?? undefined,
    supplier:           part?.supplier ?? '',
    location:           part?.location ?? '',
    lowStockThreshold:  part?.lowStockThreshold ?? 2,
    notes:              part?.notes ?? '',
    vehicleId:          part?.vehicleId ?? '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? undefined : Number(value)) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreatePartDto = {
      ...form,
      partNumber:  form.partNumber  || undefined,
      supplier:    form.supplier    || undefined,
      location:    form.location    || undefined,
      notes:       form.notes       || undefined,
      vehicleId:   form.vehicleId   || undefined,
    };
    await onSave(payload);
  };

  return (
    <div className="parts-modal-overlay">
      <div className="parts-modal">
        <div className="parts-modal-header">
          <h2 className="parts-modal-title">{isEdit ? 'Edit Part' : 'Add New Part'}</h2>
          <button className="parts-modal-close" onClick={onCancel} disabled={saving}>✕</button>
        </div>

        {error && <div className="parts-form-error">{error}</div>}

        <form onSubmit={(e) => { void handleSubmit(e); }} className="parts-form">
          {/* Row 1: Name + Part Number */}
          <div className="parts-form-row parts-form-row--2">
            <div className="parts-form-field">
              <label className="parts-form-label">Name <span className="required">*</span></label>
              <input
                className="form-input"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="e.g., Front Brake Pads"
              />
            </div>
            <div className="parts-form-field">
              <label className="parts-form-label">Part Number</label>
              <input
                className="form-input"
                name="partNumber"
                value={form.partNumber ?? ''}
                onChange={handleChange}
                placeholder="e.g., BP-1234-F"
              />
            </div>
          </div>

          {/* Row 2: Category + Unit */}
          <div className="parts-form-row parts-form-row--2">
            <div className="parts-form-field">
              <label className="parts-form-label">Category <span className="required">*</span></label>
              <select className="form-input" name="category" value={form.category} onChange={handleChange} required>
                {PART_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="parts-form-field">
              <label className="parts-form-label">Unit</label>
              <select className="form-input" name="unit" value={form.unit ?? 'pcs'} onChange={handleChange}>
                {PART_UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Quantity + Low-Stock Threshold + Cost */}
          <div className="parts-form-row parts-form-row--3">
            <div className="parts-form-field">
              <label className="parts-form-label">Quantity</label>
              <input
                className="form-input"
                type="number"
                name="quantity"
                min={0}
                value={form.quantity ?? 0}
                onChange={handleChange}
              />
            </div>
            <div className="parts-form-field">
              <label className="parts-form-label">Low-Stock Alert At</label>
              <input
                className="form-input"
                type="number"
                name="lowStockThreshold"
                min={0}
                value={form.lowStockThreshold ?? 2}
                onChange={handleChange}
              />
            </div>
            <div className="parts-form-field">
              <label className="parts-form-label">Cost per Unit (USD)</label>
              <input
                className="form-input"
                type="number"
                name="cost"
                min={0}
                step="0.01"
                value={form.cost ?? ''}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Row 4: Supplier + Storage Location */}
          <div className="parts-form-row parts-form-row--2">
            <div className="parts-form-field">
              <label className="parts-form-label">Supplier</label>
              <input
                className="form-input"
                name="supplier"
                value={form.supplier ?? ''}
                onChange={handleChange}
                placeholder="e.g., Brembo, Pirelli"
              />
            </div>
            <div className="parts-form-field">
              <label className="parts-form-label">Storage Location</label>
              <input
                className="form-input"
                name="location"
                value={form.location ?? ''}
                onChange={handleChange}
                placeholder="e.g., Shelf A-3, Bin 12"
              />
            </div>
          </div>

          {/* Row 5: Vehicle (optional) */}
          <div className="parts-form-row parts-form-row--1">
            <div className="parts-form-field">
              <label className="parts-form-label">Assigned Vehicle (optional)</label>
              <select className="form-input" name="vehicleId" value={form.vehicleId ?? ''} onChange={handleChange}>
                <option value="">— All Vehicles / Unassigned —</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.year} {v.make} {v.model}{v.number ? ` #${v.number}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 6: Notes */}
          <div className="parts-form-row parts-form-row--1">
            <div className="parts-form-field">
              <label className="parts-form-label">Notes</label>
              <textarea
                className="form-input form-textarea"
                name="notes"
                value={form.notes ?? ''}
                onChange={handleChange}
                placeholder="Additional notes about this part…"
                rows={3}
              />
            </div>
          </div>

          <div className="parts-form-actions">
            <button type="button" className="btn-secondary" onClick={onCancel} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Part'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Adjust Quantity Modal
// ---------------------------------------------------------------------------

interface AdjustModalProps {
  part: Part;
  onAdjust: (adjustment: number) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
  error: string | null;
}

const AdjustModal = ({ part, onAdjust, onCancel, saving, error }: AdjustModalProps) => {
  const [delta, setDelta] = useState<number>(0);

  return (
    <div className="parts-modal-overlay">
      <div className="parts-modal parts-modal--sm">
        <div className="parts-modal-header">
          <h2 className="parts-modal-title">Adjust Quantity</h2>
          <button className="parts-modal-close" onClick={onCancel} disabled={saving}>✕</button>
        </div>
        <div className="parts-adjust-info">
          <strong>{part.name}</strong>
          <span className="parts-adjust-current">
            Current stock: <strong>{part.quantity} {part.unit}</strong>
          </span>
        </div>
        {error && <div className="parts-form-error">{error}</div>}
        <div className="parts-adjust-controls">
          <button
            className="parts-adjust-btn parts-adjust-btn--minus"
            onClick={() => setDelta((d) => d - 1)}
            disabled={saving || part.quantity + delta <= 0}
          >−</button>
          <input
            type="number"
            className="parts-adjust-input"
            value={delta}
            onChange={(e) => setDelta(Number(e.target.value))}
          />
          <button
            className="parts-adjust-btn parts-adjust-btn--plus"
            onClick={() => setDelta((d) => d + 1)}
            disabled={saving}
          >+</button>
        </div>
        <div className="parts-adjust-preview">
          New quantity: <strong>{Math.max(0, part.quantity + delta)} {part.unit}</strong>
        </div>
        <div className="parts-form-actions">
          <button className="btn-secondary" onClick={onCancel} disabled={saving}>Cancel</button>
          <button
            className="btn-primary"
            disabled={saving || delta === 0}
            onClick={() => { void onAdjust(delta); }}
          >
            {saving ? 'Saving…' : `Apply (${delta > 0 ? '+' : ''}${delta})`}
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main PartsPage
// ---------------------------------------------------------------------------

const PartsPage = () => {
  const [parts, setParts]                   = useState<Part[]>([]);
  const [summary, setSummary]               = useState<InventorySummary | null>(null);
  const [vehicles, setVehicles]             = useState<Vehicle[]>([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);

  // Filters
  const [search, setSearch]                 = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterVehicle, setFilterVehicle]   = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);

  // UI state
  const [showBanner, setShowBanner]         = useState(true);
  const [showForm, setShowForm]             = useState(false);
  const [editingPart, setEditingPart]       = useState<Part | null>(null);
  const [adjustingPart, setAdjustingPart]   = useState<Part | null>(null);
  const [formSaving, setFormSaving]         = useState(false);
  const [formError, setFormError]           = useState<string | null>(null);
  const [lowStockCount, setLowStockCount]   = useState(0);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [{ parts: p, lowStockCount: lsc }, sum, veh] = await Promise.all([
        partService.getAllParts({
          search:    search    || undefined,
          category:  filterCategory  || undefined,
          vehicleId: filterVehicle   || undefined,
          lowStock:  filterLowStock  || undefined,
        }),
        partService.getInventorySummary(),
        vehicleService.getAllVehicles(),
      ]);
      setParts(p);
      setLowStockCount(lsc);
      setSummary(sum);
      setVehicles(veh);
    } catch (err) {
      setError('Failed to load inventory. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, filterCategory, filterVehicle, filterLowStock]);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  // ── CRUD handlers ────────────────────────────────────────────────────────

  const handleSavePart = async (data: CreatePartDto | UpdatePartDto) => {
    setFormSaving(true);
    setFormError(null);
    try {
      if (editingPart) {
        await partService.updatePart(editingPart.id, data as UpdatePartDto);
      } else {
        await partService.createPart(data as CreatePartDto);
      }
      setShowForm(false);
      setEditingPart(null);
      void fetchAll();
    } catch (err) {
      setFormError('Failed to save part. Please check your input and try again.');
      console.error(err);
    } finally {
      setFormSaving(false);
    }
  };

  const handleDelete = async (part: Part) => {
    if (!window.confirm(`Delete "${part.name}"? This cannot be undone.`)) return;
    try {
      await partService.deletePart(part.id);
      void fetchAll();
    } catch (err) {
      setError('Failed to delete part.');
      console.error(err);
    }
  };

  const handleAdjust = async (adjustment: number) => {
    if (!adjustingPart) return;
    setFormSaving(true);
    setFormError(null);
    try {
      await partService.adjustQuantity(adjustingPart.id, { adjustment });
      setAdjustingPart(null);
      void fetchAll();
    } catch (err) {
      setFormError('Failed to adjust quantity.');
      console.error(err);
    } finally {
      setFormSaving(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="container">
      {/* Page Header */}
      <div className="header">
        <div>
          <h1>Parts &amp; Inventory</h1>
          {lowStockCount > 0 && (
            <span className="parts-header-alert">
              ⚠️ {lowStockCount} low-stock alert{lowStockCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <button className="btn-primary" onClick={() => { setEditingPart(null); setShowForm(true); }}>
          + Add Part
        </button>
      </div>

      {/* Summary Cards */}
      {summary && <SummaryCards summary={summary} />}

      {/* Low-Stock Banner */}
      {showBanner && summary && summary.lowStockParts.length > 0 && (
        <LowStockBanner parts={summary.lowStockParts} onDismiss={() => setShowBanner(false)} />
      )}

      {/* Filters */}
      <div className="parts-filters">
        <input
          className="parts-search-input"
          type="search"
          placeholder="Search by name, part #, supplier, location…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="parts-filter-select"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {PART_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          className="parts-filter-select"
          value={filterVehicle}
          onChange={(e) => setFilterVehicle(e.target.value)}
        >
          <option value="">All Vehicles</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.year} {v.make} {v.model}{v.number ? ` #${v.number}` : ''}
            </option>
          ))}
        </select>
        <label className="parts-filter-checkbox">
          <input
            type="checkbox"
            checked={filterLowStock}
            onChange={(e) => setFilterLowStock(e.target.checked)}
          />
          Low stock only
        </label>
        {(search || filterCategory || filterVehicle || filterLowStock) && (
          <button
            className="btn-secondary parts-filter-clear"
            onClick={() => { setSearch(''); setFilterCategory(''); setFilterVehicle(''); setFilterLowStock(false); }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Error */}
      {error && <div className="error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* Table */}
      {loading ? (
        <div className="loading">Loading inventory…</div>
      ) : parts.length === 0 ? (
        <div className="empty-state">
          <p>No parts found{search || filterCategory || filterVehicle || filterLowStock ? ' matching your filters' : ''}.</p>
          {!search && !filterCategory && !filterVehicle && !filterLowStock && (
            <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => { setEditingPart(null); setShowForm(true); }}>
              Add Your First Part
            </button>
          )}
        </div>
      ) : (
        <div className="parts-table-wrapper">
          <table className="parts-table">
            <thead>
              <tr>
                <th>Part Name</th>
                <th>Category</th>
                <th>Part #</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Cost/Unit</th>
                <th>Supplier</th>
                <th>Location</th>
                <th>Vehicle</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {parts.map((part) => (
                <tr key={part.id} className={part.isLowStock ? 'parts-row--low-stock' : ''}>
                  <td className="parts-cell-name">
                    <span className="parts-name">{part.name}</span>
                    {part.notes && (
                      <span className="parts-notes-hint" title={part.notes}>📝</span>
                    )}
                  </td>
                  <td>
                    <span
                      className="parts-category-badge"
                      style={{ borderColor: CATEGORY_COLORS[part.category] ?? '#999', color: CATEGORY_COLORS[part.category] ?? '#999' }}
                    >
                      {part.category}
                    </span>
                  </td>
                  <td className="parts-cell-mono">{part.partNumber ?? '—'}</td>
                  <td className={`parts-cell-qty ${part.isLowStock ? 'parts-cell-qty--low' : ''}`}>
                    {part.quantity}
                  </td>
                  <td>{part.unit}</td>
                  <td>{formatCurrency(part.cost)}</td>
                  <td>{part.supplier ?? '—'}</td>
                  <td className="parts-cell-mono">{part.location ?? '—'}</td>
                  <td>
                    {part.vehicle
                      ? `${part.vehicle.year} ${part.vehicle.make} ${part.vehicle.model}${part.vehicle.number ? ` #${part.vehicle.number}` : ''}`
                      : <span className="parts-cell-dim">—</span>}
                  </td>
                  <td>
                    {part.isLowStock ? (
                      <span className="parts-status-badge parts-status-badge--low">⚠️ Low</span>
                    ) : (
                      <span className="parts-status-badge parts-status-badge--ok">✓ OK</span>
                    )}
                  </td>
                  <td>
                    <div className="parts-row-actions">
                      <button
                        className="btn-ghost btn-sm"
                        onClick={() => setAdjustingPart(part)}
                        title="Adjust quantity"
                      >
                        ±
                      </button>
                      <button
                        className="btn-ghost btn-sm"
                        onClick={() => { setEditingPart(part); setShowForm(true); }}
                        title="Edit part"
                      >
                        Edit
                      </button>
                      <button
                        className="btn-danger btn-sm"
                        onClick={() => { void handleDelete(part); }}
                        title="Delete part"
                      >
                        Del
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="parts-table-footer">
            Showing {parts.length} part{parts.length !== 1 ? 's' : ''}
            {lowStockCount > 0 && ` · ${lowStockCount} low-stock`}
          </div>
        </div>
      )}

      {/* Part Form Modal */}
      {showForm && (
        <PartForm
          part={editingPart}
          vehicles={vehicles}
          onSave={handleSavePart}
          onCancel={() => { setShowForm(false); setEditingPart(null); setFormError(null); }}
          saving={formSaving}
          error={formError}
        />
      )}

      {/* Adjust Quantity Modal */}
      {adjustingPart && (
        <AdjustModal
          part={adjustingPart}
          onAdjust={handleAdjust}
          onCancel={() => { setAdjustingPart(null); setFormError(null); }}
          saving={formSaving}
          error={formError}
        />
      )}
    </div>
  );
};

export default PartsPage;
