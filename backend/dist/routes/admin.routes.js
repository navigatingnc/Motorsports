"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_controller_1 = require("../controllers/admin.controller");
const router = (0, express_1.Router)();
// All admin routes require authentication + admin role
router.use(auth_middleware_1.authenticate);
router.use((0, auth_middleware_1.requireRole)('admin'));
// GET /api/admin/users - List all users
router.get('/users', admin_controller_1.getAllUsers);
// GET /api/admin/users/:id - Get a single user
router.get('/users/:id', admin_controller_1.getUserById);
// PATCH /api/admin/users/:id/role - Update a user's role
router.patch('/users/:id/role', admin_controller_1.updateUserRole);
// PATCH /api/admin/users/:id/status - Activate/deactivate a user
router.patch('/users/:id/status', admin_controller_1.toggleUserStatus);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map