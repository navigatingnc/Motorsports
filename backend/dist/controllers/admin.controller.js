"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleUserStatus = exports.updateUserRole = exports.getUserById = exports.getAllUsers = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const auth_types_1 = require("../types/auth.types");
/**
 * Get all users (admin only)
 * GET /api/admin/users
 */
const getAllUsers = async (req, res) => {
    try {
        const users = await prisma_1.default.user.findMany({
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
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch users.',
        });
    }
};
exports.getAllUsers = getAllUsers;
/**
 * Get a single user by ID (admin only)
 * GET /api/admin/users/:id
 */
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma_1.default.user.findUnique({
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
    }
    catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user.',
        });
    }
};
exports.getUserById = getUserById;
/**
 * Update a user's role (admin only)
 * PATCH /api/admin/users/:id/role
 * Body: { role: "admin" | "user" | "viewer" }
 */
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        if (!role) {
            res.status(400).json({
                success: false,
                error: 'Role is required.',
            });
            return;
        }
        if (!auth_types_1.VALID_ROLES.includes(role)) {
            res.status(400).json({
                success: false,
                error: `Invalid role. Must be one of: ${auth_types_1.VALID_ROLES.join(', ')}`,
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
        const user = await prisma_1.default.user.findUnique({ where: { id } });
        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found.',
            });
            return;
        }
        const updatedUser = await prisma_1.default.user.update({
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
    }
    catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update user role.',
        });
    }
};
exports.updateUserRole = updateUserRole;
/**
 * Toggle a user's active status (admin only)
 * PATCH /api/admin/users/:id/status
 * Body: { isActive: boolean }
 */
const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
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
        const user = await prisma_1.default.user.findUnique({ where: { id } });
        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found.',
            });
            return;
        }
        const updatedUser = await prisma_1.default.user.update({
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
    }
    catch (error) {
        console.error('Error toggling user status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update user status.',
        });
    }
};
exports.toggleUserStatus = toggleUserStatus;
//# sourceMappingURL=admin.controller.js.map