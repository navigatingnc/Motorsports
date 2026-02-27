"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalyticsSummary = exports.deleteLapTime = exports.updateLapTime = exports.getLapTimeById = exports.getLapTimes = exports.recordLapTime = exports.msToLapTimeString = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const laptime_types_1 = require("../types/laptime.types");
// Consistent include object for lap time queries
const lapTimeInclude = {
    driver: {
        select: { id: true, userId: true },
        include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
    },
    vehicle: {
        select: { id: true, make: true, model: true, year: true, number: true, category: true },
    },
    event: {
        select: { id: true, name: true, type: true, venue: true, location: true, startDate: true },
    },
};
/**
 * Helper: convert milliseconds to a human-readable lap time string (mm:ss.mmm)
 */
const msToLapTimeString = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const millis = ms % 1000;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
};
exports.msToLapTimeString = msToLapTimeString;
/**
 * POST /api/analytics/laptimes
 * Record a new lap time entry
 */
const recordLapTime = async (req, res) => {
    try {
        const data = req.body;
        // Validate required fields
        if (!data.driverId || !data.vehicleId || !data.eventId) {
            res.status(400).json({
                success: false,
                error: 'Missing required fields: driverId, vehicleId, and eventId are required',
            });
            return;
        }
        if (data.lapNumber === undefined || data.lapNumber === null || data.lapNumber < 1) {
            res.status(400).json({
                success: false,
                error: 'lapNumber must be a positive integer',
            });
            return;
        }
        if (data.lapTimeMs === undefined || data.lapTimeMs === null || data.lapTimeMs <= 0) {
            res.status(400).json({
                success: false,
                error: 'lapTimeMs must be a positive integer (milliseconds)',
            });
            return;
        }
        if (!data.sessionType) {
            res.status(400).json({
                success: false,
                error: 'sessionType is required',
            });
            return;
        }
        if (!laptime_types_1.VALID_LAP_SESSION_TYPES.includes(data.sessionType)) {
            res.status(400).json({
                success: false,
                error: `Invalid sessionType. Must be one of: ${laptime_types_1.VALID_LAP_SESSION_TYPES.join(', ')}`,
            });
            return;
        }
        // Verify related entities exist
        const driver = await prisma_1.default.driver.findUnique({ where: { id: data.driverId } });
        if (!driver) {
            res.status(404).json({ success: false, error: 'Driver not found' });
            return;
        }
        const vehicle = await prisma_1.default.vehicle.findUnique({ where: { id: data.vehicleId } });
        if (!vehicle) {
            res.status(404).json({ success: false, error: 'Vehicle not found' });
            return;
        }
        const event = await prisma_1.default.event.findUnique({ where: { id: data.eventId } });
        if (!event) {
            res.status(404).json({ success: false, error: 'Event not found' });
            return;
        }
        const lapTime = await prisma_1.default.lapTime.create({
            data: {
                driverId: data.driverId,
                vehicleId: data.vehicleId,
                eventId: data.eventId,
                lapNumber: data.lapNumber,
                lapTimeMs: data.lapTimeMs,
                sessionType: data.sessionType,
                sector1Ms: data.sector1Ms ?? null,
                sector2Ms: data.sector2Ms ?? null,
                sector3Ms: data.sector3Ms ?? null,
                isValid: data.isValid ?? true,
                notes: data.notes ?? null,
            },
            include: lapTimeInclude,
        });
        res.status(201).json({
            success: true,
            data: {
                ...lapTime,
                lapTimeFormatted: (0, exports.msToLapTimeString)(lapTime.lapTimeMs),
            },
            message: 'Lap time recorded successfully',
        });
    }
    catch (error) {
        console.error('Error recording lap time:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to record lap time',
        });
    }
};
exports.recordLapTime = recordLapTime;
/**
 * GET /api/analytics/laptimes
 * Retrieve lap times with optional filters: eventId, driverId, vehicleId, sessionType
 */
