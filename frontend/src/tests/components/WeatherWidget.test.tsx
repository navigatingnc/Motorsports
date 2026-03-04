/**
 * Component tests for WeatherWidget
 *
 * Verifies that:
 *  - A loading spinner is shown while fetching data.
 *  - Weather data is rendered correctly after a successful fetch.
 *  - An error message is displayed when the API call fails.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import WeatherWidget from '../../components/WeatherWidget';
import * as weatherServiceModule from '../../services/weatherService';
import type { EventWeather } from '../../types/weather';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const mockWeatherData: EventWeather = {
  eventId: 'evt-1',
  eventName: 'Spring Race',
  venue: 'Daytona International Speedway',
  location: 'Daytona Beach, FL',
  startDate: '2026-04-10',
  endDate: '2026-04-12',
  coordinates: { latitude: 29.185, longitude: -81.071 },
  current: {
    temperature: 24,
    apparent_temperature: 26,
    wind_speed: 15,
    wind_direction: 180,
    wind_gusts: 22,
    precipitation: 0,
    cloud_cover: 20,
    relative_humidity: 55,
    visibility: 10000,
    weather_code: 0,
    condition: 'Clear Sky',
    description: 'Clear and sunny',
    icon: '☀️',
  },
  daily: [
    {
      date: '2026-04-10',
      temperature_max: 28,
      temperature_min: 18,
      precipitation_sum: 0,
      precipitation_probability_max: 5,
      wind_speed_max: 20,
      wind_gusts_max: 30,
      wind_direction_dominant: 180,
      weather_code: 0,
      sunrise: '2026-04-10T06:30:00Z',
      sunset: '2026-04-10T19:45:00Z',
    },
  ],
  hourly: [],
  units: {
    temperature: '°C',
    wind_speed: 'km/h',
    precipitation: 'mm',
    visibility: 'm',
  },
  fetched_at: '2026-04-10T08:00:00Z',
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('WeatherWidget', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('shows a loading state initially', () => {
    vi.spyOn(weatherServiceModule.weatherService, 'getEventWeather').mockReturnValue(
      new Promise(() => {}) // never resolves — keeps loading state
    );
    render(<WeatherWidget eventId="evt-1" />);
    expect(screen.getByText(/loading weather forecast/i)).toBeInTheDocument();
  });

  it('renders weather data after a successful fetch', async () => {
    vi.spyOn(weatherServiceModule.weatherService, 'getEventWeather').mockResolvedValue(
      mockWeatherData
    );
    render(<WeatherWidget eventId="evt-1" />);

    // Wait for loading to finish and weather condition to appear
    await waitFor(() => {
      expect(screen.getByText('Clear Sky')).toBeInTheDocument();
    });

    // The venue and location are rendered as a combined text node inside a span
    // Use a function matcher to handle text split across child nodes
    expect(
      screen.getByText((_content, element) =>
        element?.tagName === 'SPAN' &&
        (element.textContent ?? '').includes('Daytona International Speedway')
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText((_content, element) =>
        element?.tagName === 'SPAN' &&
        (element.textContent ?? '').includes('Daytona Beach, FL')
      )
    ).toBeInTheDocument();
  });

  it('displays an error message when the fetch fails', async () => {
    vi.spyOn(weatherServiceModule.weatherService, 'getEventWeather').mockRejectedValue(
      new Error('Network error')
    );
    render(<WeatherWidget eventId="evt-1" />);

    await waitFor(() => {
      expect(
        screen.getByText(/unable to load weather data for this event/i)
      ).toBeInTheDocument();
    });
  });

  it('calls getEventWeather with the correct eventId', async () => {
    const spy = vi
      .spyOn(weatherServiceModule.weatherService, 'getEventWeather')
      .mockResolvedValue(mockWeatherData);
    render(<WeatherWidget eventId="evt-42" />);

    await waitFor(() => expect(spy).toHaveBeenCalledWith('evt-42'));
  });
});
