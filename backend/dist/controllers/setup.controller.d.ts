import { Request, Response } from 'express';
/**
 * Get all setup sheets (optionally filter by eventId or vehicleId)
 */
export declare const getAllSetupSheets: (req: Request, res: Response) => Promise<void>;
/**
 * Get a single setup sheet by ID
 */
export declare const getSetupSheetById: (req: Request, res: Response) => Promise<void>;
/**
 * Create a new setup sheet
 */
export declare const createSetupSheet: (req: Request, res: Response) => Promise<void>;
/**
 * Update a setup sheet
 */
export declare const updateSetupSheet: (req: Request, res: Response) => Promise<void>;
/**
 * Delete a setup sheet
 */
export declare const deleteSetupSheet: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=setup.controller.d.ts.map