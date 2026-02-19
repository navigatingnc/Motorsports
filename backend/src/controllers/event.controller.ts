import { Request, Response } from 'express';
import prisma from '../prisma';
import { CreateEventDto, UpdateEventDto, VALID_EVENT_STATUSES } from '../types/event.types';

/**
 * Get all events
 */
export const getAllEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        startDate: 'asc',
      },
    });

    res.json({
      success: true,
      data: events,
      count: events.length,
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events',
    });
  }
};

/**
 * Get a single event by ID
 */
export const getEventById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    const event = await prisma.event.findUnique({
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
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch event',
    });
  }
};

/**
 * Create a new event
 */
export const createEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const eventData: CreateEventDto = req.body;

    // Validate required fields
    if (
      !eventData.name ||
      !eventData.type ||
      !eventData.venue ||
      !eventData.location ||
      !eventData.startDate ||
      !eventData.endDate
    ) {
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
    if (eventData.status && !VALID_EVENT_STATUSES.includes(eventData.status as (typeof VALID_EVENT_STATUSES)[number])) {
      res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${VALID_EVENT_STATUSES.join(', ')}`,
      });
      return;
    }

    const event = await prisma.event.create({
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
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create event',
    });
  }
};

/**
 * Update an event
 */
export const updateEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const updateData: UpdateEventDto = req.body;

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
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
    let startDate: Date | undefined;
    let endDate: Date | undefined;

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
    if (updateData.status && !VALID_EVENT_STATUSES.includes(updateData.status as (typeof VALID_EVENT_STATUSES)[number])) {
      res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${VALID_EVENT_STATUSES.join(', ')}`,
      });
      return;
    }

    const event = await prisma.event.update({
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
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update event',
    });
  }
};

/**
 * Delete an event
 */
export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      res.status(404).json({
        success: false,
        error: 'Event not found',
      });
      return;
    }

    await prisma.event.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete event',
    });
  }
};
