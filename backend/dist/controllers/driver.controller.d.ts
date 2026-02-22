import { Request, Response } from 'express';
/**
 * Get all drivers (with user info)
 * GET /api/drivers
 */
export declare const getAllDrivers: (req: Request, res: Response) => Promise<void>;
/**
 * Get a single driver by ID
 * GET /api/drivers/:id
 */
export declare const getDriverById: (req: Request, res: Response) => Promise<void>;
/**
 * Create a new driver profile for a user
 * POST /api/drivers
 */
export declare const createDriver: (req: Request, res: Response) => Promise<void>;
/**
 * Update a driver profile
 * PUT /api/drivers/:id
 */
export declare const updateDriver: (req: Request, res: Response) => Promise<void>;
/**
 * Delete a driver profile
 * DELETE /api/drivers/:id
 */
export declare const deleteDriver: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=driver.controller.d.ts.map