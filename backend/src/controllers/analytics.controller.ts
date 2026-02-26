import { Request, Response } from 'express';
import prisma from '../prisma';
import { CreateLapTimeDto, UpdateLapTimeDto, VALID_LAP_SESSION_TYPES } from '../types/laptime.types';

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
export const msToLapTimeString = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const millis = ms % 1000;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
};

/**
 * POST /api/analytics/laptimes
 * Record a new lap time entry
 */
export const recordLapTime = async (req: Request, res: Response): Promise<void> => {
  try {
    const data: CreateLapTimeDto = req.body;

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

    if (!VALID_LAP_SESSION_TYPES.includes(data.sessionType as (typeof VALID_LAP_SESSION_TYPES)[number])) {
      res.status(400).json({
        success: false,
        error: `Invalid sessionType. Must be one of: ${VALID_LAP_SESSION_TYPES.join(', ')}`,
      });
      return;
    }

    // Verify related entities exist
    const driver = await prisma.driver.findUnique({ where: { id: data.driverId } });
    if (!driver) {
      res.status(404).json({ success: false, error: 'Driver not found' });
      return;
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) {
      res.status(404).json({ success: false, error: 'Vehicle not found' });
      return;
    }

    const event = await prisma.event.findUnique({ where: { id: data.eventId } });
    if (!event) {
      res.status(404).json({ success: false, error: 'Event not found' });
      return;
    }

    const lapTime = await prisma.lapTime.create({
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
        lapTimeFormatted: msToLapTimeString(lapTime.lapTimeMs),
      },
      message: 'Lap time recorded successfully',
    });
  } catch (error) {
    console.error('Error recording lap time:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record lap time',
    });
  }
};

/**
 * GET /api/analytics/laptimes
 * Retrieve lap times with optional filters: eventId, driverId, vehicleId, sessionType
 */
export const getLapTimes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId, driverId, vehicleId, sessionType } = req.query as {
      eventId?: string;
      driverId?: string;
      vehicleId?: string;
      sessionType?: string;
    };

    const where: Record<string, unknown> = {};
    if (eventId) where['eventId'] = eventId;
    if (driverId) where['driverId'] = driverId;
    if (vehicleId) where['vehicleId'] = vehicleId;
    if (sessionType) where['sessionType'] = sessionType;

    const lapTimes = await prisma.lapTime.findMany({
      where,
      include: lapTimeInclude,
      orderBy: [{ eventId: 'asc' }, { lapNumber: 'asc' }],
    });

    const enriched = lapTimes.map((lt: any) => ({
      ...lt,
      lapTimeFormatted: msToLapTimeString(lt.lapTimeMs),
      sector1Formatted: lt.sector1Ms ? msToLapTimeString(lt.sector1Ms) : null,
      sector2Formatted: lt.sector2Ms ? msToLapTimeString(lt.sector2Ms) : null,
      sector3Formatted: lt.sector3Ms ? msToLapTimeString(lt.sector3Ms) : null,
    }));

    res.json({
      success: true,
      data: enriched,
      count: enriched.length,
    });
  } catch (error) {
    console.error('Error fetching lap times:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lap times',
    });
  }
};

/**
 * GET /api/analytics/laptimes/:id
 * Retrieve a single lap time entry by ID
 */
export const getLapTimeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    const lapTime = await prisma.lapTime.findUnique({
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
        lapTimeFormatted: msToLapTimeString(lapTime.lapTimeMs),
        sector1Formatted: lapTime.sector1Ms ? msToLapTimeString(lapTime.sector1Ms) : null,
        sector2Formatted: lapTime.sector2Ms ? msToLapTimeString(lapTime.sector2Ms) : null,
        sector3Formatted: lapTime.sector3Ms ? msToLapTimeString(lapTime.sector3Ms) : null,
      },
    });
  } catch (error) {
    console.error('Error fetching lap time:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lap time',
    });
  }
};

/**
 * PUT /api/analytics/laptimes/:id
 * Update a lap time entry
 */
