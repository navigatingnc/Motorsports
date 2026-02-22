import { Request, Response } from 'express';
import prisma from '../prisma';
import {
  CreateSetupSheetDto,
  UpdateSetupSheetDto,
  VALID_SESSION_TYPES,
  VALID_DOWNFORCE_LEVELS,
} from '../types/setup.types';

// Prisma include object for consistent relation loading
const setupInclude = {
  vehicle: {
    select: { id: true, make: true, model: true, year: true, number: true, category: true },
  },
  event: {
    select: { id: true, name: true, type: true, venue: true, location: true, startDate: true, endDate: true },
  },
  createdBy: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
};

/**
 * Get all setup sheets (optionally filter by eventId or vehicleId)
 */
export const getAllSetupSheets = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId, vehicleId } = req.query as { eventId?: string; vehicleId?: string };

    const where: Record<string, unknown> = {};
    if (eventId) where['eventId'] = eventId;
    if (vehicleId) where['vehicleId'] = vehicleId;

    const setups = await prisma.setupSheet.findMany({
      where,
      include: setupInclude,
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: setups,
      count: setups.length,
    });
  } catch (error) {
    console.error('Error fetching setup sheets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch setup sheets',
    });
  }
};

/**
 * Get a single setup sheet by ID
 */
export const getSetupSheetById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    const setup = await prisma.setupSheet.findUnique({
      where: { id },
      include: setupInclude,
    });

    if (!setup) {
      res.status(404).json({
        success: false,
        error: 'Setup sheet not found',
      });
      return;
    }

    res.json({
      success: true,
      data: setup,
    });
  } catch (error) {
    console.error('Error fetching setup sheet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch setup sheet',
    });
  }
};

/**
 * Create a new setup sheet
 */
export const createSetupSheet = async (req: Request, res: Response): Promise<void> => {
  try {
    const data: CreateSetupSheetDto = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    // Validate required fields
    if (!data.vehicleId || !data.eventId || !data.sessionType) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: vehicleId, eventId, and sessionType are required',
      });
      return;
    }

    // Validate sessionType
    if (!VALID_SESSION_TYPES.includes(data.sessionType as (typeof VALID_SESSION_TYPES)[number])) {
      res.status(400).json({
        success: false,
        error: `Invalid sessionType. Must be one of: ${VALID_SESSION_TYPES.join(', ')}`,
      });
      return;
    }

    // Validate downforceLevel if provided
    if (
      data.downforceLevel &&
      !VALID_DOWNFORCE_LEVELS.includes(data.downforceLevel as (typeof VALID_DOWNFORCE_LEVELS)[number])
    ) {
      res.status(400).json({
        success: false,
        error: `Invalid downforceLevel. Must be one of: ${VALID_DOWNFORCE_LEVELS.join(', ')}`,
      });
      return;
    }

    // Verify vehicle exists
    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) {
      res.status(404).json({ success: false, error: 'Vehicle not found' });
      return;
    }

    // Verify event exists
    const event = await prisma.event.findUnique({ where: { id: data.eventId } });
    if (!event) {
      res.status(404).json({ success: false, error: 'Event not found' });
      return;
    }

    const setup = await prisma.setupSheet.create({
      data: {
        vehicleId: data.vehicleId,
        eventId: data.eventId,
        createdById: userId,
        sessionType: data.sessionType,
        sessionNumber: data.sessionNumber ?? null,

        tyreFrontLeft: data.tyreFrontLeft ?? null,
        tyreFrontRight: data.tyreFrontRight ?? null,
        tyreRearLeft: data.tyreRearLeft ?? null,
        tyreRearRight: data.tyreRearRight ?? null,
        tyrePressureFrontLeft: data.tyrePressureFrontLeft ?? null,
        tyrePressureFrontRight: data.tyrePressureFrontRight ?? null,
        tyrePressureRearLeft: data.tyrePressureRearLeft ?? null,
        tyrePressureRearRight: data.tyrePressureRearRight ?? null,

        rideHeightFront: data.rideHeightFront ?? null,
        rideHeightRear: data.rideHeightRear ?? null,
        springRateFront: data.springRateFront ?? null,
        springRateRear: data.springRateRear ?? null,
        damperFront: data.damperFront ?? null,
        damperRear: data.damperRear ?? null,
        camberFront: data.camberFront ?? null,
        camberRear: data.camberRear ?? null,
        toeInFront: data.toeInFront ?? null,
        toeInRear: data.toeInRear ?? null,

        frontWingAngle: data.frontWingAngle ?? null,
        rearWingAngle: data.rearWingAngle ?? null,
        downforceLevel: data.downforceLevel ?? null,

        brakeBias: data.brakeBias ?? null,
        brakeCompound: data.brakeCompound ?? null,

        engineMap: data.engineMap ?? null,
        differentialEntry: data.differentialEntry ?? null,
        differentialMid: data.differentialMid ?? null,
        differentialExit: data.differentialExit ?? null,

        fuelLoad: data.fuelLoad ?? null,

        notes: data.notes ?? null,
        driverFeedback: data.driverFeedback ?? null,
      },
      include: setupInclude,
    });

    res.status(201).json({
      success: true,
      data: setup,
      message: 'Setup sheet created successfully',
    });
  } catch (error) {
    console.error('Error creating setup sheet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create setup sheet',
    });
  }
};

/**
 * Update a setup sheet
 */
