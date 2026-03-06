# Phase 13: Backend + Frontend: Weather Integration for Events

**Date:** February 26, 2026  
**Status:** ✅ Completed

---

### Summary
Integrated real-time weather forecasting into the Event Detail page using the **Open-Meteo** free, open-source weather API (no API key required). The backend geocodes each event's venue and location, fetches a full forecast (current conditions, hourly, and daily), and exposes it via a new `GET /api/events/:id/weather` endpoint. The frontend renders a polished `WeatherWidget` component with a dynamic hero panel, per-day forecast cards with gradient backgrounds, and full responsive layout.

### Work Performed

1. **Backend: Weather Types (`backend/src/types/weather.types.ts`)**
   - Defined `HourlyWeatherData`, `DailyWeatherData`, `WeatherSummary`, and `EventWeatherResponse` interfaces
   - Added `WMO_WEATHER_CODES` lookup map covering all standard WMO weather interpretation codes (0–99) with human-readable condition labels and emoji icons

2. **Backend: Weather Controller (`backend/src/controllers/weather.controller.ts`)**
   - `geocodeLocation()` helper: calls Open-Meteo Geocoding API to resolve venue + location strings to latitude/longitude coordinates; falls back to location-only if the combined query returns no results
   - `fetchWeatherForecast()` helper: calls Open-Meteo Forecast API requesting current conditions, hourly data (12 variables), and daily data (10 variables) in US units (°F, mph, inches)
   - `getEventWeather` controller: fetches the event from Prisma, geocodes its location, fetches the forecast, assembles and returns a structured `EventWeatherResponse` payload; handles 404 (event not found), 422 (geocoding failure), and 500 (API errors)

3. **Backend: Weather Routes (`backend/src/routes/weather.routes.ts`)**
   - Nested router with `mergeParams: true` mounted at `GET /api/events/:id/weather`
   - Protected by `authenticate` middleware; accessible to all authenticated roles (admin, user, viewer)

4. **Backend: Route Registration (`backend/src/index.ts`)**
   - Imported and registered `weatherRoutes` at `/api/events/:id/weather`
   - Added `weather` to the API info endpoint's endpoints listing

5. **Frontend: Weather Types (`frontend/src/types/weather.ts`)**
   - Mirrored backend types for `EventWeather`, `HourlyWeatherData`, `DailyWeatherData`
   - Added `WEATHER_CODE_GRADIENT` map providing CSS gradient strings for each WMO weather code category, used for dynamic card backgrounds

6. **Frontend: Weather Service (`frontend/src/services/weatherService.ts`)**
   - `getEventWeather(eventId)`: calls `GET /api/events/:id/weather` via the shared Axios instance (JWT auth interceptor applied automatically)

7. **Frontend: WeatherWidget Component (`frontend/src/components/WeatherWidget.tsx`)**
   - **Hero panel**: large temperature display, condition label, feels-like temperature, and a 6-stat grid (wind speed/direction, gusts, humidity, cloud cover, precipitation, visibility)
   - **Location bar**: venue name, city/region, GPS coordinates, and last-updated timestamp
   - **Daily forecast grid**: one card per event day with gradient background, high/low temps, wind, precipitation probability, and sunrise/sunset times
   - **Loading state**: animated spinner
   - **Error state**: styled error banner with warning icon
   - **Attribution**: Open-Meteo credit link per their usage terms

8. **Frontend: Weather CSS (`frontend/src/weather.css`)**
   - Full responsive stylesheet with CSS custom property integration
   - Mobile-first breakpoints at 640px and 400px
   - Keyframe animation for loading spinner

9. **Frontend: EventDetailPage Integration (`frontend/src/pages/EventDetailPage.tsx`)**
   - Imported `WeatherWidget` component
   - Added "Weather Forecast" section between the event info grid and the Setup Sheets section

### API Endpoint

| Method | Path | Auth | Description |
|:---|:---|:---|:---|
| `GET` | `/api/events/:id/weather` | Bearer JWT (any role) | Returns current + hourly + daily weather forecast for the event's venue |

### Response Shape (abbreviated)

```json
{
  "success": true,
  "data": {
    "eventId": "...",
    "eventName": "Spring Endurance Race",
    "venue": "Road Atlanta",
    "location": "Braselton, GA",
    "coordinates": { "latitude": 34.15, "longitude": -83.81 },
    "current": {
      "temperature": 68.4,
      "condition": "Partly Cloudy",
      "icon": "⛅",
      "wind_speed": 12.3,
      "wind_direction": 225,
      "relative_humidity": 58
    },
    "daily": [ ... ],
    "hourly": [ ... ],
    "units": { "temperature": "°F", "wind_speed": "mph", "precipitation": "in", "visibility": "m" },
    "fetched_at": "2026-02-26T01:15:00.000Z"
  }
}
```

