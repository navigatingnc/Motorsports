"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const weather_controller_1 = require("../controllers/weather.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)({ mergeParams: true });
// All weather routes require authentication
router.use(auth_middleware_1.authenticate);
/**
 * GET /api/events/:id/weather
 * Returns weather forecast for the event's venue and date range.
 * Available to all authenticated roles (admin, user, viewer).
 */
router.get('/', weather_controller_1.getEventWeather);
exports.default = router;
//# sourceMappingURL=weather.routes.js.map