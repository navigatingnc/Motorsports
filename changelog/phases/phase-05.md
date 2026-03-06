# Phase 5: Frontend: Event List & Detail View

**Date:** February 20, 2026  
**Status:** ✅ Completed

---

### Summary
Implemented the full frontend event browsing experience. Created TypeScript type definitions for the `Event` entity, an `eventService` for communicating with the `/api/events` backend endpoints, an `EventListPage` that displays all events as styled cards with status badges, and an `EventDetailPage` that renders a complete structured view of a single event. Updated `App.tsx` to register all event routes and added a responsive navbar with active-link highlighting. Extended `App.css` with all required event and detail-page styles, and fixed `tsconfig.json` to include JSX support.

### Work Performed

1. **Type Definitions** — `frontend/src/types/event.ts`
   - Defined `Event` interface mirroring the Prisma `Event` model (id, name, type, venue, location, startDate, endDate, status, description, notes, createdAt, updatedAt)
   - Defined `CreateEventDto` interface for POST/PUT payloads
   - Exported `EventType` and `EventStatus` union types for type-safe usage

2. **Event Service** — `frontend/src/services/eventService.ts`
   - `getAllEvents()` — GET `/api/events`
   - `getEventById(id)` — GET `/api/events/:id`
   - `createEvent(data)` — POST `/api/events`
   - `updateEvent(id, data)` — PUT `/api/events/:id`
   - `deleteEvent(id)` — DELETE `/api/events/:id`

3. **EventListPage** — `frontend/src/pages/EventListPage.tsx`
   - Fetches all events on mount with loading and error states
   - Renders each event as a card showing name, type badge, status badge, venue, location, date range, and description
   - Delete action with confirmation dialog and optimistic UI update
   - Links to detail and edit pages; "Add New Event" button

4. **EventDetailPage** — `frontend/src/pages/EventDetailPage.tsx`
   - Fetches a single event by URL param `id`
   - Breadcrumb navigation back to the event list
   - Structured detail grid: Event Details card, Additional Information card, Record Information card
   - Displays all fields including formatted dates, status/type badges, notes, and record metadata
   - Delete action with confirmation that redirects to `/events` on success

5. **App.tsx Routing Update**
   - Added `NavLink`-based navbar with active-state highlighting for Vehicles and Events
   - Registered `/events` → `EventListPage` and `/events/:id` → `EventDetailPage`
   - Added placeholder routes for `/events/new` and `/events/:id/edit`

6. **App.css Style Additions**
   - Navbar flex layout (`.navbar-container--flex`, `.navbar-nav`, `.nav-link`, `.nav-link--active`)
   - Event list and card styles (`.event-list`, `.event-card`, `.event-card-header`, `.event-card-body`, `.event-card-footer`)
   - Event type and status badge styles (`.event-type-badge`, `.event-status-badge`, `.status-upcoming`, `.status-in-progress`, `.status-completed`, `.status-cancelled`)
   - Event meta display (`.event-meta`, `.event-meta-item`, `.event-meta-label`, `.event-meta-value`)
   - Detail page layout (`.detail-page-header`, `.detail-grid`, `.detail-card`, `.detail-field-list`, `.detail-field`, `.breadcrumb-link`)
   - Full responsive breakpoints for all new components

7. **tsconfig.json Fix**
   - Added `"jsx": "react-jsx"` to enable JSX compilation in TypeScript

8. **verbatimModuleSyntax Fixes**
   - Updated `VehicleListPage.tsx` and `vehicleService.ts` to use `import type` for type-only imports

### Code Generated

#### `frontend/src/types/event.ts`
```typescript
export interface Event {
  id: string;
  name: string;
  type: string;
  venue: string;
  location: string;
  startDate: string;
  endDate: string;
  status: string;
  description?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventDto {
  name: string;
  type: string;
  venue: string;
  location: string;
  startDate: string;
  endDate: string;
  status?: string;
  description?: string;
  notes?: string;
}

export type EventType = 'Race' | 'Qualifying' | 'Practice' | 'Test Day' | 'Track Day' | 'Other';
export type EventStatus = 'Upcoming' | 'In Progress' | 'Completed' | 'Cancelled';
```

