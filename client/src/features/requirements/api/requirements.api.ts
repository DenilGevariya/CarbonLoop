import { apiRequest } from '@/lib/api';
import type {
  BuyerRequirement,
  RequirementFilterParams,
  CreateRequirementInput,
  UpdateRequirementInput,
  DemandStats,
  UtilizationType,
} from '../types/requirement';

export const requirementsApi = {
  // Public demand search
  async getPublicRequirements(params: RequirementFilterParams = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });

    const endpoint = `/requirements?${query.toString()}`;
    return apiRequest<{
      items?: BuyerRequirement[];
      data?: BuyerRequirement[];
      pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(endpoint);
  },

  // My organization requirements
  async getMyRequirements(params: RequirementFilterParams = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });

    const endpoint = `/requirements/my-requirements?${query.toString()}`;
    return apiRequest<{
      items?: BuyerRequirement[];
      data?: BuyerRequirement[];
      pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(endpoint);
  },

  // Public stats
  async getStats() {
    return apiRequest<DemandStats>('/requirements/stats');
  },

  // Utilization Types taxonomy
  async getUtilizationTypes() {
    return apiRequest<UtilizationType[]>('/requirements/utilization-types');
  },

  // Single Requirement Detail
  async getRequirementById(idOrCode: string) {
    return apiRequest<BuyerRequirement>(`/requirements/${idOrCode}`);
  },

  // Create Requirement
  async createRequirement(input: CreateRequirementInput) {
    return apiRequest<BuyerRequirement>('/requirements', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  // Update Requirement
  async updateRequirement(id: string, input: UpdateRequirementInput) {
    return apiRequest<BuyerRequirement>(`/requirements/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  // Lifecycle status actions
  async publishRequirement(id: string) {
    return apiRequest<BuyerRequirement>(`/requirements/${id}/publish`, {
      method: 'POST',
    });
  },

  async pauseRequirement(id: string, reason?: string) {
    return apiRequest<BuyerRequirement>(`/requirements/${id}/pause`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  async resumeRequirement(id: string) {
    return apiRequest<BuyerRequirement>(`/requirements/${id}/resume`, {
      method: 'POST',
    });
  },

  async archiveRequirement(id: string, reason?: string) {
    return apiRequest<BuyerRequirement>(`/requirements/${id}/archive`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  async markFulfilled(id: string, reason?: string) {
    return apiRequest<BuyerRequirement>(`/requirements/${id}/mark-fulfilled`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
};
