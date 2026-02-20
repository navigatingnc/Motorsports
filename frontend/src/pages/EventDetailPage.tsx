import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { eventService } from '../services/eventService';
import type { Event } from '../types/event';

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

  useEffect(() => {
    if (id) {
      fetchEvent(id);
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

  const handleDelete = async () => {
    if (!event) return;
    if (!window.confirm(`Are you sure you want to delete "${event.name}"? This action cannot be undone.`)) {
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
        <Link to="/events" className="btn-secondary" style={{ marginTop: '1rem', display: 'inline-block' }}>
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
    </div>
  );
};

export default EventDetailPage;
