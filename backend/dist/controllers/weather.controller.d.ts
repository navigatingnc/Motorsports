import { Request, Response } from 'express';
/**
 * GET /api/events/:id/weather
 *
 * Fetches weather forecast for an event based on its venue location and date range.
 * Uses Open-Meteo (free, no API key required) for both geocoding and forecast data.
 */
export declare const getEventWeather: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=weather.controller.d.ts.map