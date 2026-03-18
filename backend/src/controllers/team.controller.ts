import { Request, Response } from 'express';
import prisma from '../prisma';
import logger from '../config/logger';

export const createTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const team = await prisma.team.create({
      data: {
        name,
        description,
        users: {
          connect: { id: userId }
        }
      },
    });

    res.status(201).json({ success: true, data: team });
  } catch (error) {
    logger.error({ err: error }, 'Error creating team:');
    res.status(500).json({ success: false, error: 'Failed to create team.' });
  }
};

export const getTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        users: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true }
        }
      }
    });

    if (!team) {
      res.status(404).json({ success: false, error: 'Team not found' });
      return;
    }

    res.json({ success: true, data: team });
  } catch (error) {
    logger.error({ err: error }, 'Error fetching team:');
    res.status(500).json({ success: false, error: 'Failed to fetch team.' });
  }
};

export const inviteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found with this email.' });
      return;
    }

    const team = await prisma.team.update({
      where: { id },
      data: {
        users: {
          connect: { id: user.id }
        }
      },
      include: {
        users: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true }
        }
      }
    });

    res.json({ success: true, data: team });
  } catch (error) {
    logger.error({ err: error }, 'Error inviting user:');
    res.status(500).json({ success: false, error: 'Failed to invite user.' });
  }
};
