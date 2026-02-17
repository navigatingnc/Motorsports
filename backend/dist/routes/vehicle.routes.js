"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vehicle_controller_1 = require("../controllers/vehicle.controller");
const router = (0, express_1.Router)();
// GET /api/vehicles - Get all vehicles
router.get('/', vehicle_controller_1.getAllVehicles);
// GET /api/vehicles/:id - Get a single vehicle by ID
router.get('/:id', vehicle_controller_1.getVehicleById);
// POST /api/vehicles - Create a new vehicle
router.post('/', vehicle_controller_1.createVehicle);
// PUT /api/vehicles/:id - Update a vehicle
router.put('/:id', vehicle_controller_1.updateVehicle);
// DELETE /api/vehicles/:id - Delete a vehicle
router.delete('/:id', vehicle_controller_1.deleteVehicle);
exports.default = router;
//# sourceMappingURL=vehicle.routes.js.map