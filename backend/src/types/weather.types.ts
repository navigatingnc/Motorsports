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

/**
 * WMO Weather interpretation codes mapped to human-readable conditions.
 * Reference: https://open-meteo.com/en/docs
 */
export const WMO_WEATHER_CODES: Record<number, WeatherSummary> = {
  0:  { condition: 'Clear Sky',            description: 'Clear sky',                          icon: '☀️'  },
  1:  { condition: 'Mainly Clear',         description: 'Mainly clear',                       icon: '🌤️'  },
  2:  { condition: 'Partly Cloudy',        description: 'Partly cloudy',                      icon: '⛅'  },
  3:  { condition: 'Overcast',             description: 'Overcast',                           icon: '☁️'  },
  45: { condition: 'Foggy',               description: 'Fog',                                icon: '🌫️'  },
  48: { condition: 'Icy Fog',             description: 'Depositing rime fog',                icon: '🌫️'  },
  51: { condition: 'Light Drizzle',       description: 'Light drizzle',                      icon: '🌦️'  },
  53: { condition: 'Drizzle',             description: 'Moderate drizzle',                   icon: '🌦️'  },
  55: { condition: 'Heavy Drizzle',       description: 'Dense drizzle',                      icon: '🌧️'  },
  61: { condition: 'Light Rain',          description: 'Slight rain',                        icon: '🌧️'  },
  63: { condition: 'Rain',               description: 'Moderate rain',                      icon: '🌧️'  },
  65: { condition: 'Heavy Rain',          description: 'Heavy rain',                         icon: '🌧️'  },
  71: { condition: 'Light Snow',          description: 'Slight snowfall',                    icon: '🌨️'  },
  73: { condition: 'Snow',               description: 'Moderate snowfall',                  icon: '❄️'  },
  75: { condition: 'Heavy Snow',          description: 'Heavy snowfall',                     icon: '❄️'  },
  77: { condition: 'Snow Grains',         description: 'Snow grains',                        icon: '🌨️'  },
  80: { condition: 'Light Showers',       description: 'Slight rain showers',                icon: '🌦️'  },
  81: { condition: 'Showers',            description: 'Moderate rain showers',              icon: '🌧️'  },
  82: { condition: 'Heavy Showers',       description: 'Violent rain showers',               icon: '⛈️'  },
  85: { condition: 'Snow Showers',        description: 'Slight snow showers',                icon: '🌨️'  },
  86: { condition: 'Heavy Snow Showers',  description: 'Heavy snow showers',                 icon: '❄️'  },
  95: { condition: 'Thunderstorm',        description: 'Thunderstorm',                       icon: '⛈️'  },
  96: { condition: 'Thunderstorm + Hail', description: 'Thunderstorm with slight hail',      icon: '⛈️'  },
  99: { condition: 'Thunderstorm + Hail', description: 'Thunderstorm with heavy hail',       icon: '⛈️'  },
};