### Code Generated

#### `backend/src/types/weather.types.ts`
```typescript
/**
 * Weather data types for the Motorsports Management API.
 * Data is sourced from the Open-Meteo free forecast API.
 */

export interface HourlyWeatherData {
  time: string;
  temperature_2m: number;
  apparent_temperature: number;
  precipitation_probability: number;
  precipitation: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  wind_gusts_10m: number;
  weather_code: number;
  cloud_cover: number;
  relative_humidity_2m: number;
  visibility: number;
}

export interface DailyWeatherData {
  date: string;
  temperature_max: number;
  temperature_min: number;
  precipitation_sum: number;
  precipitation_probability_max: number;
  wind_speed_max: number;
  wind_gusts_max: number;
  wind_direction_dominant: number;
  weather_code: number;
  sunrise: string;
  sunset: string;
}

export interface WeatherSummary {
  condition: string;
  description: string;
  icon: string;
}

export interface EventWeatherResponse {
  eventId: string;
  eventName: string;
  venue: string;
  location: string;
  startDate: string;
  endDate: string;
  coordinates: { latitude: number; longitude: number; };
  current: {
    temperature: number; apparent_temperature: number;
    wind_speed: number; wind_direction: number; wind_gusts: number;
    precipitation: number; cloud_cover: number; relative_humidity: number;
    visibility: number; weather_code: number;
    condition: string; description: string; icon: string;
  };
  daily: DailyWeatherData[];
  hourly: HourlyWeatherData[];
  units: { temperature: string; wind_speed: string; precipitation: string; visibility: string; };
  fetched_at: string;
}

export const WMO_WEATHER_CODES: Record<number, WeatherSummary> = {
  0:  { condition: 'Clear Sky',            description: 'Clear sky',                     icon: '☀️'  },
  1:  { condition: 'Mainly Clear',         description: 'Mainly clear',                  icon: '🌤️'  },
  2:  { condition: 'Partly Cloudy',        description: 'Partly cloudy',                 icon: '⛅'  },
  3:  { condition: 'Overcast',             description: 'Overcast',                      icon: '☁️'  },
  45: { condition: 'Foggy',               description: 'Fog',                           icon: '🌫️'  },
  48: { condition: 'Icy Fog',             description: 'Depositing rime fog',           icon: '🌫️'  },
  51: { condition: 'Light Drizzle',       description: 'Light drizzle',                 icon: '🌦️'  },
  53: { condition: 'Drizzle',             description: 'Moderate drizzle',              icon: '🌦️'  },
  55: { condition: 'Heavy Drizzle',       description: 'Dense drizzle',                 icon: '🌧️'  },
  61: { condition: 'Light Rain',          description: 'Slight rain',                   icon: '🌧️'  },
  63: { condition: 'Rain',               description: 'Moderate rain',                 icon: '🌧️'  },
  65: { condition: 'Heavy Rain',          description: 'Heavy rain',                    icon: '🌧️'  },
  71: { condition: 'Light Snow',          description: 'Slight snowfall',               icon: '🌨️'  },
  73: { condition: 'Snow',               description: 'Moderate snowfall',             icon: '❄️'  },
  75: { condition: 'Heavy Snow',          description: 'Heavy snowfall',                icon: '❄️'  },
  77: { condition: 'Snow Grains',         description: 'Snow grains',                   icon: '🌨️'  },
  80: { condition: 'Light Showers',       description: 'Slight rain showers',           icon: '🌦️'  },
  81: { condition: 'Showers',            description: 'Moderate rain showers',         icon: '🌧️'  },
  82: { condition: 'Heavy Showers',       description: 'Violent rain showers',          icon: '⛈️'  },
  85: { condition: 'Snow Showers',        description: 'Slight snow showers',           icon: '🌨️'  },
  86: { condition: 'Heavy Snow Showers',  description: 'Heavy snow showers',            icon: '❄️'  },
  95: { condition: 'Thunderstorm',        description: 'Thunderstorm',                  icon: '⛈️'  },
  96: { condition: 'Thunderstorm + Hail', description: 'Thunderstorm with slight hail', icon: '⛈️'  },
  99: { condition: 'Thunderstorm + Hail', description: 'Thunderstorm with heavy hail',  icon: '⛈️'  },
};
```

