"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const part_controller_1 = require("../controllers/part.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All parts routes require authentication
router.use(auth_middleware_1.authenticate);
// ── Read routes — all authenticated roles ──────────────────────────────────
router.get('/', part_controller_1.getAllParts);
router.get('/summary', part_controller_1.getInventorySummary); // must be before /:id
router.get('/:id', part_controller_1.getPartById);
// ── Write routes — admin and user only ────────────────────────────────────
router.post('/', (0, auth_middleware_1.requireRole)('admin', 'user'), part_controller_1.createPart);
router.put('/:id', (0, auth_middleware_1.requireRole)('admin', 'user'), part_controller_1.updatePart);
router.patch('/:id/adjust', (0, auth_middleware_1.requireRole)('admin', 'user'), part_controller_1.adjustPartQuantity);
router.delete('/:id', (0, auth_middleware_1.requireRole)('admin', 'user'), part_controller_1.deletePart);
exports.default = router;
//# sourceMappingURL=part.routes.js.map