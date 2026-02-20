import api from './api';
import type { Event, CreateEventDto } from '../types/event';

export const eventService = {
  // Get all events
  getAllEvents: async (): Promise<Event[]> => {
    const response = await api.get<Event[]>('/api/events');
    return response.data;
  },

  // Get event by ID
  getEventById: async (id: string): Promise<Event> => {
    const response = await api.get<Event>(`/api/events/${id}`);
    return response.data;
  },

  // Create new event
  createEvent: async (data: CreateEventDto): Promise<Event> => {
    const response = await api.post<Event>('/api/events', data);
    return response.data;
  },

  // Update event
  updateEvent: async (id: string, data: Partial<CreateEventDto>): Promise<Event> => {
    const response = await api.put<Event>(`/api/events/${id}`, data);
    return response.data;
  },

  // Delete event
  deleteEvent: async (id: string): Promise<void> => {
    await api.delete(`/api/events/${id}`);
  },
};
