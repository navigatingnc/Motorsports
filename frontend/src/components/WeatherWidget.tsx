import { useEffect, useState } from 'react';
import { weatherService } from '../services/weatherService';
import type { EventWeather, DailyWeatherData } from '../types/weather';
import { WEATHER_CODE_GRADIENT } from '../types/weather';
import '../weather.css';

interface WeatherWidgetProps {
  eventId: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function windDirectionLabel(degrees: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return dirs[index] ?? 'N';
}

function formatShortDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(isoStr: string): string {
  return new Date(isoStr).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface DailyCardProps {
  day: DailyWeatherData;
  units: EventWeather['units'];
}

const DailyCard = ({ day, units }: DailyCardProps) => {
  const gradient = WEATHER_CODE_GRADIENT[day.weather_code] ?? WEATHER_CODE_GRADIENT[0]!;
  return (
    <div className="weather-daily-card" style={{ background: gradient }}>
      <div className="weather-daily-date">{formatShortDate(day.date)}</div>
      <div className="weather-daily-temps">
        <span className="weather-daily-high">{Math.round(day.temperature_max)}{units.temperature}</span>
        <span className="weather-daily-sep">/</span>
        <span className="weather-daily-low">{Math.round(day.temperature_min)}{units.temperature}</span>
      </div>
      <div className="weather-daily-wind">
        <span className="weather-daily-wind-icon">💨</span>
        {Math.round(day.wind_speed_max)} {units.wind_speed} {windDirectionLabel(day.wind_direction_dominant)}
      </div>
      {day.precipitation_probability_max > 0 && (
        <div className="weather-daily-precip">
          <span>🌧️</span> {day.precipitation_probability_max}%
        </div>
      )}
      <div className="weather-daily-sun">
        <span>🌅 {formatTime(day.sunrise)}</span>
        <span>🌇 {formatTime(day.sunset)}</span>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main WeatherWidget component
// ---------------------------------------------------------------------------

const WeatherWidget = ({ eventId }: WeatherWidgetProps) => {
  const [weather, setWeather] = useState<EventWeather | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await weatherService.getEventWeather(eventId);
        if (!cancelled) setWeather(data);
      } catch (err) {
        if (!cancelled) {
          console.error('Weather fetch error:', err);
          setError('Unable to load weather data for this event.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchWeather();
    return () => { cancelled = true; };
  }, [eventId]);

  if (loading) {
    return (
      <div className="weather-widget weather-widget--loading">
        <div className="weather-loading-spinner" />
        <span>Loading weather forecast…</span>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="weather-widget weather-widget--error">
        <span className="weather-error-icon">⚠️</span>
        <span>{error ?? 'Weather data unavailable.'}</span>
      </div>
    );
  }

  const { current, daily, units, coordinates } = weather;
  const heroGradient =
    WEATHER_CODE_GRADIENT[current.weather_code] ?? WEATHER_CODE_GRADIENT[0]!;

  return (
    <div className="weather-widget">
      {/* ── Hero / Current Conditions ─────────────────────────── */}
      <div className="weather-hero" style={{ background: heroGradient }}>
        <div className="weather-hero-left">
          <div className="weather-icon-large">{current.icon}</div>
          <div className="weather-temp-main">
            {Math.round(current.temperature)}{units.temperature}
          </div>
          <div className="weather-condition">{current.condition}</div>
          <div className="weather-feels-like">
            Feels like {Math.round(current.apparent_temperature)}{units.temperature}
          </div>
        </div>
        <div className="weather-hero-right">
          <div className="weather-stat">
            <span className="weather-stat-label">Wind</span>
            <span className="weather-stat-value">
              {Math.round(current.wind_speed)} {units.wind_speed} {windDirectionLabel(current.wind_direction)}
            </span>
          </div>
          <div className="weather-stat">
            <span className="weather-stat-label">Gusts</span>
            <span className="weather-stat-value">
              {Math.round(current.wind_gusts)} {units.wind_speed}
            </span>
          </div>
          <div className="weather-stat">
            <span className="weather-stat-label">Humidity</span>
            <span className="weather-stat-value">{current.relative_humidity}%</span>
          </div>
          <div className="weather-stat">
            <span className="weather-stat-label">Cloud Cover</span>
            <span className="weather-stat-value">{current.cloud_cover}%</span>
          </div>
          <div className="weather-stat">
            <span className="weather-stat-label">Precipitation</span>
            <span className="weather-stat-value">
              {current.precipitation.toFixed(2)} {units.precipitation}
            </span>
          </div>
          <div className="weather-stat">
            <span className="weather-stat-label">Visibility</span>
            <span className="weather-stat-value">
              {(current.visibility / 1000).toFixed(1)} km
            </span>
          </div>
        </div>
      </div>

      {/* ── Location info ─────────────────────────────────────── */}
      <div className="weather-location-bar">
        <span className="weather-location-pin">📍</span>
        <span className="weather-location-text">
          {weather.venue}, {weather.location}
        </span>
        <span className="weather-coords">
          {coordinates.latitude.toFixed(3)}°, {coordinates.longitude.toFixed(3)}°
        </span>
        <span className="weather-fetched">
          Updated {new Date(weather.fetched_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* ── Event-period Daily Forecast ───────────────────────── */}
      {daily.length > 0 && (
        <div className="weather-daily-section">
          <h3 className="weather-section-title">Event Period Forecast</h3>
          <div className="weather-daily-grid">
            {daily.map((day) => (
              <DailyCard key={day.date} day={day} units={units} />
            ))}
          </div>
        </div>
      )}

      {/* ── Attribution ───────────────────────────────────────── */}
      <div className="weather-attribution">
        Weather data provided by{' '}
        <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">
          Open-Meteo
        </a>{' '}
        — free, open-source weather API.
      </div>
    </div>
  );
};

export default WeatherWidget;