#### `backend/src/controllers/weather.controller.ts`
```typescript
import { Request, Response } from 'express';
import prisma from '../prisma';
import { WMO_WEATHER_CODES, type HourlyWeatherData, type DailyWeatherData, type EventWeatherResponse } from '../types/weather.types';

async function geocodeLocation(location: string): Promise<{ latitude: number; longitude: number } | null> {
  const encoded = encodeURIComponent(location);
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encoded}&count=1&language=en&format=json`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Geocoding API error: ${response.status}`);
  const data = await response.json() as { results?: Array<{ latitude: number; longitude: number }> };
  if (!data.results || data.results.length === 0) return null;
  return { latitude: data.results[0].latitude, longitude: data.results[0].longitude };
}

async function fetchWeatherForecast(latitude: number, longitude: number, startDate: string, endDate: string) {
  const params = new URLSearchParams({
    latitude: latitude.toString(), longitude: longitude.toString(),
    current: 'temperature_2m,apparent_temperature,precipitation,wind_speed_10m,wind_direction_10m,wind_gusts_10m,cloud_cover,relative_humidity_2m,visibility,weather_code',
    hourly: 'temperature_2m,apparent_temperature,precipitation_probability,precipitation,wind_speed_10m,wind_direction_10m,wind_gusts_10m,weather_code,cloud_cover,relative_humidity_2m,visibility',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,weather_code,sunrise,sunset',
    temperature_unit: 'fahrenheit', wind_speed_unit: 'mph', precipitation_unit: 'inch',
    timezone: 'auto', start_date: startDate, end_date: endDate, forecast_days: '16',
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!response.ok) throw new Error(`Open-Meteo API error: ${response.status}`);
  return response.json();
}

export const getEventWeather = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) { res.status(404).json({ success: false, error: 'Event not found' }); return; }

    let coordinates = await geocodeLocation(`${event.venue}, ${event.location}`);
    if (!coordinates) coordinates = await geocodeLocation(event.location);
    if (!coordinates) { res.status(422).json({ success: false, error: `Unable to geocode location: "${event.location}"` }); return; }

    const startDate = event.startDate.toISOString().split('T')[0]!;
    const endDate = event.endDate.toISOString().split('T')[0]!;
    const forecast = await fetchWeatherForecast(coordinates.latitude, coordinates.longitude, startDate, endDate);

    const currentCode = forecast.current.weather_code;
    const currentCondition = WMO_WEATHER_CODES[currentCode] ?? { condition: 'Unknown', description: 'Unknown', icon: '❓' };

    const hourly: HourlyWeatherData[] = forecast.hourly.time.map((time: string, i: number) => ({
      time, temperature_2m: forecast.hourly.temperature_2m[i] ?? 0,
      apparent_temperature: forecast.hourly.apparent_temperature[i] ?? 0,
      precipitation_probability: forecast.hourly.precipitation_probability[i] ?? 0,
      precipitation: forecast.hourly.precipitation[i] ?? 0,
      wind_speed_10m: forecast.hourly.wind_speed_10m[i] ?? 0,
      wind_direction_10m: forecast.hourly.wind_direction_10m[i] ?? 0,
      wind_gusts_10m: forecast.hourly.wind_gusts_10m[i] ?? 0,
      weather_code: forecast.hourly.weather_code[i] ?? 0,
      cloud_cover: forecast.hourly.cloud_cover[i] ?? 0,
      relative_humidity_2m: forecast.hourly.relative_humidity_2m[i] ?? 0,
      visibility: forecast.hourly.visibility[i] ?? 0,
    }));

    const daily: DailyWeatherData[] = forecast.daily.time.map((date: string, i: number) => ({
      date, temperature_max: forecast.daily.temperature_2m_max[i] ?? 0,
      temperature_min: forecast.daily.temperature_2m_min[i] ?? 0,
      precipitation_sum: forecast.daily.precipitation_sum[i] ?? 0,
      precipitation_probability_max: forecast.daily.precipitation_probability_max[i] ?? 0,
      wind_speed_max: forecast.daily.wind_speed_10m_max[i] ?? 0,
      wind_gusts_max: forecast.daily.wind_gusts_10m_max[i] ?? 0,
      wind_direction_dominant: forecast.daily.wind_direction_10m_dominant[i] ?? 0,
      weather_code: forecast.daily.weather_code[i] ?? 0,
      sunrise: forecast.daily.sunrise[i] ?? '', sunset: forecast.daily.sunset[i] ?? '',
    }));

    const payload: EventWeatherResponse = {
      eventId: event.id, eventName: event.name, venue: event.venue, location: event.location,
      startDate: event.startDate.toISOString(), endDate: event.endDate.toISOString(),
      coordinates, current: { temperature: forecast.current.temperature_2m,
        apparent_temperature: forecast.current.apparent_temperature,
        wind_speed: forecast.current.wind_speed_10m, wind_direction: forecast.current.wind_direction_10m,
        wind_gusts: forecast.current.wind_gusts_10m, precipitation: forecast.current.precipitation,
        cloud_cover: forecast.current.cloud_cover, relative_humidity: forecast.current.relative_humidity_2m,
        visibility: forecast.current.visibility, weather_code: currentCode,
        condition: currentCondition.condition, description: currentCondition.description, icon: currentCondition.icon,
      },
      daily, hourly,
      units: { temperature: '°F', wind_speed: 'mph', precipitation: 'in', visibility: 'm' },
      fetched_at: new Date().toISOString(),
    };
    res.json({ success: true, data: payload });
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch weather data.' });
  }
};
```

