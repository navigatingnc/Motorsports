/**
 * Debrief Controller — Phase 26
 *
 * Handles AI-powered lap coaching debrief requests.
 *
 * Routes:
 *   POST   /api/debriefs/analyze          — Create or continue a debrief session
 *   GET    /api/debriefs/lap/:lapTimeId   — List all debriefs for a lap
 *   GET    /api/debriefs/:id              — Get a single debrief with full messages
 *   DELETE /api/debriefs/:id              — Delete a debrief session
 */
import { Request, Response } from 'express';
import prisma from '../prisma';
import logger from '../config/logger';
import {
  buildTelemetrySummary,
  buildInitialMessages,
  appendUserMessage,
  callLLM,
} from '../services/debrief.service';
import type { AnalyzeDebriefDto, DebriefMessage } from '../types/debrief.types';

// ── POST /api/debriefs/analyze ────────────────────────────────────────────────
/**
 * Create a new debrief or continue an existing conversation.
 *
 * - If `debriefId` is provided, the existing conversation is loaded, the new
 *   `userMessage` is appended, and the LLM is called with the full history.
 * - If `debriefId` is absent, a fresh debrief is created using the lap's
 *   telemetry statistics as the initial prompt.
 */
export const analyzeDebrief = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { lapTimeId, userMessage, debriefId } = req.body as AnalyzeDebriefDto;

    if (!lapTimeId) {
      res.status(400).json({ success: false, error: '`lapTimeId` is required.' });
      return;
    }

    // ── Verify the lap exists and load telemetry ──────────────────────────────
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
        event: { select: { name: true, venue: true } },
        telemetry: {
          select: {
            speed: true,
            rpm: true,
            throttle: true,
            brake: true,
          },
        },
      },
    });

    if (!lap) {
      res.status(404).json({ success: false, error: `LapTime "${lapTimeId}" not found.` });
      return;
    }

    // ── Compute telemetry statistics ──────────────────────────────────────────
    const samples = lap.telemetry;
    const sampleCount = samples.length;

    const speeds    = (samples.map((s: { speed: number | null }) => s.speed) as (number | null)[]).filter((v: number | null): v is number => v != null);
    const rpms      = (samples.map((s: { rpm: number | null }) => s.rpm) as (number | null)[]).filter((v: number | null): v is number => v != null);
    const throttles = (samples.map((s: { throttle: number | null }) => s.throttle) as (number | null)[]).filter((v: number | null): v is number => v != null);
    const brakes    = (samples.map((s: { brake: number | null }) => s.brake) as (number | null)[]).filter((v: number | null): v is number => v != null);

    const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
    const max = (arr: number[]) => arr.length ? Math.max(...arr) : null;
    const pct = (arr: number[], threshold: number, above: boolean) =>
      arr.length
        ? (arr.filter((v) => (above ? v >= threshold : v < threshold)).length / arr.length) * 100
        : null;

    const stats = {
      maxSpeed:         max(speeds),
      avgSpeed:         avg(speeds),
      maxRpm:           max(rpms),
      avgThrottle:      avg(throttles),
      avgBrake:         avg(brakes),
      fullThrottlePct:  pct(throttles, 95, true),
      coastingPct:      pct(throttles, 5, false),
      heavyBrakingPct:  pct(brakes, 70, true),
    };

    const telemetrySummary = buildTelemetrySummary({
      lapNumber:   lap.lapNumber,
      lapTimeMs:   lap.lapTimeMs,
      sessionType: lap.sessionType,
      driver:      lap.driver,
      vehicle:     lap.vehicle,
      event:       lap.event,
      sampleCount,
      stats,
    });

    // ── Build or continue the conversation ────────────────────────────────────
    let messages: DebriefMessage[];
    let existingDebrief: { id: string; messages: unknown; title: string } | null = null;

    if (debriefId) {
      // Continue an existing conversation
      existingDebrief = await prisma.debrief.findUnique({
        where: { id: debriefId },
        select: { id: true, messages: true, title: true },
      });

      if (!existingDebrief) {
        res.status(404).json({ success: false, error: `Debrief "${debriefId}" not found.` });
        return;
      }

      if (!userMessage?.trim()) {
        res.status(400).json({
          success: false,
          error: '`userMessage` is required when continuing an existing debrief.',
        });
        return;
      }

      messages = appendUserMessage(
        existingDebrief.messages as DebriefMessage[],
        userMessage.trim(),
      );
    } else {
      // Start a new debrief
      messages = buildInitialMessages(telemetrySummary);
    }

    // ── Call the LLM ──────────────────────────────────────────────────────────
    const assistantReply = await callLLM(messages);
    const updatedMessages: DebriefMessage[] = [
      ...messages,
      { role: 'assistant', content: assistantReply },
    ];

    // ── Persist the debrief ───────────────────────────────────────────────────
    let debrief;
    if (existingDebrief) {
      debrief = await prisma.debrief.update({
        where: { id: existingDebrief.id },
        data: { messages: updatedMessages as object[] },
      });
    } else {
      // Auto-generate a title from the lap metadata
      const title = `Lap ${lap.lapNumber} — ${lap.sessionType} @ ${lap.event.venue}`;
      debrief = await prisma.debrief.create({
        data: {
          lapTimeId,
          userId,
          messages: updatedMessages as object[],
          title,
        },
      });
    }

    logger.info({ debriefId: debrief.id, lapTimeId, userId }, 'Debrief session updated');

    res.status(existingDebrief ? 200 : 201).json({
      success: true,
      data: {
        id:           debrief.id,
        lapTimeId:    debrief.lapTimeId,
        userId:       debrief.userId,
        title:        debrief.title,
        messages:     debrief.messages,
        createdAt:    debrief.createdAt,
        updatedAt:    debrief.updatedAt,
        latestReply:  assistantReply,
      },
    });
  } catch (error) {
    logger.error({ err: error }, 'Error generating debrief');
    res.status(502).json({
      success: false,
      error: 'Failed to generate debrief. The AI service may be temporarily unavailable.',
    });
  }
};

