import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus,
} from '../controllers/admin.controller';

const router: Router = Router();

// All admin routes require authentication + admin role
router.use(authenticate);
router.use(requireRole('admin'));

// GET /api/admin/users - List all users
router.get('/users', getAllUsers);

// GET /api/admin/users/:id - Get a single user
router.get('/users/:id', getUserById);

// PATCH /api/admin/users/:id/role - Update a user's role
router.patch('/users/:id/role', updateUserRole);

// PATCH /api/admin/users/:id/status - Activate/deactivate a user
router.patch('/users/:id/status', toggleUserStatus);

export default router;