#### `frontend/src/services/eventService.ts`
```typescript
import api from './api';
import type { Event, CreateEventDto } from '../types/event';

export const eventService = {
  getAllEvents: async (): Promise<Event[]> => {
    const response = await api.get<Event[]>('/api/events');
    return response.data;
  },
  getEventById: async (id: string): Promise<Event> => {
    const response = await api.get<Event>(`/api/events/${id}`);
    return response.data;
  },
  createEvent: async (data: CreateEventDto): Promise<Event> => {
    const response = await api.post<Event>('/api/events', data);
    return response.data;
  },
  updateEvent: async (id: string, data: Partial<CreateEventDto>): Promise<Event> => {
    const response = await api.put<Event>(`/api/events/${id}`, data);
    return response.data;
  },
  deleteEvent: async (id: string): Promise<void> => {
    await api.delete(`/api/events/${id}`);
  },
};
```

#### `frontend/src/pages/EventListPage.tsx`
```typescript
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const EventListPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventService.getAllEvents();
      setEvents(data);
    } catch (err) {
      setError('Failed to fetch events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await eventService.deleteEvent(id);
      setEvents(events.filter((event) => event.id !== id));
    } catch (err) {
      setError('Failed to delete event. Please try again.');
    }
  };

  if (loading) return <div className="container"><div className="loading">Loading events...</div></div>;
  if (error) return <div className="container"><div className="error">{error}</div><button onClick={fetchEvents} className="btn-retry">Retry</button></div>;

  return (
    <div className="container">
      <div className="header">
        <h1>Events</h1>
        <Link to="/events/new" className="btn-primary">Add New Event</Link>
      </div>
      {events.length === 0 ? (
        <div className="empty-state"><p>No events found. Add your first event to get started.</p></div>
      ) : (
        <div className="event-list">
          {events.map((event) => (
            <div key={event.id} className="event-card">
              <div className="event-card-header">
                <div className="event-card-title">
                  <h3>{event.name}</h3>
                  <span className="event-type-badge">{event.type}</span>
                </div>
                <span className={`event-status-badge ${STATUS_CLASS_MAP[event.status] ?? ''}`}>{event.status}</span>
              </div>
              <div className="event-card-body">
                <div className="event-meta">
                  <div className="event-meta-item"><span className="event-meta-label">Venue</span><span className="event-meta-value">{event.venue}</span></div>
                  <div className="event-meta-item"><span className="event-meta-label">Location</span><span className="event-meta-value">{event.location}</span></div>
                  <div className="event-meta-item"><span className="event-meta-label">Dates</span><span className="event-meta-value">{formatDate(event.startDate)} – {formatDate(event.endDate)}</span></div>
                </div>
                {event.description && <p className="event-description">{event.description}</p>}
              </div>
              <div className="event-card-footer">
                <Link to={`/events/${event.id}`} className="btn-secondary">View Details</Link>
                <Link to={`/events/${event.id}/edit`} className="btn-secondary">Edit</Link>
                <button onClick={() => handleDelete(event.id)} className="btn-danger">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventListPage;
```

