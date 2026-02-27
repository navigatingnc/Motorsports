import { Request, Response } from 'express';
/**
 * Get all users (admin only)
 * GET /api/admin/users
 */
export declare const getAllUsers: (req: Request, res: Response) => Promise<void>;
/**
 * Get a single user by ID (admin only)
 * GET /api/admin/users/:id
 */
export declare const getUserById: (req: Request, res: Response) => Promise<void>;
/**
 * Update a user's role (admin only)
 * PATCH /api/admin/users/:id/role
 * Body: { role: "admin" | "user" | "viewer" }
 */
export declare const updateUserRole: (req: Request, res: Response) => Promise<void>;
/**
 * Toggle a user's active status (admin only)
 * PATCH /api/admin/users/:id/status
 * Body: { isActive: boolean }
 */
export declare const toggleUserStatus: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=admin.controller.d.ts.map