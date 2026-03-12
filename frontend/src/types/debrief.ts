/**
 * Frontend type definitions for the AI-Powered Lap Time Coaching & Debrief feature.
 * Phase 26 — Motorsports Management
 */

/** A single message in the debrief conversation */
export interface DebriefMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** Lightweight debrief summary returned in list responses */
export interface DebriefSummary {
  id: string;
  lapTimeId: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

/** Full debrief payload including the conversation messages */
export interface Debrief extends DebriefSummary {
  messages: DebriefMessage[];
}

/** Response from POST /api/debriefs/analyze */
export interface AnalyzeDebriefResponse {
  id: string;
  lapTimeId: string;
  userId: string;
  title: string;
  messages: DebriefMessage[];
  createdAt: string;
  updatedAt: string;
  /** The most recent assistant reply — convenient for rendering without scanning messages */
  latestReply: string;
}

/** Request body for POST /api/debriefs/analyze */
export interface AnalyzeDebriefDto {
  lapTimeId: string;
  userMessage?: string;
  debriefId?: string;
}
