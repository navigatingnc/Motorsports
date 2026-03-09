import { Request, Response } from 'express';
import prisma from '../prisma';
import logger from '../config/logger';
import type { BatchIngestDto } from '../types/telemetry.types';

// ---------------------------------------------------------------------------
// POST /api/telemetry/batch
// ---------------------------------------------------------------------------

/**
 * Bulk-ingest telemetry samples for a single lap.
 *
 * Accepts a JSON body of the shape:
 * ```json
 * {
 *   "lapTimeId": "<uuid>",
 *   "samples": [
 *     { "offsetMs": 0, "speed": 0, "rpm": 3200, "throttle": 0, "brake": 100, "gear": 1, "gpsLat": 51.5, "gpsLng": -0.1 },
 *     ...
 *   ]
 * }
 * ```
 *
 * Uses `createMany` for a single round-trip to the database, making it
 * suitable for high-frequency data from real data loggers.
 */
export const batchIngestTelemetry = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { lapTimeId, samples } = req.body as BatchIngestDto;

    // --- Validate required fields ---
    if (!lapTimeId || typeof lapTimeId !== 'string') {
      res.status(400).json({ success: false, error: '`lapTimeId` is required and must be a string.' });
      return;
    }
    if (!Array.isArray(samples) || samples.length === 0) {
      res.status(400).json({ success: false, error: '`samples` must be a non-empty array.' });
      return;
    }

    // --- Validate each sample has at minimum an offsetMs ---
    for (const s of samples) {
      if (typeof s.offsetMs !== 'number') {
        res.status(400).json({
          success: false,
          error: 'Every sample must include a numeric `offsetMs` field.',
        });
        return;
      }
    }

    // --- Verify the referenced lap exists ---
    const lap = await prisma.lapTime.findUnique({ where: { id: lapTimeId } });
    if (!lap) {
      res.status(404).json({ success: false, error: `LapTime with id "${lapTimeId}" not found.` });
      return;
    }

    // --- Bulk insert via createMany (single DB round-trip) ---
    const result = await prisma.telemetry.createMany({
      data: samples.map((s) => ({
        lapTimeId,
        offsetMs: s.offsetMs,
        speed:    s.speed    ?? null,
        rpm:      s.rpm      ?? null,
        throttle: s.throttle ?? null,
        brake:    s.brake    ?? null,
        gear:     s.gear     ?? null,
        gpsLat:   s.gpsLat   ?? null,
        gpsLng:   s.gpsLng   ?? null,
      })),
      skipDuplicates: false,
    });

    logger.info(
      { lapTimeId, count: result.count },
      'Telemetry batch ingested',
    );

    res.status(201).json({
      success: true,
      message: `${result.count} telemetry sample(s) ingested successfully.`,
      data: { lapTimeId, count: result.count },
    });
  } catch (error) {
    logger.error({ err: error }, 'Error ingesting telemetry batch');
    res.status(500).json({ success: false, error: 'Failed to ingest telemetry data.' });
  }
};

// ---------------------------------------------------------------------------
// GET /api/telemetry/:lapTimeId
// ---------------------------------------------------------------------------

/**
 * Retrieve the full telemetry trace for a given lap, ordered by offsetMs.
 *
 * Returns all samples sorted chronologically so that the frontend can render
 * synchronized multi-channel charts without additional client-side sorting.
 */
export const getTelemetryByLap = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { lapTimeId } = req.params as { lapTimeId: string };

    // --- Verify the referenced lap exists ---
    const lap = await prisma.lapTime.findUnique({
      where: { id: lapTimeId },
      select: {
        id: true,
        lapNumber: true,
        lapTimeMs: true,
        sessionType: true,
        driver: {
          select: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
        vehicle: { select: { make: true, model: true, year: true } },
        event:   { select: { name: true, venue: true } },
      },
    });

    if (!lap) {
      res.status(404).json({ success: false, error: `LapTime with id "${lapTimeId}" not found.` });
      return;
    }

    const samples = await prisma.telemetry.findMany({
      where: { lapTimeId },
      orderBy: { offsetMs: 'asc' },
      select: {
        id:        true,
        lapTimeId: true,
        offsetMs:  true,
        speed:     true,
        rpm:       true,
        throttle:  true,
        brake:     true,
        gear:      true,
        gpsLat:    true,
        gpsLng:    true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      data: {
        lap,
        sampleCount: samples.length,
        samples,
      },
    });
  } catch (error) {
    logger.error({ err: error }, 'Error retrieving telemetry');
    res.status(500).json({ success: false, error: 'Failed to retrieve telemetry data.' });
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/telemetry/:lapTimeId
// ---------------------------------------------------------------------------

/**
 * Delete all telemetry samples for a given lap.
 * Useful for re-uploading corrected data from a logger.
 */
export const deleteTelemetryByLap = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { lapTimeId } = req.params as { lapTimeId: string };

    const lap = await prisma.lapTime.findUnique({ where: { id: lapTimeId } });
    if (!lap) {
      res.status(404).json({ success: false, error: `LapTime with id "${lapTimeId}" not found.` });
      return;
    }

    const result = await prisma.telemetry.deleteMany({ where: { lapTimeId } });

    logger.info({ lapTimeId, count: result.count }, 'Telemetry deleted');

    res.json({
      success: true,
      message: `${result.count} telemetry sample(s) deleted.`,
      data: { lapTimeId, count: result.count },
    });
  } catch (error) {
    logger.error({ err: error }, 'Error deleting telemetry');
    res.status(500).json({ success: false, error: 'Failed to delete telemetry data.' });
  }
};
