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
export declare const WMO_WEATHER_CODES: Record<number, WeatherSummary>;
//# sourceMappingURL=weather.types.d.ts.map