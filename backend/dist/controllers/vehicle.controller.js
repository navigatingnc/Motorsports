"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVehicle = exports.updateVehicle = exports.createVehicle = exports.getVehicleById = exports.getAllVehicles = void 0;
const prisma_1 = __importDefault(require("../prisma"));
/**
 * Get all vehicles
 */
const getAllVehicles = async (req, res) => {
    try {
        const vehicles = await prisma_1.default.vehicle.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.json({
            success: true,
            data: vehicles,
            count: vehicles.length,
        });
    }
    catch (error) {
        console.error('Error fetching vehicles:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch vehicles',
        });
    }
};
exports.getAllVehicles = getAllVehicles;
/**
 * Get a single vehicle by ID
 */
const getVehicleById = async (req, res) => {
    try {
        const { id } = req.params;
        const vehicle = await prisma_1.default.vehicle.findUnique({
            where: { id },
        });
        if (!vehicle) {
            res.status(404).json({
                success: false,
                error: 'Vehicle not found',
            });
            return;
        }
        res.json({
            success: true,
            data: vehicle,
        });
    }
    catch (error) {
        console.error('Error fetching vehicle:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch vehicle',
        });
    }
};
exports.getVehicleById = getVehicleById;
/**
 * Create a new vehicle
 */
const createVehicle = async (req, res) => {
    try {
        const vehicleData = req.body;
        // Validate required fields
        if (!vehicleData.make || !vehicleData.model || !vehicleData.year || !vehicleData.category) {
            res.status(400).json({
                success: false,
                error: 'Missing required fields: make, model, year, and category are required',
            });
            return;
        }
        // Validate year
        if (vehicleData.year < 1900 || vehicleData.year > new Date().getFullYear() + 1) {
            res.status(400).json({
                success: false,
                error: 'Invalid year',
            });
            return;
        }
        const vehicle = await prisma_1.default.vehicle.create({
            data: vehicleData,
        });
        res.status(201).json({
            success: true,
            data: vehicle,
            message: 'Vehicle created successfully',
        });
    }
    catch (error) {
        console.error('Error creating vehicle:', error);
        // Handle unique constraint violation for VIN
        if (error.code === 'P2002' && error.meta?.target?.includes('vin')) {
            res.status(409).json({
                success: false,
                error: 'A vehicle with this VIN already exists',
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: 'Failed to create vehicle',
        });
    }
};
exports.createVehicle = createVehicle;
/**
 * Update a vehicle
 */
const updateVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        // Validate year if provided
        if (updateData.year && (updateData.year < 1900 || updateData.year > new Date().getFullYear() + 1)) {
            res.status(400).json({
                success: false,
                error: 'Invalid year',
            });
            return;
        }
        // Check if vehicle exists
        const existingVehicle = await prisma_1.default.vehicle.findUnique({
            where: { id },
        });
        if (!existingVehicle) {
            res.status(404).json({
                success: false,
                error: 'Vehicle not found',
            });
            return;
        }
        const vehicle = await prisma_1.default.vehicle.update({
            where: { id },
            data: updateData,
        });
        res.json({
            success: true,
            data: vehicle,
            message: 'Vehicle updated successfully',
        });
    }
    catch (error) {
        console.error('Error updating vehicle:', error);
        // Handle unique constraint violation for VIN
        if (error.code === 'P2002' && error.meta?.target?.includes('vin')) {
            res.status(409).json({
                success: false,
                error: 'A vehicle with this VIN already exists',
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: 'Failed to update vehicle',
        });
    }
};
exports.updateVehicle = updateVehicle;
/**
 * Delete a vehicle
 */
const deleteVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        // Check if vehicle exists
        const existingVehicle = await prisma_1.default.vehicle.findUnique({
            where: { id },
        });
        if (!existingVehicle) {
            res.status(404).json({
                success: false,
                error: 'Vehicle not found',
            });
            return;
        }
        await prisma_1.default.vehicle.delete({
            where: { id },
        });
        res.json({
            success: true,
            message: 'Vehicle deleted successfully',
        });
    }
    catch (error) {
        console.error('Error deleting vehicle:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete vehicle',
        });
    }
};
exports.deleteVehicle = deleteVehicle;
//# sourceMappingURL=vehicle.controller.js.map