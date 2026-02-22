"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const driver_controller_1 = require("../controllers/driver.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All driver routes require authentication
router.use(auth_middleware_1.authenticate);
// GET /api/drivers - Get all drivers
router.get('/', driver_controller_1.getAllDrivers);
// GET /api/drivers/:id - Get a single driver by ID
router.get('/:id', driver_controller_1.getDriverById);
// POST /api/drivers - Create a new driver profile
router.post('/', driver_controller_1.createDriver);
// PUT /api/drivers/:id - Update a driver profile
router.put('/:id', driver_controller_1.updateDriver);
// DELETE /api/drivers/:id - Delete a driver profile
router.delete('/:id', driver_controller_1.deleteDriver);
exports.default = router;
//# sourceMappingURL=driver.routes.js.map