import { Request, Response } from 'express';
import prisma from '../prisma';
import { CreateDriverDto, UpdateDriverDto } from '../types/driver.types';

/**
 * Get all drivers (with user info)
 * GET /api/drivers
 */
export const getAllDrivers = async (req: Request, res: Response): Promise<void> => {
  try {
    const drivers = await prisma.driver.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: drivers,
      count: drivers.length,
    });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch drivers.',
    });
  }
};

/**
 * Get a single driver by ID
 * GET /api/drivers/:id
 */
export const getDriverById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    const driver = await prisma.driver.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    if (!driver) {
      res.status(404).json({
        success: false,
        error: 'Driver not found.',
      });
      return;
    }

    res.json({
      success: true,
      data: driver,
    });
  } catch (error) {
    console.error('Error fetching driver:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch driver.',
    });
  }
};

/**
 * Create a new driver profile for a user
 * POST /api/drivers
 */
export const createDriver = async (req: Request, res: Response): Promise<void> => {
  try {
    const driverData: CreateDriverDto = req.body;

    if (!driverData.userId) {
      res.status(400).json({
        success: false,
        error: 'Missing required field: userId is required.',
      });
      return;
    }

    // Verify the user exists
    const user = await prisma.user.findUnique({
      where: { id: driverData.userId },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found.',
      });
      return;
    }

    // Check if driver profile already exists for this user
    const existingDriver = await prisma.driver.findUnique({
      where: { userId: driverData.userId },
    });

    if (existingDriver) {
      res.status(409).json({
        success: false,
        error: 'A driver profile already exists for this user.',
      });
      return;
    }

    const driver = await prisma.driver.create({
      data: {
        userId: driverData.userId,
        licenseNumber: driverData.licenseNumber ?? null,
        nationality: driverData.nationality ?? null,
        dateOfBirth: driverData.dateOfBirth ? new Date(driverData.dateOfBirth) : null,
        bio: driverData.bio ?? null,
        emergencyContact: driverData.emergencyContact ?? null,
        medicalNotes: driverData.medicalNotes ?? null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: driver,
      message: 'Driver profile created successfully.',
    });
  } catch (error) {
    console.error('Error creating driver:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create driver profile.',
    });
  }
};

/**
 * Update a driver profile
 * PUT /api/drivers/:id
 */
export const updateDriver = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const updateData: UpdateDriverDto = req.body;

    const existingDriver = await prisma.driver.findUnique({
      where: { id },
    });

    if (!existingDriver) {
      res.status(404).json({
        success: false,
        error: 'Driver not found.',
      });
      return;
    }

    const driver = await prisma.driver.update({
      where: { id },
      data: {
        ...(updateData.licenseNumber !== undefined && { licenseNumber: updateData.licenseNumber }),
        ...(updateData.nationality !== undefined && { nationality: updateData.nationality }),
        ...(updateData.dateOfBirth !== undefined && {
          dateOfBirth: updateData.dateOfBirth ? new Date(updateData.dateOfBirth) : null,
        }),
        ...(updateData.bio !== undefined && { bio: updateData.bio }),
        ...(updateData.emergencyContact !== undefined && { emergencyContact: updateData.emergencyContact }),
        ...(updateData.medicalNotes !== undefined && { medicalNotes: updateData.medicalNotes }),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: driver,
      message: 'Driver profile updated successfully.',
    });
  } catch (error) {
    console.error('Error updating driver:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update driver profile.',
    });
  }
};

/**
 * Delete a driver profile
 * DELETE /api/drivers/:id
 */
export const deleteDriver = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    const existingDriver = await prisma.driver.findUnique({
      where: { id },
    });

    if (!existingDriver) {
      res.status(404).json({
        success: false,
        error: 'Driver not found.',
      });
      return;
    }

    await prisma.driver.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Driver profile deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting driver:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete driver profile.',
    });
  }
};
