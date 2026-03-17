/**
 * Predict Controller — Phase 27
 *
 * Handles lap time prediction requests.
 */
import { Request, Response } from 'express';
import prisma from '../prisma';
import logger from '../config/logger';
import { PredictLapTimeDto, PredictedLapTime } from '../types/predict.types';
import { msToLapTimeString } from './analytics.controller';

/**
 * POST /api/predict/laptime
 * Predicts a lap time based on historical data, weather, and vehicle setup.
 */
export const predictLapTime = async (req: Request, res: Response): Promise<void> => {
  try {
    const { vehicleId, eventId, setupId } = req.body as PredictLapTimeDto;

    // 1. Fetch historical lap times for the given vehicle and event
    const historicalLaps = await prisma.lapTime.findMany({
      where: {
        vehicleId,
        eventId,
        isValid: true, // Only consider valid laps
      },
      orderBy: {
        lapTimeMs: 'asc',
      },
    });

    if (historicalLaps.length === 0) {
      res.status(404).json({
        success: false,
        error: 'No historical lap times found for this vehicle/event combination.',
      });
      return;
    }

    // 2. Fetch the target setup
    const targetSetup = await prisma.setupSheet.findUnique({
      where: { id: setupId },
    });

    if (!targetSetup) {
      res.status(404).json({ success: false, error: 'Target setup sheet not found.' });
      return;
    }

    // 3. Simple weighted average (for now, just a simple average)
    const totalLapTimeMs = historicalLaps.reduce((sum, lap) => sum + lap.lapTimeMs, 0);
    const averageLapTimeMs = totalLapTimeMs / historicalLaps.length;

    // 4. Determine confidence
    const confidence = historicalLaps.length >= 10 ? 'high' : historicalLaps.length >= 5 ? 'medium' : 'low';

    const result: PredictedLapTime = {
      predictedTimeMs: Math.round(averageLapTimeMs),
      predictedTimeFormatted: msToLapTimeString(Math.round(averageLapTimeMs)),
      confidence,
      contributingLaps: historicalLaps.length,
      message: `Prediction based on a simple average of ${historicalLaps.length} historical lap(s). More advanced modeling is under development.`,
    };

    res.json({ success: true, data: result });
  } catch (error) {
    logger.error({ err: error }, 'Error predicting lap time:');
    res.status(500).json({
      success: false,
      error: 'Failed to predict lap time.',
    });
  }
};
