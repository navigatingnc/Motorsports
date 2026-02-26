import api from './api';
import type { EventWeather } from '../types/weather';

interface WeatherApiResponse {
  success: boolean;
  data: EventWeather;
}

export const weatherService = {
  /**
   * Fetch weather forecast for a specific event.
   * Calls GET /api/events/:id/weather
   */
  getEventWeather: async (eventId: string): Promise<EventWeather> => {
    const response = await api.get<WeatherApiResponse>(`/api/events/${eventId}/weather`);
    return response.data.data;
  },
};
