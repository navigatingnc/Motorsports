import { Request, Response } from 'express';
/**
 * Register a new user
 * POST /api/auth/register
 */
export declare const register: (req: Request, res: Response) => Promise<void>;
/**
 * Login an existing user
 * POST /api/auth/login
 */
export declare const login: (req: Request, res: Response) => Promise<void>;
/**
 * Get the currently authenticated user's profile
 * GET /api/auth/me
 */
export declare const getMe: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=auth.controller.d.ts.map