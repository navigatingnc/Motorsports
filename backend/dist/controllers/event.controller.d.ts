import { Request, Response } from 'express';
/**
 * Get all events
 */
export declare const getAllEvents: (req: Request, res: Response) => Promise<void>;
/**
 * Get a single event by ID
 */
export declare const getEventById: (req: Request, res: Response) => Promise<void>;
/**
 * Create a new event
 */
export declare const createEvent: (req: Request, res: Response) => Promise<void>;
/**
 * Update an event
 */
export declare const updateEvent: (req: Request, res: Response) => Promise<void>;
/**
 * Delete an event
 */
export declare const deleteEvent: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=event.controller.d.ts.map