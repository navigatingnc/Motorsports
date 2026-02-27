"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const setup_controller_1 = require("../controllers/setup.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All setup routes require authentication
router.use(auth_middleware_1.authenticate);
// GET routes — all authenticated roles (admin, user, viewer)
router.get('/', setup_controller_1.getAllSetupSheets);
router.get('/:id', setup_controller_1.getSetupSheetById);
// Write routes — admin and user only (viewers excluded)
router.post('/', (0, auth_middleware_1.requireRole)('admin', 'user'), setup_controller_1.createSetupSheet);
router.put('/:id', (0, auth_middleware_1.requireRole)('admin', 'user'), setup_controller_1.updateSetupSheet);
router.delete('/:id', (0, auth_middleware_1.requireRole)('admin', 'user'), setup_controller_1.deleteSetupSheet);
exports.default = router;
//# sourceMappingURL=setup.routes.js.map