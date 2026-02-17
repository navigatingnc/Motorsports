"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const vehicle_routes_1 = __importDefault(require("./routes/vehicle.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
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
// API routes
app.get('/api', (req, res) => {
    res.json({
        message: 'Motorsports Management API',
        version: '1.0.0'
    });
});
// Vehicle routes
app.use('/api/vehicles', vehicle_routes_1.default);
// Start server
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
    console.log(`🏁[motorsports]: Motorsports Management API initialized`);
});
exports.default = app;
//# sourceMappingURL=index.js.map