#### `backend/src/routes/weather.routes.ts`
```typescript
import { Router } from 'express';
import { getEventWeather } from '../controllers/weather.controller';
import { authenticate } from '../middleware/auth.middleware';

const router: Router = Router({ mergeParams: true });
router.use(authenticate);
router.get('/', getEventWeather);

export default router;
```

#### `frontend/src/types/weather.ts`
```typescript
export interface HourlyWeatherData {
  time: string; temperature_2m: number; apparent_temperature: number;
  precipitation_probability: number; precipitation: number;
  wind_speed_10m: number; wind_direction_10m: number; wind_gusts_10m: number;
  weather_code: number; cloud_cover: number; relative_humidity_2m: number; visibility: number;
}
export interface DailyWeatherData {
  date: string; temperature_max: number; temperature_min: number;
  precipitation_sum: number; precipitation_probability_max: number;
  wind_speed_max: number; wind_gusts_max: number; wind_direction_dominant: number;
  weather_code: number; sunrise: string; sunset: string;
}
export interface EventWeather {
  eventId: string; eventName: string; venue: string; location: string;
  startDate: string; endDate: string;
  coordinates: { latitude: number; longitude: number; };
  current: {
    temperature: number; apparent_temperature: number; wind_speed: number;
    wind_direction: number; wind_gusts: number; precipitation: number;
    cloud_cover: number; relative_humidity: number; visibility: number;
    weather_code: number; condition: string; description: string; icon: string;
  };
  daily: DailyWeatherData[]; hourly: HourlyWeatherData[];
  units: { temperature: string; wind_speed: string; precipitation: string; visibility: string; };
  fetched_at: string;
}
export const WEATHER_CODE_GRADIENT: Record<number, string> = {
  0: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  1: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  2: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
  3: 'linear-gradient(135deg, #8e9eab 0%, #eef2f3 100%)',
  // ... (full map in source file)
};
```

#### `frontend/src/services/weatherService.ts`
```typescript
import api from './api';
import type { EventWeather } from '../types/weather';

interface WeatherApiResponse { success: boolean; data: EventWeather; }

export const weatherService = {
  getEventWeather: async (eventId: string): Promise<EventWeather> => {
    const response = await api.get<WeatherApiResponse>(`/api/events/${eventId}/weather`);
    return response.data.data;
  },
};
```

#### `frontend/src/components/WeatherWidget.tsx` (key structure)
```typescript
import { useEffect, useState } from 'react';
import { weatherService } from '../services/weatherService';
import type { EventWeather, DailyWeatherData } from '../types/weather';
import { WEATHER_CODE_GRADIENT } from '../types/weather';
import '../weather.css';

// WeatherWidget renders: hero panel (current conditions) + location bar +
// daily forecast grid + attribution footer
// Loading and error states handled with styled fallback UI
const WeatherWidget = ({ eventId }: { eventId: string }) => { /* ... */ };
export default WeatherWidget;
```

### Next Phase Preview
**Phase 14** will implement **Parts & Inventory Management** — defining a `Part` model in Prisma with fields for name, category, quantity, cost, and vehicle relation; running a migration and building `/api/parts` CRUD endpoints; and creating `PartsPage.tsx` with an inventory table, search/filter, and low-stock alerts.

---
