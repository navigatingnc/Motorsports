/**
 * Debrief Service — Phase 26
 *
 * Wraps the OpenAI-compatible LLM API to generate natural-language coaching
 * reports from lap telemetry data.  The service is intentionally stateless:
 * conversation history is persisted in the `debriefs` table and passed back
 * in full on every follow-up request so the model has full context.
 */
import OpenAI from 'openai';
import logger from '../config/logger';
import type { DebriefMessage } from '../types/debrief.types';

// ── OpenAI client ─────────────────────────────────────────────────────────────
// Reads OPENAI_API_KEY and OPENAI_BASE_URL from the environment automatically.
// Falls back gracefully when the key is absent (returns a stub response).
const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'] ?? '',
  baseURL: process.env['OPENAI_BASE_URL'] ?? 'https://api.openai.com/v1',
});

const MODEL = process.env['OPENAI_MODEL'] ?? 'gpt-4.1-mini';

// ── System prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an expert motorsport performance coach and data engineer.
Your role is to analyse lap telemetry data and provide clear, actionable coaching advice.
When given telemetry data you will:
1. Identify the three most impactful areas for lap time improvement.
2. Explain each finding in plain language a racing driver can act on immediately.
3. Reference specific telemetry channels (speed, throttle, brake, RPM, gear, GPS) where relevant.
4. Keep the initial report concise — use bullet points and short paragraphs.
5. Invite the driver to ask follow-up questions about any specific corner or phase.
Always be encouraging and constructive. Avoid jargon without explanation.`;

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Format raw telemetry statistics into a compact text block for the LLM prompt.
 * We summarise rather than dump every sample to stay within context limits.
 */
export function buildTelemetrySummary(lapMeta: {
  lapNumber: number;
  lapTimeMs: number;
  sessionType: string;
  driver: { user: { firstName: string; lastName: string } };
  vehicle: { make: string; model: string; year: number };
  event: { name: string; venue: string };
  sampleCount: number;
  stats: {
    maxSpeed: number | null;
    avgSpeed: number | null;
    maxRpm: number | null;
    avgThrottle: number | null;
    avgBrake: number | null;
    coastingPct: number | null;
    fullThrottlePct: number | null;
    heavyBrakingPct: number | null;
  };
}): string {
  const ms = lapMeta.lapTimeMs;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const millis = ms % 1000;
  const lapTimeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;

  const s = lapMeta.stats;

  return `
=== LAP TELEMETRY SUMMARY ===
Driver: ${lapMeta.driver.user.firstName} ${lapMeta.driver.user.lastName}
Vehicle: ${lapMeta.vehicle.year} ${lapMeta.vehicle.make} ${lapMeta.vehicle.model}
Event: ${lapMeta.event.name} @ ${lapMeta.event.venue}
Session: ${lapMeta.sessionType}  |  Lap #${lapMeta.lapNumber}  |  Lap Time: ${lapTimeStr}
Telemetry samples: ${lapMeta.sampleCount}

--- SPEED ---
Max speed:   ${s.maxSpeed != null ? `${s.maxSpeed.toFixed(1)} km/h` : 'N/A'}
Avg speed:   ${s.avgSpeed != null ? `${s.avgSpeed.toFixed(1)} km/h` : 'N/A'}

--- THROTTLE ---
Avg throttle:        ${s.avgThrottle != null ? `${s.avgThrottle.toFixed(1)}%` : 'N/A'}
Full-throttle time:  ${s.fullThrottlePct != null ? `${s.fullThrottlePct.toFixed(1)}% of lap` : 'N/A'}
Coasting time:       ${s.coastingPct != null ? `${s.coastingPct.toFixed(1)}% of lap` : 'N/A'}

--- BRAKING ---
Avg brake pressure:  ${s.avgBrake != null ? `${s.avgBrake.toFixed(1)}%` : 'N/A'}
Heavy braking time:  ${s.heavyBrakingPct != null ? `${s.heavyBrakingPct.toFixed(1)}% of lap` : 'N/A'}

--- ENGINE ---
Max RPM:  ${s.maxRpm != null ? `${s.maxRpm.toFixed(0)} RPM` : 'N/A'}
=== END OF SUMMARY ===
`.trim();
}

// ── Core LLM call ─────────────────────────────────────────────────────────────

/**
 * Send the conversation history to the LLM and return the assistant reply.
 * Throws on network / API errors so the controller can return a 502.
 */
export async function callLLM(messages: DebriefMessage[]): Promise<string> {
  if (!process.env['OPENAI_API_KEY']) {
    logger.warn('OPENAI_API_KEY is not set — returning stub debrief response');
    return (
      '**AI coaching is not configured.**\n\n' +
      'To enable AI-powered debriefs, set the `OPENAI_API_KEY` environment variable ' +
      'on the backend server.  Once configured, this section will contain a detailed ' +
      'natural-language analysis of your lap telemetry with actionable coaching advice.'
    );
  }

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: messages as OpenAI.Chat.ChatCompletionMessageParam[],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const content = response.choices[0]?.message?.content ?? '';
    logger.info(
      { model: MODEL, promptTokens: response.usage?.prompt_tokens, completionTokens: response.usage?.completion_tokens },
      'LLM debrief generated',
    );
    return content;
  } catch (err) {
    logger.error({ err }, 'LLM API call failed');
    throw err;
  }
}

/**
 * Build the initial conversation for a new debrief session.
 * Returns the full messages array (system + user) ready to send to the LLM.
 */
export function buildInitialMessages(telemetrySummary: string): DebriefMessage[] {
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: `Please analyse the following lap telemetry data and provide a coaching debrief:\n\n${telemetrySummary}`,
    },
  ];
}

/**
 * Append a follow-up user message to an existing conversation.
 */
export function appendUserMessage(
  existingMessages: DebriefMessage[],
  userMessage: string,
): DebriefMessage[] {
  return [...existingMessages, { role: 'user', content: userMessage }];
}
