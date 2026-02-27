"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const event_controller_1 = require("../controllers/event.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All event routes require authentication
router.use(auth_middleware_1.authenticate);
// GET routes — all authenticated roles (admin, user, viewer)
router.get('/', event_controller_1.getAllEvents);
router.get('/:id', event_controller_1.getEventById);
// Write routes — admin and user only (viewers excluded)
router.post('/', (0, auth_middleware_1.requireRole)('admin', 'user'), event_controller_1.createEvent);
router.put('/:id', (0, auth_middleware_1.requireRole)('admin', 'user'), event_controller_1.updateEvent);
router.delete('/:id', (0, auth_middleware_1.requireRole)('admin', 'user'), event_controller_1.deleteEvent);
exports.default = router;
//# sourceMappingURL=event.routes.js.map