import { Request, Response } from 'express';
/**
 * Retrieve all parts with optional filters:
 *   ?category=Engine
 *   ?vehicleId=<uuid>
 *   ?lowStock=true   (only parts at or below their lowStockThreshold)
 *   ?search=<string> (case-insensitive match on name, partNumber, supplier)
 */
export declare const getAllParts: (req: Request, res: Response) => Promise<void>;
export declare const getPartById: (req: Request, res: Response) => Promise<void>;
export declare const createPart: (req: Request, res: Response) => Promise<void>;
export declare const updatePart: (req: Request, res: Response) => Promise<void>;
export declare const adjustPartQuantity: (req: Request, res: Response) => Promise<void>;
export declare const deletePart: (req: Request, res: Response) => Promise<void>;
export declare const getInventorySummary: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=part.controller.d.ts.map