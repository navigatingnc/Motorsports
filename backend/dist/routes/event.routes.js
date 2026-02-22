"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const event_controller_1 = require("../controllers/event.controller");
const router = (0, express_1.Router)();
// GET /api/events - Get all events
router.get('/', event_controller_1.getAllEvents);
// GET /api/events/:id - Get a single event by ID
router.get('/:id', event_controller_1.getEventById);
// POST /api/events - Create a new event
router.post('/', event_controller_1.createEvent);
// PUT /api/events/:id - Update an event
router.put('/:id', event_controller_1.updateEvent);
// DELETE /api/events/:id - Delete an event
router.delete('/:id', event_controller_1.deleteEvent);
exports.default = router;
//# sourceMappingURL=event.routes.js.map