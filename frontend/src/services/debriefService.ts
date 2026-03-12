/**
 * Debrief Service — Phase 26
 *
 * API client methods for the /api/debriefs endpoints.
 */
import api from './api';
import type {
  Debrief,
  DebriefSummary,
  AnalyzeDebriefDto,
  AnalyzeDebriefResponse,
} from '../types/debrief';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

/**
 * Create a new debrief or continue an existing conversation.
 *
 * - Pass only `lapTimeId` to start a fresh debrief.
 * - Pass `lapTimeId`, `debriefId`, and `userMessage` to continue a conversation.
 */
export const analyzeDebrief = async (dto: AnalyzeDebriefDto): Promise<AnalyzeDebriefResponse> => {
  const response = await api.post<ApiResponse<AnalyzeDebriefResponse>>(
    '/api/debriefs/analyze',
    dto,
  );
  return response.data.data;
};

/**
 * Fetch all debrief summaries for a given lap (messages excluded).
 */
export const getDebriefsByLap = async (lapTimeId: string): Promise<DebriefSummary[]> => {
  const response = await api.get<ApiResponse<DebriefSummary[]>>(
    `/api/debriefs/lap/${lapTimeId}`,
  );
  return response.data.data;
};

/**
 * Fetch a single debrief including the full conversation messages.
 */
export const getDebriefById = async (id: string): Promise<Debrief> => {
  const response = await api.get<ApiResponse<Debrief>>(`/api/debriefs/${id}`);
  return response.data.data;
};

/**
 * Delete a debrief session.
 */
export const deleteDebrief = async (id: string): Promise<void> => {
  await api.delete(`/api/debriefs/${id}`);
};
