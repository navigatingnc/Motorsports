"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const driver_controller_1 = require("../controllers/driver.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All driver routes require authentication
router.use(auth_middleware_1.authenticate);
// GET routes — all authenticated roles (admin, user, viewer)
router.get('/', driver_controller_1.getAllDrivers);
router.get('/:id', driver_controller_1.getDriverById);
// Write routes — admin and user only (viewers excluded)
router.post('/', (0, auth_middleware_1.requireRole)('admin', 'user'), driver_controller_1.createDriver);
router.put('/:id', (0, auth_middleware_1.requireRole)('admin', 'user'), driver_controller_1.updateDriver);
router.delete('/:id', (0, auth_middleware_1.requireRole)('admin', 'user'), driver_controller_1.deleteDriver);
exports.default = router;
//# sourceMappingURL=driver.routes.js.map