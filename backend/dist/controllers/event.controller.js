"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEvent = exports.updateEvent = exports.createEvent = exports.getEventById = exports.getAllEvents = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const event_types_1 = require("../types/event.types");
/**
 * Get all events
 */
const getAllEvents = async (req, res) => {
    try {
        const events = await prisma_1.default.event.findMany({
            orderBy: {
                startDate: 'asc',
            },
        });
        res.json({
            success: true,
            data: events,
            count: events.length,
        });
    }
    catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch events',
        });
    }
};
exports.getAllEvents = getAllEvents;
/**
 * Get a single event by ID
 */
const getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await prisma_1.default.event.findUnique({
            where: { id },
        });
        if (!event) {
            res.status(404).json({
                success: false,
                error: 'Event not found',
            });
            return;
        }
        res.json({
            success: true,
            data: event,
        });
    }
    catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch event',
        });
    }
};
exports.getEventById = getEventById;
/**
 * Create a new event
 */
const createEvent = async (req, res) => {
    try {
        const eventData = req.body;
        // Validate required fields
        if (!eventData.name ||
            !eventData.type ||
            !eventData.venue ||
            !eventData.location ||
            !eventData.startDate ||
            !eventData.endDate) {
            res.status(400).json({
                success: false,
                error: 'Missing required fields: name, type, venue, location, startDate, and endDate are required',
            });
            return;
        }
        // Parse and validate dates
        const startDate = new Date(eventData.startDate);
        const endDate = new Date(eventData.endDate);
        if (isNaN(startDate.getTime())) {
            res.status(400).json({
                success: false,
                error: 'Invalid startDate format. Use ISO 8601 format (e.g., 2026-03-15T09:00:00Z)',
            });
            return;
        }
        if (isNaN(endDate.getTime())) {
            res.status(400).json({
                success: false,
                error: 'Invalid endDate format. Use ISO 8601 format (e.g., 2026-03-15T17:00:00Z)',
            });
            return;
        }
        if (endDate < startDate) {
            res.status(400).json({
                success: false,
                error: 'endDate must be on or after startDate',
            });
            return;
        }
        // Validate status if provided
        if (eventData.status && !event_types_1.VALID_EVENT_STATUSES.includes(eventData.status)) {
            res.status(400).json({
                success: false,
                error: `Invalid status. Must be one of: ${event_types_1.VALID_EVENT_STATUSES.join(', ')}`,
            });
            return;
        }
        const event = await prisma_1.default.event.create({
            data: {
                name: eventData.name,
                type: eventData.type,
                venue: eventData.venue,
                location: eventData.location,
                startDate,
                endDate,
                status: eventData.status ?? 'Upcoming',
                description: eventData.description ?? null,
                notes: eventData.notes ?? null,
            },
        });
        res.status(201).json({
            success: true,
            data: event,
            message: 'Event created successfully',
        });
    }
    catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create event',
        });
    }
};
exports.createEvent = createEvent;
/**
 * Update an event
 */
const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        // Check if event exists
        const existingEvent = await prisma_1.default.event.findUnique({
            where: { id },
        });
        if (!existingEvent) {
            res.status(404).json({
                success: false,
                error: 'Event not found',
            });
            return;
        }
        // Parse and validate dates if provided
        let startDate;
        let endDate;
        if (updateData.startDate !== undefined) {
            startDate = new Date(updateData.startDate);
            if (isNaN(startDate.getTime())) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid startDate format. Use ISO 8601 format (e.g., 2026-03-15T09:00:00Z)',
                });
                return;
            }
        }
        if (updateData.endDate !== undefined) {
            endDate = new Date(updateData.endDate);
            if (isNaN(endDate.getTime())) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid endDate format. Use ISO 8601 format (e.g., 2026-03-15T17:00:00Z)',
                });
                return;
            }
        }
        // Validate date range
        const effectiveStart = startDate ?? existingEvent.startDate;
        const effectiveEnd = endDate ?? existingEvent.endDate;
        if (effectiveEnd < effectiveStart) {
            res.status(400).json({
                success: false,
                error: 'endDate must be on or after startDate',
            });
            return;
        }
        // Validate status if provided
        if (updateData.status && !event_types_1.VALID_EVENT_STATUSES.includes(updateData.status)) {
            res.status(400).json({
                success: false,
                error: `Invalid status. Must be one of: ${event_types_1.VALID_EVENT_STATUSES.join(', ')}`,
            });
            return;
        }
        const event = await prisma_1.default.event.update({
            where: { id },
            data: {
                ...(updateData.name !== undefined && { name: updateData.name }),
                ...(updateData.type !== undefined && { type: updateData.type }),
                ...(updateData.venue !== undefined && { venue: updateData.venue }),
                ...(updateData.location !== undefined && { location: updateData.location }),
                ...(startDate !== undefined && { startDate }),
                ...(endDate !== undefined && { endDate }),
                ...(updateData.status !== undefined && { status: updateData.status }),
                ...(updateData.description !== undefined && { description: updateData.description }),
                ...(updateData.notes !== undefined && { notes: updateData.notes }),
            },
        });
        res.json({
            success: true,
            data: event,
            message: 'Event updated successfully',
        });
    }
    catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update event',
        });
    }
};
exports.updateEvent = updateEvent;
/**
 * Delete an event
 */
const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        // Check if event exists
        const existingEvent = await prisma_1.default.event.findUnique({
            where: { id },
        });
        if (!existingEvent) {
            res.status(404).json({
                success: false,
                error: 'Event not found',
            });
            return;
        }
        await prisma_1.default.event.delete({
            where: { id },
        });
        res.json({
            success: true,
            message: 'Event deleted successfully',
        });
    }
    catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete event',
        });
    }
};
exports.deleteEvent = deleteEvent;
//# sourceMappingURL=event.controller.js.map