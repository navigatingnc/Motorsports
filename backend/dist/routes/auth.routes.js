"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// POST /api/auth/register - Register a new user
router.post('/register', auth_controller_1.register);
// POST /api/auth/login - Login an existing user
router.post('/login', auth_controller_1.login);
// GET /api/auth/me - Get the current authenticated user's profile
router.get('/me', auth_middleware_1.authenticate, auth_controller_1.getMe);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map