#### `frontend/src/pages/EventDetailPage.tsx`
```typescript
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

const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const formatDateTime = (dateStr: string): string =>
  new Date(dateStr).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (id) fetchEvent(id); }, [id]);

  const fetchEvent = async (eventId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventService.getEventById(eventId);
      setEvent(data);
    } catch (err) {
      setError('Failed to fetch event details. The event may not exist.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!event || !window.confirm(`Are you sure you want to delete "${event.name}"?`)) return;
    try {
      await eventService.deleteEvent(event.id);
      navigate('/events');
    } catch (err) {
      setError('Failed to delete event. Please try again.');
    }
  };

  if (loading) return <div className="container"><div className="loading">Loading event details...</div></div>;
  if (error || !event) return (
    <div className="container">
      <div className="error">{error ?? 'Event not found.'}</div>
      <Link to="/events" className="btn-secondary" style={{ marginTop: '1rem', display: 'inline-block' }}>Back to Events</Link>
    </div>
  );

  return (
    <div className="container">
      <div className="detail-page-header">
        <div className="detail-page-title">
          <Link to="/events" className="breadcrumb-link">← Events</Link>
          <h1>{event.name}</h1>
          <div className="detail-badges">
            <span className="event-type-badge">{event.type}</span>
            <span className={`event-status-badge ${STATUS_CLASS_MAP[event.status] ?? ''}`}>{event.status}</span>
          </div>
        </div>
        <div className="detail-page-actions">
          <Link to={`/events/${event.id}/edit`} className="btn-secondary">Edit Event</Link>
          <button onClick={handleDelete} className="btn-danger">Delete Event</button>
        </div>
      </div>
      <div className="detail-grid">
        <div className="detail-card">
          <h2 className="detail-card-title">Event Details</h2>
          <div className="detail-field-list">
            <div className="detail-field"><span className="detail-field-label">Venue</span><span className="detail-field-value">{event.venue}</span></div>
            <div className="detail-field"><span className="detail-field-label">Location</span><span className="detail-field-value">{event.location}</span></div>
            <div className="detail-field"><span className="detail-field-label">Start Date</span><span className="detail-field-value">{formatDate(event.startDate)}</span></div>
            <div className="detail-field"><span className="detail-field-label">End Date</span><span className="detail-field-value">{formatDate(event.endDate)}</span></div>
            <div className="detail-field"><span className="detail-field-label">Type</span><span className="detail-field-value">{event.type}</span></div>
            <div className="detail-field"><span className="detail-field-label">Status</span><span className={`event-status-badge ${STATUS_CLASS_MAP[event.status] ?? ''}`}>{event.status}</span></div>
          </div>
        </div>
        <div className="detail-card">
          <h2 className="detail-card-title">Additional Information</h2>
          <div className="detail-field-list">
            {event.description
              ? <div className="detail-field detail-field--full"><span className="detail-field-label">Description</span><p className="detail-field-text">{event.description}</p></div>
              : <p className="detail-empty-text">No description provided.</p>}
            {event.notes && <div className="detail-field detail-field--full"><span className="detail-field-label">Notes</span><p className="detail-field-text">{event.notes}</p></div>}
          </div>
        </div>
        <div className="detail-card detail-card--meta">
          <h2 className="detail-card-title">Record Information</h2>
          <div className="detail-field-list">
            <div className="detail-field"><span className="detail-field-label">Event ID</span><span className="detail-field-value detail-field-value--mono">{event.id}</span></div>
            <div className="detail-field"><span className="detail-field-label">Created</span><span className="detail-field-value">{formatDateTime(event.createdAt)}</span></div>
            <div className="detail-field"><span className="detail-field-label">Last Updated</span><span className="detail-field-value">{formatDateTime(event.updatedAt)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
```

#### `frontend/src/App.tsx` (updated)
```typescript
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import VehicleListPage from './pages/VehicleListPage';
import EventListPage from './pages/EventListPage';
import EventDetailPage from './pages/EventDetailPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="navbar-container navbar-container--flex">
            <h1 className="navbar-brand">🏁 Motorsports Management</h1>
            <ul className="navbar-nav">
              <li>
                <NavLink to="/vehicles" className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}>
                  Vehicles
                </NavLink>
              </li>
              <li>
                <NavLink to="/events" className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}>
                  Events
                </NavLink>
              </li>
            </ul>
          </div>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/vehicles" replace />} />
            <Route path="/vehicles" element={<VehicleListPage />} />
            <Route path="/vehicles/:id" element={<div className="container"><p>Vehicle Detail (Coming Soon)</p></div>} />
            <Route path="/vehicles/:id/edit" element={<div className="container"><p>Edit Vehicle (Coming Soon)</p></div>} />
            <Route path="/vehicles/new" element={<div className="container"><p>New Vehicle (Coming Soon)</p></div>} />
            <Route path="/events" element={<EventListPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/events/new" element={<div className="container"><p>New Event (Coming Soon)</p></div>} />
            <Route path="/events/:id/edit" element={<div className="container"><p>Edit Event (Coming Soon)</p></div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
```


---