export const updateSetupSheet = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const data: UpdateSetupSheetDto = req.body;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    // Check if setup sheet exists
    const existing = await prisma.setupSheet.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, error: 'Setup sheet not found' });
      return;
    }

    // Only the creator or an admin can update
    if (existing.createdById !== userId && userRole !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Forbidden. You can only update your own setup sheets.',
      });
      return;
    }

    // Validate sessionType if provided
    if (
      data.sessionType &&
      !VALID_SESSION_TYPES.includes(data.sessionType as (typeof VALID_SESSION_TYPES)[number])
    ) {
      res.status(400).json({
        success: false,
        error: `Invalid sessionType. Must be one of: ${VALID_SESSION_TYPES.join(', ')}`,
      });
      return;
    }

    // Validate downforceLevel if provided
    if (
      data.downforceLevel &&
      !VALID_DOWNFORCE_LEVELS.includes(data.downforceLevel as (typeof VALID_DOWNFORCE_LEVELS)[number])
    ) {
      res.status(400).json({
        success: false,
        error: `Invalid downforceLevel. Must be one of: ${VALID_DOWNFORCE_LEVELS.join(', ')}`,
      });
      return;
    }

    // Verify vehicle exists if vehicleId is being changed
    if (data.vehicleId) {
      const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
      if (!vehicle) {
        res.status(404).json({ success: false, error: 'Vehicle not found' });
        return;
      }
    }

    // Verify event exists if eventId is being changed
    if (data.eventId) {
      const event = await prisma.event.findUnique({ where: { id: data.eventId } });
      if (!event) {
        res.status(404).json({ success: false, error: 'Event not found' });
        return;
      }
    }

    const setup = await prisma.setupSheet.update({
      where: { id },
      data: {
        ...(data.vehicleId !== undefined && { vehicleId: data.vehicleId }),
        ...(data.eventId !== undefined && { eventId: data.eventId }),
        ...(data.sessionType !== undefined && { sessionType: data.sessionType }),
        ...(data.sessionNumber !== undefined && { sessionNumber: data.sessionNumber }),

        ...(data.tyreFrontLeft !== undefined && { tyreFrontLeft: data.tyreFrontLeft }),
        ...(data.tyreFrontRight !== undefined && { tyreFrontRight: data.tyreFrontRight }),
        ...(data.tyreRearLeft !== undefined && { tyreRearLeft: data.tyreRearLeft }),
        ...(data.tyreRearRight !== undefined && { tyreRearRight: data.tyreRearRight }),
        ...(data.tyrePressureFrontLeft !== undefined && { tyrePressureFrontLeft: data.tyrePressureFrontLeft }),
        ...(data.tyrePressureFrontRight !== undefined && { tyrePressureFrontRight: data.tyrePressureFrontRight }),
        ...(data.tyrePressureRearLeft !== undefined && { tyrePressureRearLeft: data.tyrePressureRearLeft }),
        ...(data.tyrePressureRearRight !== undefined && { tyrePressureRearRight: data.tyrePressureRearRight }),

        ...(data.rideHeightFront !== undefined && { rideHeightFront: data.rideHeightFront }),
        ...(data.rideHeightRear !== undefined && { rideHeightRear: data.rideHeightRear }),
        ...(data.springRateFront !== undefined && { springRateFront: data.springRateFront }),
        ...(data.springRateRear !== undefined && { springRateRear: data.springRateRear }),
        ...(data.damperFront !== undefined && { damperFront: data.damperFront }),
        ...(data.damperRear !== undefined && { damperRear: data.damperRear }),
        ...(data.camberFront !== undefined && { camberFront: data.camberFront }),
        ...(data.camberRear !== undefined && { camberRear: data.camberRear }),
        ...(data.toeInFront !== undefined && { toeInFront: data.toeInFront }),
        ...(data.toeInRear !== undefined && { toeInRear: data.toeInRear }),

        ...(data.frontWingAngle !== undefined && { frontWingAngle: data.frontWingAngle }),
        ...(data.rearWingAngle !== undefined && { rearWingAngle: data.rearWingAngle }),
        ...(data.downforceLevel !== undefined && { downforceLevel: data.downforceLevel }),

        ...(data.brakeBias !== undefined && { brakeBias: data.brakeBias }),
        ...(data.brakeCompound !== undefined && { brakeCompound: data.brakeCompound }),

        ...(data.engineMap !== undefined && { engineMap: data.engineMap }),
        ...(data.differentialEntry !== undefined && { differentialEntry: data.differentialEntry }),
        ...(data.differentialMid !== undefined && { differentialMid: data.differentialMid }),
        ...(data.differentialExit !== undefined && { differentialExit: data.differentialExit }),

        ...(data.fuelLoad !== undefined && { fuelLoad: data.fuelLoad }),

        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.driverFeedback !== undefined && { driverFeedback: data.driverFeedback }),
      },
      include: setupInclude,
    });

    res.json({
      success: true,
      data: setup,
      message: 'Setup sheet updated successfully',
    });
  } catch (error) {
    console.error('Error updating setup sheet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update setup sheet',
    });
  }
};

/**
 * Delete a setup sheet
 */
export const deleteSetupSheet = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const existing = await prisma.setupSheet.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, error: 'Setup sheet not found' });
      return;
    }

    // Only the creator or an admin can delete
    if (existing.createdById !== userId && userRole !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Forbidden. You can only delete your own setup sheets.',
      });
      return;
    }

    await prisma.setupSheet.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Setup sheet deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting setup sheet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete setup sheet',
    });
  }
};
