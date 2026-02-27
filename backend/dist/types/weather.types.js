"use strict";
/**
 * Weather data types for the Motorsports Management API.
 * Data is sourced from the Open-Meteo free forecast API.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WMO_WEATHER_CODES = void 0;
/**
 * WMO Weather interpretation codes mapped to human-readable conditions.
 * Reference: https://open-meteo.com/en/docs
 */
exports.WMO_WEATHER_CODES = {
    0: { condition: 'Clear Sky', description: 'Clear sky', icon: '☀️' },
    1: { condition: 'Mainly Clear', description: 'Mainly clear', icon: '🌤️' },
    2: { condition: 'Partly Cloudy', description: 'Partly cloudy', icon: '⛅' },
    3: { condition: 'Overcast', description: 'Overcast', icon: '☁️' },
    45: { condition: 'Foggy', description: 'Fog', icon: '🌫️' },
    48: { condition: 'Icy Fog', description: 'Depositing rime fog', icon: '🌫️' },
    51: { condition: 'Light Drizzle', description: 'Light drizzle', icon: '🌦️' },
    53: { condition: 'Drizzle', description: 'Moderate drizzle', icon: '🌦️' },
    55: { condition: 'Heavy Drizzle', description: 'Dense drizzle', icon: '🌧️' },
    61: { condition: 'Light Rain', description: 'Slight rain', icon: '🌧️' },
    63: { condition: 'Rain', description: 'Moderate rain', icon: '🌧️' },
    65: { condition: 'Heavy Rain', description: 'Heavy rain', icon: '🌧️' },
    71: { condition: 'Light Snow', description: 'Slight snowfall', icon: '🌨️' },
    73: { condition: 'Snow', description: 'Moderate snowfall', icon: '❄️' },
    75: { condition: 'Heavy Snow', description: 'Heavy snowfall', icon: '❄️' },
    77: { condition: 'Snow Grains', description: 'Snow grains', icon: '🌨️' },
    80: { condition: 'Light Showers', description: 'Slight rain showers', icon: '🌦️' },
    81: { condition: 'Showers', description: 'Moderate rain showers', icon: '🌧️' },
    82: { condition: 'Heavy Showers', description: 'Violent rain showers', icon: '⛈️' },
    85: { condition: 'Snow Showers', description: 'Slight snow showers', icon: '🌨️' },
    86: { condition: 'Heavy Snow Showers', description: 'Heavy snow showers', icon: '❄️' },
    95: { condition: 'Thunderstorm', description: 'Thunderstorm', icon: '⛈️' },
    96: { condition: 'Thunderstorm + Hail', description: 'Thunderstorm with slight hail', icon: '⛈️' },
    99: { condition: 'Thunderstorm + Hail', description: 'Thunderstorm with heavy hail', icon: '⛈️' },
};
//# sourceMappingURL=weather.types.js.map