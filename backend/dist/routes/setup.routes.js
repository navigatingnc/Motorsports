"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const setup_controller_1 = require("../controllers/setup.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All setup routes require authentication
router.use(auth_middleware_1.authenticate);
// GET /api/setups - Get all setup sheets (supports ?eventId= and ?vehicleId= query params)
router.get('/', setup_controller_1.getAllSetupSheets);
// GET /api/setups/:id - Get a single setup sheet by ID
router.get('/:id', setup_controller_1.getSetupSheetById);
// POST /api/setups - Create a new setup sheet
router.post('/', setup_controller_1.createSetupSheet);
// PUT /api/setups/:id - Update a setup sheet
router.put('/:id', setup_controller_1.updateSetupSheet);
// DELETE /api/setups/:id - Delete a setup sheet
router.delete('/:id', setup_controller_1.deleteSetupSheet);
exports.default = router;
//# sourceMappingURL=setup.routes.js.map