import { useEffect, useState, useCallback } from 'react';
import '../setup.css';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { eventService } from '../services/eventService';
import { vehicleService } from '../services/vehicleService';
import { setupService } from '../services/setupService';
import type { Event } from '../types/event';
import type { Vehicle } from '../types/vehicle';
import type { SetupSheet } from '../types/setup';
import SetupSheetForm from '../components/SetupSheetForm';
import SetupSheetCard from '../components/SetupSheetCard';

const STATUS_CLASS_MAP: Record<string, string> = {
  Upcoming: 'status-upcoming',
  'In Progress': 'status-in-progress',
  Completed: 'status-completed',
  Cancelled: 'status-cancelled',
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatDateTime = (dateStr: string): string => {
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Setup sheet state
  const [setups, setSetups] = useState<SetupSheet[]>([]);
  const [setupsLoading, setSetupsLoading] = useState<boolean>(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showSetupForm, setShowSetupForm] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      void fetchEvent(id);
      void fetchSetups(id);
      void fetchVehicles();
    }
  }, [id]);

  const fetchEvent = async (eventId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventService.getEventById(eventId);
      setEvent(data);
    } catch (err) {
      setError('Failed to fetch event details. The event may not exist.');
      console.error('Error fetching event:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSetups = useCallback(async (eventId: string) => {
    try {
      setSetupsLoading(true);
      const data = await setupService.getAllSetups({ eventId });
      setSetups(data);
    } catch (err) {
      console.error('Error fetching setup sheets:', err);
    } finally {
      setSetupsLoading(false);
    }
  }, []);

  const fetchVehicles = async () => {
    try {
      const data = await vehicleService.getAllVehicles();
      setVehicles(data);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    if (
      !window.confirm(
        `Are you sure you want to delete "${event.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }
    try {
      await eventService.deleteEvent(event.id);
      navigate('/events');
    } catch (err) {
      setError('Failed to delete event. Please try again.');
      console.error('Error deleting event:', err);
    }
  };

  const handleSetupFormSuccess = () => {
    setShowSetupForm(false);
    if (id) void fetchSetups(id);
  };

  const vehicleOptions = vehicles.map((v) => ({
    id: v.id,
    label: `${v.year} ${v.make} ${v.model}${v.number ? ` #${v.number}` : ''}`,
  }));

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading event details...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container">
        <div className="error">{error ?? 'Event not found.'}</div>
        <Link
          to="/events"
          className="btn-secondary"
          style={{ marginTop: '1rem', display: 'inline-block' }}
        >
          Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Page Header */}
      <div className="detail-page-header">
        <div className="detail-page-title">
          <Link to="/events" className="breadcrumb-link">
            ← Events
          </Link>
          <h1>{event.name}</h1>
          <div className="detail-badges">
            <span className="event-type-badge">{event.type}</span>
            <span className={`event-status-badge ${STATUS_CLASS_MAP[event.status] ?? ''}`}>
              {event.status}
            </span>
          </div>
        </div>
        <div className="detail-page-actions">
          <Link to={`/events/${event.id}/edit`} className="btn-secondary">
            Edit Event
          </Link>
          <button onClick={handleDelete} className="btn-danger">
            Delete Event
          </button>
        </div>
      </div>

      {/* Event Info Grid */}
      <div className="detail-grid">
        {/* Core Details Card */}
        <div className="detail-card">
          <h2 className="detail-card-title">Event Details</h2>
          <div className="detail-field-list">
            <div className="detail-field">
              <span className="detail-field-label">Venue</span>
              <span className="detail-field-value">{event.venue}</span>
            </div>
            <div className="detail-field">
              <span className="detail-field-label">Location</span>
              <span className="detail-field-value">{event.location}</span>
            </div>
            <div className="detail-field">
              <span className="detail-field-label">Start Date</span>
              <span className="detail-field-value">{formatDate(event.startDate)}</span>
            </div>
            <div className="detail-field">
              <span className="detail-field-label">End Date</span>
              <span className="detail-field-value">{formatDate(event.endDate)}</span>
            </div>
            <div className="detail-field">
              <span className="detail-field-label">Type</span>
              <span className="detail-field-value">{event.type}</span>
            </div>
            <div className="detail-field">
              <span className="detail-field-label">Status</span>
              <span className={`event-status-badge ${STATUS_CLASS_MAP[event.status] ?? ''}`}>
                {event.status}
              </span>
            </div>
          </div>
        </div>

        {/* Description & Notes Card */}
        <div className="detail-card">
          <h2 className="detail-card-title">Additional Information</h2>
          <div className="detail-field-list">
            {event.description ? (
              <div className="detail-field detail-field--full">
                <span className="detail-field-label">Description</span>
                <p className="detail-field-text">{event.description}</p>
              </div>
            ) : (
              <p className="detail-empty-text">No description provided.</p>
            )}
            {event.notes && (
              <div className="detail-field detail-field--full">
                <span className="detail-field-label">Notes</span>
                <p className="detail-field-text">{event.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Record Metadata Card */}
        <div className="detail-card detail-card--meta">
          <h2 className="detail-card-title">Record Information</h2>
          <div className="detail-field-list">
            <div className="detail-field">
              <span className="detail-field-label">Event ID</span>
              <span className="detail-field-value detail-field-value--mono">{event.id}</span>
            </div>
            <div className="detail-field">
              <span className="detail-field-label">Created</span>
              <span className="detail-field-value">{formatDateTime(event.createdAt)}</span>
            </div>
            <div className="detail-field">
              <span className="detail-field-label">Last Updated</span>
              <span className="detail-field-value">{formatDateTime(event.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Setup Sheets Section ──────────────────────────────────── */}
      <section className="setup-sheets-section">
        <div className="setup-sheets-header">
          <h2 className="setup-sheets-title">
            Setup Sheets
            <span className="setup-sheets-count">{setups.length}</span>
          </h2>
          <button className="btn-primary" onClick={() => setShowSetupForm(true)}>
            + New Setup Sheet
          </button>
        </div>

        {setupsLoading ? (
          <div className="loading">Loading setup sheets...</div>
        ) : setups.length === 0 ? (
          <div className="setup-sheets-empty">
            <p>No setup sheets recorded for this event yet.</p>
            <button
              className="btn-primary"
              style={{ marginTop: '0.75rem' }}
              onClick={() => setShowSetupForm(true)}
            >
              Create First Setup Sheet
            </button>
          </div>
        ) : (
          <div className="setup-sheets-list">
            {setups.map((setup) => (
              <SetupSheetCard
                key={setup.id}
                setup={setup}
                onDeleted={() => {
                  if (id) void fetchSetups(id);
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* Setup Sheet Form Modal */}
      {showSetupForm && (
        <SetupSheetForm
          eventId={event.id}
          vehicleOptions={vehicleOptions}
          onSuccess={handleSetupFormSuccess}
          onCancel={() => setShowSetupForm(false)}
        />
      )}
    </div>
  );
};

export default EventDetailPage;
