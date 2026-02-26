import { Request, Response } from 'express';
import prisma from '../prisma';
import {
  WMO_WEATHER_CODES,
  type HourlyWeatherData,
  type DailyWeatherData,
  type EventWeatherResponse,
} from '../types/weather.types';

// ---------------------------------------------------------------------------
// Geocoding helper — converts a location string to lat/lon via Open-Meteo
// geocoding API (no API key required).
// ---------------------------------------------------------------------------

interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

interface GeocodingApiResponse {
  results?: GeocodingResult[];
}

async function geocodeLocation(location: string): Promise<{ latitude: number; longitude: number } | null> {
  const encoded = encodeURIComponent(location);
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encoded}&count=1&language=en&format=json`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Geocoding API error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as GeocodingApiResponse;

  if (!data.results || data.results.length === 0) {
    return null;
  }

  const result = data.results[0];
  return { latitude: result.latitude, longitude: result.longitude };
}

// ---------------------------------------------------------------------------
// Open-Meteo forecast helper
// ---------------------------------------------------------------------------

interface OpenMeteoCurrentUnits {
  temperature_2m: string;
  wind_speed_10m: string;
  precipitation: string;
  visibility: string;
}

interface OpenMeteoCurrent {
  time: string;
  temperature_2m: number;
  apparent_temperature: number;
  precipitation: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  wind_gusts_10m: number;
  cloud_cover: number;
  relative_humidity_2m: number;
  visibility: number;
  weather_code: number;
}

interface OpenMeteoHourly {
  time: string[];
  temperature_2m: number[];
  apparent_temperature: number[];
  precipitation_probability: number[];
  precipitation: number[];
  wind_speed_10m: number[];
  wind_direction_10m: number[];
  wind_gusts_10m: number[];
  weather_code: number[];
  cloud_cover: number[];
  relative_humidity_2m: number[];
  visibility: number[];
}

interface OpenMeteoDaily {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
  precipitation_probability_max: number[];
  wind_speed_10m_max: number[];
  wind_gusts_10m_max: number[];
  wind_direction_10m_dominant: number[];
  weather_code: number[];
  sunrise: string[];
  sunset: string[];
}

interface OpenMeteoResponse {
  current_units: OpenMeteoCurrentUnits;
  current: OpenMeteoCurrent;
  hourly: OpenMeteoHourly;
  daily: OpenMeteoDaily;
}

async function fetchWeatherForecast(
  latitude: number,
  longitude: number,
  startDate: string,
  endDate: string
): Promise<OpenMeteoResponse> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: [
      'temperature_2m',
      'apparent_temperature',
      'precipitation',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
      'cloud_cover',
      'relative_humidity_2m',
      'visibility',
      'weather_code',
    ].join(','),
    hourly: [
      'temperature_2m',
      'apparent_temperature',
      'precipitation_probability',
      'precipitation',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
      'weather_code',
      'cloud_cover',
      'relative_humidity_2m',
      'visibility',
    ].join(','),
    daily: [
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_sum',
      'precipitation_probability_max',
      'wind_speed_10m_max',
      'wind_gusts_10m_max',
      'wind_direction_10m_dominant',
      'weather_code',
      'sunrise',
      'sunset',
    ].join(','),
    temperature_unit: 'fahrenheit',
    wind_speed_unit: 'mph',
    precipitation_unit: 'inch',
    timezone: 'auto',
    start_date: startDate,
    end_date: endDate,
    forecast_days: '16',
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Open-Meteo API error: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as OpenMeteoResponse;
}

// ---------------------------------------------------------------------------
// Controller
// ---------------------------------------------------------------------------

/**
 * GET /api/events/:id/weather
 *
 * Fetches weather forecast for an event based on its venue location and date range.
 * Uses Open-Meteo (free, no API key required) for both geocoding and forecast data.
 */
export const getEventWeather = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    // 1. Fetch the event from the database
    const event = await prisma.event.findUnique({ where: { id } });

    if (!event) {
      res.status(404).json({
        success: false,
        error: 'Event not found',
      });
      return;
    }

    // 2. Geocode the event location (prefer venue + location for accuracy)
    const searchQuery = `${event.venue}, ${event.location}`;
    let coordinates = await geocodeLocation(searchQuery);

    // Fallback: try just the location string if venue+location fails
    if (!coordinates) {
      coordinates = await geocodeLocation(event.location);
    }

    if (!coordinates) {
      res.status(422).json({
        success: false,
        error: `Unable to geocode location: "${event.location}". Please ensure the event location is a recognisable city or region.`,
      });
      return;
    }

    // 3. Determine date range for the forecast
    // Open-Meteo supports up to 16 days ahead; for past events we still return
    // available data (the API gracefully handles historical requests within limits).
    const startDate = event.startDate.toISOString().split('T')[0]!;
    const endDate = event.endDate.toISOString().split('T')[0]!;

    // 4. Fetch forecast from Open-Meteo
    const forecast = await fetchWeatherForecast(
      coordinates.latitude,
      coordinates.longitude,
      startDate,
      endDate
    );

    // 5. Resolve current weather condition label
    const currentCode = forecast.current.weather_code;
    const currentCondition = WMO_WEATHER_CODES[currentCode] ?? {
      condition: 'Unknown',
      description: 'Unknown conditions',
      icon: '❓',
    };

    // 6. Build hourly array (aligned by index)
    const hourly: HourlyWeatherData[] = forecast.hourly.time.map((time, i) => ({
      time,
      temperature_2m:             forecast.hourly.temperature_2m[i] ?? 0,
      apparent_temperature:       forecast.hourly.apparent_temperature[i] ?? 0,
      precipitation_probability:  forecast.hourly.precipitation_probability[i] ?? 0,
      precipitation:              forecast.hourly.precipitation[i] ?? 0,
      wind_speed_10m:             forecast.hourly.wind_speed_10m[i] ?? 0,
      wind_direction_10m:         forecast.hourly.wind_direction_10m[i] ?? 0,
      wind_gusts_10m:             forecast.hourly.wind_gusts_10m[i] ?? 0,
      weather_code:               forecast.hourly.weather_code[i] ?? 0,
      cloud_cover:                forecast.hourly.cloud_cover[i] ?? 0,
      relative_humidity_2m:       forecast.hourly.relative_humidity_2m[i] ?? 0,
      visibility:                 forecast.hourly.visibility[i] ?? 0,
    }));

    // 7. Build daily array
    const daily: DailyWeatherData[] = forecast.daily.time.map((date, i) => {
      const code = forecast.daily.weather_code[i] ?? 0;
      return {
        date,
        temperature_max:                  forecast.daily.temperature_2m_max[i] ?? 0,
        temperature_min:                  forecast.daily.temperature_2m_min[i] ?? 0,
        precipitation_sum:                forecast.daily.precipitation_sum[i] ?? 0,
        precipitation_probability_max:    forecast.daily.precipitation_probability_max[i] ?? 0,
        wind_speed_max:                   forecast.daily.wind_speed_10m_max[i] ?? 0,
        wind_gusts_max:                   forecast.daily.wind_gusts_10m_max[i] ?? 0,
        wind_direction_dominant:          forecast.daily.wind_direction_10m_dominant[i] ?? 0,
        weather_code:                     code,
        sunrise:                          forecast.daily.sunrise[i] ?? '',
        sunset:                           forecast.daily.sunset[i] ?? '',
      };
    });

    // 8. Compose the response payload
    const payload: EventWeatherResponse = {
      eventId:   event.id,
      eventName: event.name,
      venue:     event.venue,
      location:  event.location,
      startDate: event.startDate.toISOString(),
      endDate:   event.endDate.toISOString(),
      coordinates,
      current: {
        temperature:          forecast.current.temperature_2m,
        apparent_temperature: forecast.current.apparent_temperature,
        wind_speed:           forecast.current.wind_speed_10m,
        wind_direction:       forecast.current.wind_direction_10m,
        wind_gusts:           forecast.current.wind_gusts_10m,
        precipitation:        forecast.current.precipitation,
        cloud_cover:          forecast.current.cloud_cover,
        relative_humidity:    forecast.current.relative_humidity_2m,
        visibility:           forecast.current.visibility,
        weather_code:         currentCode,
        condition:            currentCondition.condition,
        description:          currentCondition.description,
        icon:                 currentCondition.icon,
      },
      daily,
      hourly,
      units: {
        temperature:  '°F',
        wind_speed:   'mph',
        precipitation: 'in',
        visibility:   'm',
      },
      fetched_at: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: payload,
    });
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch weather data. Please try again later.',
    });
  }
};
