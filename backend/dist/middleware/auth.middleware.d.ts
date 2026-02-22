import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from '../types/auth.types';
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}
/**
 * Middleware to verify JWT token and attach user to request
 */
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware to restrict access to admin role only
 */
export declare const requireAdmin: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map