import { Request, Response } from 'express';
import prisma from '../prisma';
import { VALID_ROLES } from '../types/auth.types';

/**
 * Get all users (admin only)
 * GET /api/admin/users
 */
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        driver: {
          select: {
            id: true,
            licenseNumber: true,
            nationality: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users.',
    });
  }
};

/**
 * Get a single user by ID (admin only)
 * GET /api/admin/users/:id
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        driver: true,
        setupSheets: {
          select: { id: true, sessionType: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found.',
      });
      return;
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user.',
    });
  }
};

/**
 * Update a user's role (admin only)
 * PATCH /api/admin/users/:id/role
 * Body: { role: "admin" | "user" | "viewer" }
 */
export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const { role } = req.body as { role: string };

    if (!role) {
      res.status(400).json({
        success: false,
        error: 'Role is required.',
      });
      return;
    }

    if (!VALID_ROLES.includes(role as (typeof VALID_ROLES)[number])) {
      res.status(400).json({
        success: false,
        error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`,
      });
      return;
    }

    // Prevent admin from changing their own role
    if (req.user && req.user.userId === id) {
      res.status(400).json({
        success: false,
        error: 'You cannot change your own role.',
      });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found.',
      });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      message: `User role updated to "${role}".`,
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user role.',
    });
  }
};

/**
 * Toggle a user's active status (admin only)
 * PATCH /api/admin/users/:id/status
 * Body: { isActive: boolean }
 */
export const toggleUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const { isActive } = req.body as { isActive: boolean };

    if (typeof isActive !== 'boolean') {
      res.status(400).json({
        success: false,
        error: 'isActive must be a boolean value.',
      });
      return;
    }

    // Prevent admin from deactivating themselves
    if (req.user && req.user.userId === id) {
      res.status(400).json({
        success: false,
        error: 'You cannot change your own account status.',
      });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found.',
      });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      message: `User account ${isActive ? 'activated' : 'deactivated'}.`,
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user status.',
    });
  }
};
