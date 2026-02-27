import { Request, Response } from 'express';
/**
 * Helper: convert milliseconds to a human-readable lap time string (mm:ss.mmm)
 */
export declare const msToLapTimeString: (ms: number) => string;
/**
 * POST /api/analytics/laptimes
 * Record a new lap time entry
 */
export declare const recordLapTime: (req: Request, res: Response) => Promise<void>;
/**
 * GET /api/analytics/laptimes
 * Retrieve lap times with optional filters: eventId, driverId, vehicleId, sessionType
 */
export declare const getLapTimes: (req: Request, res: Response) => Promise<void>;
/**
 * GET /api/analytics/laptimes/:id
 * Retrieve a single lap time entry by ID
 */
export declare const getLapTimeById: (req: Request, res: Response) => Promise<void>;
/**
 * PUT /api/analytics/laptimes/:id
 * Update a lap time entry
 */
export declare const updateLapTime: (req: Request, res: Response) => Promise<void>;
/**
 * DELETE /api/analytics/laptimes/:id
 * Delete a lap time entry
 */
export declare const deleteLapTime: (req: Request, res: Response) => Promise<void>;
/**
 * GET /api/analytics/summary
 * Returns aggregated analytics: best laps per driver/vehicle, trend data for charts
 */
export declare const getAnalyticsSummary: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=analytics.controller.d.ts.map