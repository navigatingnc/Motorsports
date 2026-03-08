import apiClient from './api.service';
import {
  RaceEvent,
  EventListResponse,
  EventDetailResponse,
  WeatherResponse,
  WeatherData,
  SetupSheet,
  SetupSheetListResponse,
} from '../types/event.types';

/**
 * Fetch all events from the backend.
 */
export const getEvents = async (): Promise<RaceEvent[]> => {
  const response = await apiClient.get<EventListResponse>('/events');
  return response.data.data;
};

/**
 * Fetch a single event by ID.
 */
export const getEvent = async (id: string): Promise<RaceEvent> => {
  const response = await apiClient.get<EventDetailResponse>(`/events/${id}`);
  return response.data.data;
};

/**
 * Fetch weather data for a specific event.
 */
export const getEventWeather = async (eventId: string): Promise<WeatherData | null> => {
  try {
    const response = await apiClient.get<WeatherResponse>(`/events/${eventId}/weather`);
    return response.data.data;
  } catch {
    return null;
  }
};

/**
 * Fetch setup sheets for a specific event.
 */
export const getEventSetups = async (eventId: string): Promise<SetupSheet[]> => {
  try {
    const response = await apiClient.get<SetupSheetListResponse>(`/setups?eventId=${eventId}`);
    return response.data.data;
  } catch {
    return [];
  }
};

/**
 * Determine if an event is upcoming (date >= today) or past.
 */
export const isUpcoming = (event: RaceEvent): boolean => {
  return new Date(event.date) >= new Date(new Date().toDateString());
};

/**
 * Map WMO weather code to a human-readable description and emoji.
 */
export const describeWeatherCode = (code: number): { label: string; emoji: string } => {
  if (code === 0) return { label: 'Clear Sky', emoji: '☀️' };
  if (code <= 3) return { label: 'Partly Cloudy', emoji: '⛅' };
  if (code <= 9) return { label: 'Foggy', emoji: '🌫️' };
  if (code <= 19) return { label: 'Drizzle', emoji: '🌦️' };
  if (code <= 29) return { label: 'Rain', emoji: '🌧️' };
  if (code <= 39) return { label: 'Snow', emoji: '❄️' };
  if (code <= 49) return { label: 'Freezing Fog', emoji: '🌁' };
  if (code <= 59) return { label: 'Drizzle', emoji: '🌦️' };
  if (code <= 69) return { label: 'Rain', emoji: '🌧️' };
  if (code <= 79) return { label: 'Snow', emoji: '❄️' };
  if (code <= 84) return { label: 'Rain Showers', emoji: '🌦️' };
  if (code <= 94) return { label: 'Thunderstorm', emoji: '⛈️' };
  return { label: 'Severe Storm', emoji: '🌩️' };
};
