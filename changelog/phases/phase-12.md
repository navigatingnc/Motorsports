# Phase 12: Backend + Frontend: Role-Based Access Control (RBAC)

**Date:** February 25, 2026  
**Status:** ✅ Completed

---

### Summary
Implemented a comprehensive Role-Based Access Control (RBAC) system across the entire application. Created a flexible `requireRole()` middleware that accepts any combination of roles, applied it to all backend routes (viewers = read-only, users = read/write, admins = full access), built admin-only user management endpoints, created an Admin Panel page for managing users, and added role-based navigation visibility and route guards on the frontend.

### Work Performed

1. **Flexible `requireRole()` Middleware**
   - Created `requireRole(...allowedRoles)` middleware that accepts a variadic list of role strings
   - Returns 403 Forbidden with a descriptive message when the user's role is not in the allowed list
   - Preserved existing `authenticate` and `requireAdmin` middleware for backward compatibility

2. **Backend Route Protection**
   - **Vehicle routes**: GET endpoints open to all authenticated roles; POST/PUT/DELETE restricted to `admin` and `user`
   - **Event routes**: Same pattern — read for all, write for admin/user
   - **Driver routes**: Same pattern — read for all, write for admin/user
   - **Setup routes**: Same pattern — read for all, write for admin/user
   - **Analytics routes**: GET/summary open to all; POST/PUT/DELETE lap times restricted to admin/user
   - All routes now require authentication via `router.use(authenticate)`

3. **Admin User Management API**
   - `GET /api/admin/users` — List all users with driver profile info
   - `GET /api/admin/users/:id` — Get detailed user info including recent setup sheets
   - `PATCH /api/admin/users/:id/role` — Update a user's role (admin/user/viewer) with self-change prevention
   - `PATCH /api/admin/users/:id/status` — Activate/deactivate a user account with self-change prevention
   - All admin endpoints protected with `authenticate` + `requireRole('admin')`

4. **Frontend Admin Panel Page**
   - Created `AdminPanelPage.tsx` with a full user management table
   - Inline role editing via dropdown select per user row
   - Activate/deactivate toggle buttons with confirmation feedback
   - User stats summary (total users, active count, admin count)
   - Success/error toast messages with auto-dismiss
   - Self-action prevention (cannot change own role or deactivate own account)
   - "You" badge indicator for the current admin user

5. **Frontend Role-Based Navigation & Route Guards**
   - Created `RoleGuard.tsx` component that restricts routes by allowed roles
   - Admin nav link only visible to admin users, styled with gold accent color
   - Write routes (vehicle create/edit, event create/edit) guarded with `RoleGuard` for admin/user only
   - Admin panel route guarded for admin-only access
   - Role-specific styling for user role badge in navbar (admin=gold, user=white, viewer=dim)

6. **Registered Admin Routes in Backend**
   - Added `adminRoutes` import and mount at `/api/admin` in `src/index.ts`
   - Updated API info endpoint to include admin endpoint listing

### Code Generated

#### `backend/src/middleware/auth.middleware.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/auth.types';

// Extend Express Request to include authenticated user
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
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Access denied. No token provided.',
    });
    return;
  }

  const token = authHeader.substring(7);
  const jwtSecret = process.env['JWT_SECRET'];

  if (!jwtSecret) {
    res.status(500).json({
      success: false,
      error: 'Server configuration error: JWT secret not set.',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token.',
    });
  }
};

/**
 * Middleware to restrict access to admin role only
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required.',
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: 'Access denied. Admin role required.',
    });
    return;
  }

  next();
};

/**
 * Flexible role-based authorization middleware.
 * Accepts one or more roles that are allowed to access the route.
 */
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.user.role}.`,
      });
      return;
    }

    next();
  };
};
```

#### `backend/src/controllers/admin.controller.ts`
```typescript
import { Request, Response } from 'express';
import prisma from '../prisma';
import { VALID_ROLES } from '../types/auth.types';

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, isActive: true, createdAt: true, updatedAt: true,
        driver: { select: { id: true, licenseNumber: true, nationality: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: users, count: users.length });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch users.' });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, isActive: true, createdAt: true, updatedAt: true,
        driver: true,
        setupSheets: { select: { id: true, sessionType: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!user) { res.status(404).json({ success: false, error: 'User not found.' }); return; }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user.' });
  }
};

export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const { role } = req.body as { role: string };
    if (!role) { res.status(400).json({ success: false, error: 'Role is required.' }); return; }
    if (!VALID_ROLES.includes(role as (typeof VALID_ROLES)[number])) {
      res.status(400).json({ success: false, error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` }); return;
    }
    if (req.user && req.user.userId === id) {
      res.status(400).json({ success: false, error: 'You cannot change your own role.' }); return;
    }
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) { res.status(404).json({ success: false, error: 'User not found.' }); return; }
    const updatedUser = await prisma.user.update({
      where: { id }, data: { role },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, updatedAt: true },
    });
    res.json({ success: true, message: `User role updated to "${role}".`, data: updatedUser });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ success: false, error: 'Failed to update user role.' });
  }
};