const getLapTimes = async (req, res) => {
    try {
        const { eventId, driverId, vehicleId, sessionType } = req.query;
        const where = {};
        if (eventId)
            where['eventId'] = eventId;
        if (driverId)
            where['driverId'] = driverId;
        if (vehicleId)
            where['vehicleId'] = vehicleId;
        if (sessionType)
            where['sessionType'] = sessionType;
        const lapTimes = await prisma_1.default.lapTime.findMany({
            where,
            include: lapTimeInclude,
            orderBy: [{ eventId: 'asc' }, { lapNumber: 'asc' }],
        });
        const enriched = lapTimes.map((lt) => ({
            ...lt,
            lapTimeFormatted: (0, exports.msToLapTimeString)(lt.lapTimeMs),
            sector1Formatted: lt.sector1Ms ? (0, exports.msToLapTimeString)(lt.sector1Ms) : null,
            sector2Formatted: lt.sector2Ms ? (0, exports.msToLapTimeString)(lt.sector2Ms) : null,
            sector3Formatted: lt.sector3Ms ? (0, exports.msToLapTimeString)(lt.sector3Ms) : null,
        }));
        res.json({
            success: true,
            data: enriched,
            count: enriched.length,
        });
    }
    catch (error) {
        console.error('Error fetching lap times:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch lap times',
        });
    }
};
exports.getLapTimes = getLapTimes;
/**
 * GET /api/analytics/laptimes/:id
 * Retrieve a single lap time entry by ID
 */
const getLapTimeById = async (req, res) => {
    try {
        const { id } = req.params;
        const lapTime = await prisma_1.default.lapTime.findUnique({
            where: { id },
            include: lapTimeInclude,
        });
        if (!lapTime) {
            res.status(404).json({ success: false, error: 'Lap time not found' });
            return;
        }
        res.json({
            success: true,
            data: {
                ...lapTime,
                lapTimeFormatted: (0, exports.msToLapTimeString)(lapTime.lapTimeMs),
                sector1Formatted: lapTime.sector1Ms ? (0, exports.msToLapTimeString)(lapTime.sector1Ms) : null,
                sector2Formatted: lapTime.sector2Ms ? (0, exports.msToLapTimeString)(lapTime.sector2Ms) : null,
                sector3Formatted: lapTime.sector3Ms ? (0, exports.msToLapTimeString)(lapTime.sector3Ms) : null,
            },
        });
    }
    catch (error) {
        console.error('Error fetching lap time:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch lap time',
        });
    }
};
exports.getLapTimeById = getLapTimeById;
/**
 * PUT /api/analytics/laptimes/:id
 * Update a lap time entry
 */
const updateLapTime = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const existing = await prisma_1.default.lapTime.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ success: false, error: 'Lap time not found' });
            return;
        }
        if (data.sessionType &&
            !laptime_types_1.VALID_LAP_SESSION_TYPES.includes(data.sessionType)) {
            res.status(400).json({
                success: false,
                error: `Invalid sessionType. Must be one of: ${laptime_types_1.VALID_LAP_SESSION_TYPES.join(', ')}`,
            });
            return;
        }
        const lapTime = await prisma_1.default.lapTime.update({
            where: { id },
            data: {
                ...(data.lapNumber !== undefined && { lapNumber: data.lapNumber }),
                ...(data.lapTimeMs !== undefined && { lapTimeMs: data.lapTimeMs }),
                ...(data.sessionType !== undefined && { sessionType: data.sessionType }),
                ...(data.sector1Ms !== undefined && { sector1Ms: data.sector1Ms }),
                ...(data.sector2Ms !== undefined && { sector2Ms: data.sector2Ms }),
                ...(data.sector3Ms !== undefined && { sector3Ms: data.sector3Ms }),
                ...(data.isValid !== undefined && { isValid: data.isValid }),
                ...(data.notes !== undefined && { notes: data.notes }),
            },
            include: lapTimeInclude,
        });
        res.json({
            success: true,
            data: {
                ...lapTime,
                lapTimeFormatted: (0, exports.msToLapTimeString)(lapTime.lapTimeMs),
            },
            message: 'Lap time updated successfully',
        });
    }
    catch (error) {
        console.error('Error updating lap time:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update lap time',
        });
    }
};
exports.updateLapTime = updateLapTime;
/**
 * DELETE /api/analytics/laptimes/:id
 * Delete a lap time entry
 */
