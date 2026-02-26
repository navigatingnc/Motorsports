/**
 * Frontend weather data types — mirrors the backend EventWeatherResponse shape.
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

export interface EventWeather {
  eventId: string;
  eventName: string;
  venue: string;
  location: string;
  startDate: string;
  endDate: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  current: {
    temperature: number;
    apparent_temperature: number;
    wind_speed: number;
    wind_direction: number;
    wind_gusts: number;
    precipitation: number;
    cloud_cover: number;
    relative_humidity: number;
    visibility: number;
    weather_code: number;
    condition: string;
    description: string;
    icon: string;
  };
  daily: DailyWeatherData[];
  hourly: HourlyWeatherData[];
  units: {
    temperature: string;
    wind_speed: string;
    precipitation: string;
    visibility: string;
  };
  fetched_at: string;
}

/** Maps WMO weather codes to a CSS background gradient for the widget */
export const WEATHER_CODE_GRADIENT: Record<number, string> = {
  0:  'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  1:  'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  2:  'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
  3:  'linear-gradient(135deg, #8e9eab 0%, #eef2f3 100%)',
  45: 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)',
  48: 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)',
  51: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  53: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  55: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  61: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  63: 'linear-gradient(135deg, #43b89c 0%, #4facfe 100%)',
  65: 'linear-gradient(135deg, #2980b9 0%, #6dd5fa 100%)',
  71: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)',
  73: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)',
  75: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)',
  80: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  81: 'linear-gradient(135deg, #43b89c 0%, #4facfe 100%)',
  82: 'linear-gradient(135deg, #373b44 0%, #4286f4 100%)',
  95: 'linear-gradient(135deg, #373b44 0%, #4286f4 100%)',
  96: 'linear-gradient(135deg, #373b44 0%, #4286f4 100%)',
  99: 'linear-gradient(135deg, #373b44 0%, #4286f4 100%)',
};
