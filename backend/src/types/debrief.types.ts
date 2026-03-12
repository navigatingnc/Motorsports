/**
 * Type definitions for the AI-Powered Lap Time Coaching & Debrief feature.
 * Phase 26 — Motorsports Management
 */

/** A single message in the debrief conversation */
export interface DebriefMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** Request body for POST /api/debriefs/analyze */
export interface AnalyzeDebriefDto {
  /** The lap time ID to analyse */
  lapTimeId: string;
  /** Optional follow-up question from the driver (omit for the initial analysis) */
  userMessage?: string;
  /** Existing debrief ID to continue a conversation (omit to start a new one) */
  debriefId?: string;
}

/** Lightweight debrief summary returned in list responses */
export interface DebriefSummary {
  id: string;
  lapTimeId: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Full debrief payload including the conversation messages */
export interface DebriefPayload extends DebriefSummary {
  messages: DebriefMessage[];
}