const deleteLapTime = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await prisma_1.default.lapTime.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ success: false, error: 'Lap time not found' });
            return;
        }
        await prisma_1.default.lapTime.delete({ where: { id } });
        res.json({
            success: true,
            message: 'Lap time deleted successfully',
        });
    }
    catch (error) {
        console.error('Error deleting lap time:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete lap time',
        });
    }
};
exports.deleteLapTime = deleteLapTime;
/**
 * GET /api/analytics/summary
 * Returns aggregated analytics: best laps per driver/vehicle, trend data for charts
 */
const getAnalyticsSummary = async (req, res) => {
    try {
        const { eventId } = req.query;
        const where = { isValid: true };
        if (eventId)
            where['eventId'] = eventId;
        // Fetch all valid lap times for the scope
        const lapTimes = await prisma_1.default.lapTime.findMany({
            where,
            include: lapTimeInclude,
            orderBy: { lapTimeMs: 'asc' },
        });
        // --- Best lap per driver ---
        const bestByDriver = {};
        for (const lt of lapTimes) {
            const driverName = `${lt.driver.user.firstName} ${lt.driver.user.lastName}`;
            if (!bestByDriver[lt.driverId] || lt.lapTimeMs < bestByDriver[lt.driverId].lapTimeMs) {
                bestByDriver[lt.driverId] = {
                    driverName,
                    lapTimeMs: lt.lapTimeMs,
                    lapTimeFormatted: (0, exports.msToLapTimeString)(lt.lapTimeMs),
                    vehicleName: `${lt.vehicle.year} ${lt.vehicle.make} ${lt.vehicle.model}`,
                    eventName: lt.event.name,
                };
            }
        }
        // --- Best lap per vehicle ---
        const bestByVehicle = {};
        for (const lt of lapTimes) {
            const vehicleName = `${lt.vehicle.year} ${lt.vehicle.make} ${lt.vehicle.model}`;
            const driverName = `${lt.driver.user.firstName} ${lt.driver.user.lastName}`;
            if (!bestByVehicle[lt.vehicleId] || lt.lapTimeMs < bestByVehicle[lt.vehicleId].lapTimeMs) {
                bestByVehicle[lt.vehicleId] = {
                    vehicleName,
                    lapTimeMs: lt.lapTimeMs,
                    lapTimeFormatted: (0, exports.msToLapTimeString)(lt.lapTimeMs),
                    driverName,
                    eventName: lt.event.name,
                };
            }
        }
        // --- Lap time trend (for line chart): lap number vs lapTimeMs per driver ---
        const trendByDriver = {};
        for (const lt of lapTimes) {
            const driverName = `${lt.driver.user.firstName} ${lt.driver.user.lastName}`;
            if (!trendByDriver[lt.driverId]) {
                trendByDriver[lt.driverId] = { driverName, laps: [] };
            }
            trendByDriver[lt.driverId].laps.push({
                lapNumber: lt.lapNumber,
                lapTimeMs: lt.lapTimeMs,
                lapTimeFormatted: (0, exports.msToLapTimeString)(lt.lapTimeMs),
            });
        }
        // Sort each driver's laps by lap number
        for (const key of Object.keys(trendByDriver)) {
            trendByDriver[key].laps.sort((a, b) => a.lapNumber - b.lapNumber);
        }
        res.json({
            success: true,
            data: {
                totalLaps: lapTimes.length,
                bestLapsByDriver: Object.values(bestByDriver),
                bestLapsByVehicle: Object.values(bestByVehicle),
                lapTrendsByDriver: Object.values(trendByDriver),
            },
        });
    }
    catch (error) {
        console.error('Error fetching analytics summary:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch analytics summary',
        });
    }
};
exports.getAnalyticsSummary = getAnalyticsSummary;
//# sourceMappingURL=analytics.controller.js.map