export const updateLapTime = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const data: UpdateLapTimeDto = req.body;

    const existing = await prisma.lapTime.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, error: 'Lap time not found' });
      return;
    }

    if (
      data.sessionType &&
      !VALID_LAP_SESSION_TYPES.includes(data.sessionType as (typeof VALID_LAP_SESSION_TYPES)[number])
    ) {
      res.status(400).json({
        success: false,
        error: `Invalid sessionType. Must be one of: ${VALID_LAP_SESSION_TYPES.join(', ')}`,
      });
      return;
    }

    const lapTime = await prisma.lapTime.update({
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
        lapTimeFormatted: msToLapTimeString(lapTime.lapTimeMs),
      },
      message: 'Lap time updated successfully',
    });
  } catch (error) {
    console.error('Error updating lap time:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update lap time',
    });
  }
};

/**
 * DELETE /api/analytics/laptimes/:id
 * Delete a lap time entry
 */
export const deleteLapTime = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    const existing = await prisma.lapTime.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, error: 'Lap time not found' });
      return;
    }

    await prisma.lapTime.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Lap time deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting lap time:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete lap time',
    });
  }
};

/**
 * GET /api/analytics/summary
 * Returns aggregated analytics: best laps per driver/vehicle, trend data for charts
 */
export const getAnalyticsSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.query as { eventId?: string };

    const where: Record<string, unknown> = { isValid: true };
    if (eventId) where['eventId'] = eventId;

    // Fetch all valid lap times for the scope
    const lapTimes = await prisma.lapTime.findMany({
      where,
      include: lapTimeInclude,
      orderBy: { lapTimeMs: 'asc' },
    });

    // --- Best lap per driver ---
    const bestByDriver: Record<string, { driverName: string; lapTimeMs: number; lapTimeFormatted: string; vehicleName: string; eventName: string }> = {};
    for (const lt of lapTimes) {
      const driverName = `${lt.driver.user.firstName} ${lt.driver.user.lastName}`;
      if (!bestByDriver[lt.driverId] || lt.lapTimeMs < bestByDriver[lt.driverId]!.lapTimeMs) {
        bestByDriver[lt.driverId] = {
          driverName,
          lapTimeMs: lt.lapTimeMs,
          lapTimeFormatted: msToLapTimeString(lt.lapTimeMs),
          vehicleName: `${lt.vehicle.year} ${lt.vehicle.make} ${lt.vehicle.model}`,
          eventName: lt.event.name,
        };
      }
    }

    // --- Best lap per vehicle ---
    const bestByVehicle: Record<string, { vehicleName: string; lapTimeMs: number; lapTimeFormatted: string; driverName: string; eventName: string }> = {};
    for (const lt of lapTimes) {
      const vehicleName = `${lt.vehicle.year} ${lt.vehicle.make} ${lt.vehicle.model}`;
      const driverName = `${lt.driver.user.firstName} ${lt.driver.user.lastName}`;
      if (!bestByVehicle[lt.vehicleId] || lt.lapTimeMs < bestByVehicle[lt.vehicleId]!.lapTimeMs) {
        bestByVehicle[lt.vehicleId] = {
          vehicleName,
          lapTimeMs: lt.lapTimeMs,
          lapTimeFormatted: msToLapTimeString(lt.lapTimeMs),
          driverName,
          eventName: lt.event.name,
        };
      }
    }

    // --- Lap time trend (for line chart): lap number vs lapTimeMs per driver ---
    const trendByDriver: Record<string, { driverName: string; laps: { lapNumber: number; lapTimeMs: number; lapTimeFormatted: string }[] }> = {};
    for (const lt of lapTimes) {
      const driverName = `${lt.driver.user.firstName} ${lt.driver.user.lastName}`;
      if (!trendByDriver[lt.driverId]) {
        trendByDriver[lt.driverId] = { driverName, laps: [] };
      }
      trendByDriver[lt.driverId]!.laps.push({
        lapNumber: lt.lapNumber,
        lapTimeMs: lt.lapTimeMs,
        lapTimeFormatted: msToLapTimeString(lt.lapTimeMs),
      });
    }
    // Sort each driver's laps by lap number
    for (const key of Object.keys(trendByDriver)) {
      trendByDriver[key]!.laps.sort((a, b) => a.lapNumber - b.lapNumber);
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
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics summary',
    });
  }
};
