"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vehicle_controller_1 = require("../controllers/vehicle.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All vehicle routes require authentication
router.use(auth_middleware_1.authenticate);
// GET routes — all authenticated roles (admin, user, viewer)
router.get('/', vehicle_controller_1.getAllVehicles);
router.get('/:id', vehicle_controller_1.getVehicleById);
// Write routes — admin and user only (viewers excluded)
router.post('/', (0, auth_middleware_1.requireRole)('admin', 'user'), vehicle_controller_1.createVehicle);
router.put('/:id', (0, auth_middleware_1.requireRole)('admin', 'user'), vehicle_controller_1.updateVehicle);
router.delete('/:id', (0, auth_middleware_1.requireRole)('admin', 'user'), vehicle_controller_1.deleteVehicle);
exports.default = router;
//# sourceMappingURL=vehicle.routes.js.map