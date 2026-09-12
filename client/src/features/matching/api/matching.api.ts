import { apiClient } from '@/api/client';
import type { MatchRecord } from '../types/matching.types';

export const matchingApi = {
  getMatchById: async (matchId: string): Promise<MatchRecord> => {
    return apiClient.get<MatchRecord>(`/matches/${matchId}`);
  },

  getRequirementMatches: async (requirementId: string, minScore = 0): Promise<MatchRecord[]> => {
    return apiClient.get<MatchRecord[]>(`/matches/requirements/${requirementId}/matches?minScore=${minScore}`);
  },

  getListingMatches: async (listingId: string, minScore = 0): Promise<MatchRecord[]> => {
    return apiClient.get<MatchRecord[]>(`/matches/listings/${listingId}/matches?minScore=${minScore}`);
  },

  generateMatches: async (params: { requirementId?: string; listingId?: string }): Promise<{ generatedMatches: MatchRecord[] }> => {
    return apiClient.post<{ generatedMatches: MatchRecord[] }>('/matches/generate', params);
  },
};