// ── GET /api/debriefs/lap/:lapTimeId ─────────────────────────────────────────
/**
 * Return all debrief sessions for a given lap, ordered newest first.
 * Messages are excluded from the list to keep the payload small.
 */
export const getDebriefsByLap = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lapTimeId } = req.params as { lapTimeId: string };

    const lap = await prisma.lapTime.findUnique({ where: { id: lapTimeId } });
    if (!lap) {
      res.status(404).json({ success: false, error: `LapTime "${lapTimeId}" not found.` });
      return;
    }

    const debriefs = await prisma.debrief.findMany({
      where: { lapTimeId },
      orderBy: { createdAt: 'desc' },
      select: {
        id:        true,
        lapTimeId: true,
        userId:    true,
        title:     true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({ success: true, data: debriefs });
  } catch (error) {
    logger.error({ err: error }, 'Error fetching debriefs by lap');
    res.status(500).json({ success: false, error: 'Failed to fetch debriefs.' });
  }
};

// ── GET /api/debriefs/:id ─────────────────────────────────────────────────────
/**
 * Return a single debrief including the full conversation messages.
 */
export const getDebriefById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    const debrief = await prisma.debrief.findUnique({ where: { id } });
    if (!debrief) {
      res.status(404).json({ success: false, error: `Debrief "${id}" not found.` });
      return;
    }

    res.json({ success: true, data: debrief });
  } catch (error) {
    logger.error({ err: error }, 'Error fetching debrief');
    res.status(500).json({ success: false, error: 'Failed to fetch debrief.' });
  }
};

// ── DELETE /api/debriefs/:id ──────────────────────────────────────────────────
/**
 * Delete a debrief session.  Only the owner or an admin may delete.
 */
export const deleteDebrief = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    const { id } = req.params as { id: string };

    const debrief = await prisma.debrief.findUnique({ where: { id } });
    if (!debrief) {
      res.status(404).json({ success: false, error: `Debrief "${id}" not found.` });
      return;
    }

    if (debrief.userId !== userId && userRole !== 'admin') {
      res.status(403).json({ success: false, error: 'Access denied.' });
      return;
    }

    await prisma.debrief.delete({ where: { id } });
    logger.info({ debriefId: id, userId }, 'Debrief deleted');

    res.json({ success: true, message: 'Debrief deleted successfully.' });
  } catch (error) {
    logger.error({ err: error }, 'Error deleting debrief');
    res.status(500).json({ success: false, error: 'Failed to delete debrief.' });
  }
};