export const toggleUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const { isActive } = req.body as { isActive: boolean };
    if (typeof isActive !== 'boolean') {
      res.status(400).json({ success: false, error: 'isActive must be a boolean value.' }); return;
    }
    if (req.user && req.user.userId === id) {
      res.status(400).json({ success: false, error: 'You cannot change your own account status.' }); return;
    }
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) { res.status(404).json({ success: false, error: 'User not found.' }); return; }
    const updatedUser = await prisma.user.update({
      where: { id }, data: { isActive },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, updatedAt: true },
    });
    res.json({ success: true, message: `User account ${isActive ? 'activated' : 'deactivated'}.`, data: updatedUser });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ success: false, error: 'Failed to update user status.' });
  }
};
```

#### `backend/src/routes/admin.routes.ts`
```typescript
import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { getAllUsers, getUserById, updateUserRole, toggleUserStatus } from '../controllers/admin.controller';

const router: Router = Router();

router.use(authenticate);
router.use(requireRole('admin'));

router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/status', toggleUserStatus);

export default router;
```

#### `backend/src/routes/vehicle.routes.ts` (updated)
```typescript
import { Router } from 'express';
import { getAllVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle } from '../controllers/vehicle.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router: Router = Router();
router.use(authenticate);

router.get('/', getAllVehicles);
router.get('/:id', getVehicleById);
router.post('/', requireRole('admin', 'user'), createVehicle);
router.put('/:id', requireRole('admin', 'user'), updateVehicle);
router.delete('/:id', requireRole('admin', 'user'), deleteVehicle);

export default router;
```

#### `frontend/src/types/admin.ts`
```typescript
export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  driver?: { id: string; licenseNumber?: string; nationality?: string; } | null;
}

export const VALID_ROLES = ['admin', 'user', 'viewer'] as const;
export type UserRole = (typeof VALID_ROLES)[number];
```

#### `frontend/src/services/adminService.ts`
```typescript
import api from './api';
import type { AdminUser } from '../types/admin';

interface ApiResponse<T> { success: boolean; message?: string; data: T; count?: number; }

export const adminService = {
  getAllUsers: async (): Promise<AdminUser[]> => {
    const response = await api.get<ApiResponse<AdminUser[]>>('/api/admin/users');
    return response.data.data;
  },
  getUserById: async (id: string): Promise<AdminUser> => {
    const response = await api.get<ApiResponse<AdminUser>>(`/api/admin/users/${id}`);
    return response.data.data;
  },
  updateUserRole: async (id: string, role: string): Promise<AdminUser> => {
    const response = await api.patch<ApiResponse<AdminUser>>(`/api/admin/users/${id}/role`, { role });
    return response.data.data;
  },
  toggleUserStatus: async (id: string, isActive: boolean): Promise<AdminUser> => {
    const response = await api.patch<ApiResponse<AdminUser>>(`/api/admin/users/${id}/status`, { isActive });
    return response.data.data;
  },
};
```

#### `frontend/src/components/RoleGuard.tsx`
```typescript
import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  fallback?: string;
}

const RoleGuard = ({ children, allowedRoles, fallback = '/' }: RoleGuardProps) => {
  const { user } = useAuth();
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={fallback} replace />;
  }
  return <>{children}</>;
};

export default RoleGuard;
```

#### `frontend/src/pages/AdminPanelPage.tsx`
```typescript
// Full admin panel with user management table, role editing, status toggling,
// stats summary, success/error feedback, and self-action prevention.
// (See full source in repository)
```

### Files Created
- `backend/src/controllers/admin.controller.ts`
- `backend/src/routes/admin.routes.ts`
- `frontend/src/types/admin.ts`
- `frontend/src/services/adminService.ts`
- `frontend/src/components/RoleGuard.tsx`
- `frontend/src/pages/AdminPanelPage.tsx`

### Files Modified
- `backend/src/middleware/auth.middleware.ts` — added `requireRole()` middleware
- `backend/src/index.ts` — registered admin routes at `/api/admin`
- `backend/src/routes/vehicle.routes.ts` — added `authenticate` + `requireRole` RBAC
- `backend/src/routes/event.routes.ts` — added `authenticate` + `requireRole` RBAC
- `backend/src/routes/driver.routes.ts` — added `requireRole` to write routes
- `backend/src/routes/setup.routes.ts` — added `requireRole` to write routes
- `backend/src/routes/analytics.routes.ts` — added `requireRole` to write routes
- `frontend/src/App.tsx` — added Admin nav link, RoleGuard on write routes, admin route
- `frontend/src/App.css` — added admin panel and RBAC-related styles
- `project_plan.md` — added phases 12–17, marked Phase 12 as Done

### RBAC Permission Matrix

| Action | Admin | User | Viewer |
|:---|:---:|:---:|:---:|
| View vehicles, events, drivers, setups, analytics | ✅ | ✅ | ✅ |
| Create/edit/delete vehicles, events, drivers, setups, lap times | ✅ | ✅ | ❌ |
| Access admin panel | ✅ | ❌ | ❌ |
| Manage user roles | ✅ | ❌ | ❌ |
| Activate/deactivate users | ✅ | ❌ | ❌ |

### Next Phase Preview
**Phase 13** will implement **Weather Integration for Events** — integrating a weather API to fetch forecasts by event venue and date, building a backend proxy endpoint, and displaying a weather widget on the Event Detail page.

---
