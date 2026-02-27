"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const vehicle_routes_1 = __importDefault(require("./routes/vehicle.routes"));
const event_routes_1 = __importDefault(require("./routes/event.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const driver_routes_1 = __importDefault(require("./routes/driver.routes"));
const setup_routes_1 = __importDefault(require("./routes/setup.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const weather_routes_1 = __importDefault(require("./routes/weather.routes"));
const part_routes_1 = __importDefault(require("./routes/part.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const app = (0, express_1.default)();
const port = process.env['PORT'] || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Motorsports Management API is running',
        timestamp: new Date().toISOString()
    });
});
// API info endpoint
app.get('/api', (req, res) => {
    res.json({
        message: 'Motorsports Management API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            vehicles: '/api/vehicles',
            events: '/api/events',
            drivers: '/api/drivers',
            setups: '/api/setups',
            analytics: '/api/analytics',
            admin: '/api/admin',
            weather: '/api/events/:id/weather',
            parts: '/api/parts',
            uploads: '/api/uploads',
        }
    });
});
// Auth routes (public)
app.use('/api/auth', auth_routes_1.default);
// Vehicle routes (protected)
app.use('/api/vehicles', vehicle_routes_1.default);
// Event routes (protected)
app.use('/api/events', event_routes_1.default);
// Driver routes (protected)
app.use('/api/drivers', driver_routes_1.default);
// Setup sheet routes (protected)
app.use('/api/setups', setup_routes_1.default);
// Analytics routes (protected)
app.use('/api/analytics', analytics_routes_1.default);
// Admin routes (admin only)
app.use('/api/admin', admin_routes_1.default);
// Weather routes — nested under events (protected)
app.use('/api/events/:id/weather', weather_routes_1.default);
// Parts / Inventory routes (protected)
app.use('/api/parts', part_routes_1.default);
// File upload routes (protected)
app.use('/api/uploads', upload_routes_1.default);
// Start server
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
    console.log(`🏁[motorsports]: Motorsports Management API initialized`);
    console.log(`🔐[auth]: Authentication endpoints available at /api/auth`);
    console.log(`👑[admin]: Admin endpoints available at /api/admin`);
});
exports.default = app;
//# sourceMappingURL=index.js.map