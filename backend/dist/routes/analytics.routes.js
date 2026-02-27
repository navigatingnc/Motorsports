"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const analytics_controller_1 = require("../controllers/analytics.controller");
const router = (0, express_1.Router)();
// All analytics routes require authentication
router.use(auth_middleware_1.authenticate);
// GET routes — all authenticated roles (admin, user, viewer)
router.get('/summary', analytics_controller_1.getAnalyticsSummary);
router.get('/laptimes', analytics_controller_1.getLapTimes);
router.get('/laptimes/:id', analytics_controller_1.getLapTimeById);
// Write routes — admin and user only (viewers excluded)
router.post('/laptimes', (0, auth_middleware_1.requireRole)('admin', 'user'), analytics_controller_1.recordLapTime);
router.put('/laptimes/:id', (0, auth_middleware_1.requireRole)('admin', 'user'), analytics_controller_1.updateLapTime);
router.delete('/laptimes/:id', (0, auth_middleware_1.requireRole)('admin', 'user'), analytics_controller_1.deleteLapTime);
exports.default = router;
//# sourceMappingURL=analytics.routes.js.map