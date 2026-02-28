import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../services/eventService';
import type { Event } from '../types/event';
import { SkeletonTable } from '../components/Skeleton';

const STATUS_CLASS_MAP: Record<string, string> = {
  Upcoming: 'status-upcoming',
  'In Progress': 'status-in-progress',
  Completed: 'status-completed',
  Cancelled: 'status-cancelled',
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const EventListPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventService.getAllEvents();
      setEvents(data);
    } catch (err) {
      setError('Failed to fetch events. Please try again later.');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }
    try {
      await eventService.deleteEvent(id);
      setEvents(events.filter((event) => event.id !== id));
    } catch (err) {
      setError('Failed to delete event. Please try again.');
      console.error('Error deleting event:', err);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="header">
          <h1>Events</h1>
        </div>
        <SkeletonTable rows={5} cols={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">{error}</div>
        <button onClick={fetchEvents} className="btn-retry">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Events</h1>
        <Link to="/events/new" className="btn-primary">
          Add New Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="empty-state">
          <p>No events found. Add your first event to get started.</p>
        </div>
      ) : (
        <div className="event-list">
          {events.map((event) => (
            <div key={event.id} className="event-card">
              <div className="event-card-header">
                <div className="event-card-title">
                  <h3>{event.name}</h3>
                  <span className="event-type-badge">{event.type}</span>
                </div>
                <span className={`event-status-badge ${STATUS_CLASS_MAP[event.status] ?? ''}`}>
                  {event.status}
                </span>
              </div>

              <div className="event-card-body">
                <div className="event-meta">
                  <div className="event-meta-item">
                    <span className="event-meta-label">Venue</span>
                    <span className="event-meta-value">{event.venue}</span>
                  </div>
                  <div className="event-meta-item">
                    <span className="event-meta-label">Location</span>
                    <span className="event-meta-value">{event.location}</span>
                  </div>
                  <div className="event-meta-item">
                    <span className="event-meta-label">Dates</span>
                    <span className="event-meta-value">
                      {formatDate(event.startDate)} – {formatDate(event.endDate)}
                    </span>
                  </div>
                </div>

                {event.description && (
                  <p className="event-description">{event.description}</p>
                )}
              </div>

              <div className="event-card-footer">
                <Link to={`/events/${event.id}`} className="btn-secondary">
                  View Details
                </Link>
                <Link to={`/events/${event.id}/edit`} className="btn-secondary">
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(event.id)}
                  className="btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventListPage;
