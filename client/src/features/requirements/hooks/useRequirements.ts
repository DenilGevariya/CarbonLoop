import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requirementsApi } from '../api/requirements.api';
import type {
  RequirementFilterParams,
  CreateRequirementInput,
  UpdateRequirementInput,
} from '../types/requirement';

export const REQUIREMENT_KEYS = {
  all: ['requirements'] as const,
  lists: () => [...REQUIREMENT_KEYS.all, 'list'] as const,
  list: (filters: RequirementFilterParams) => [...REQUIREMENT_KEYS.lists(), filters] as const,
  myLists: () => [...REQUIREMENT_KEYS.all, 'my-list'] as const,
  myList: (filters: RequirementFilterParams) => [...REQUIREMENT_KEYS.myLists(), filters] as const,
  details: () => [...REQUIREMENT_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...REQUIREMENT_KEYS.details(), id] as const,
  stats: () => [...REQUIREMENT_KEYS.all, 'stats'] as const,
  utilizationTypes: () => [...REQUIREMENT_KEYS.all, 'utilization-types'] as const,
};

// Public demand marketplace hook
export function useRequirements(filters: RequirementFilterParams = {}) {
  return useQuery({
    queryKey: REQUIREMENT_KEYS.list(filters),
    queryFn: async () => {
      const res = await requirementsApi.getPublicRequirements(filters);
      if (!res.success) {
        throw new Error((res as any).error?.message || 'Failed to fetch CO₂ requirements');
      }
      // Backend spreads { items, pagination } at top level
      return res as { items?: any[]; data?: any[]; pagination?: any };
    },
  });
}

// My organization requirements hook
export function useMyRequirements(filters: RequirementFilterParams = {}) {
  return useQuery({
    queryKey: REQUIREMENT_KEYS.myList(filters),
    queryFn: async () => {
      const res = await requirementsApi.getMyRequirements(filters);
      if (!res.success) {
        throw new Error((res as any).error?.message || 'Failed to fetch organization requirements');
      }
      // Backend spreads { items, pagination } at top level
      return res as { items?: any[]; data?: any[]; pagination?: any };
    },
  });
}

// Requirement details hook
export function useRequirement(idOrCode?: string) {
  return useQuery({
    queryKey: REQUIREMENT_KEYS.detail(idOrCode || ''),
    queryFn: async () => {
      if (!idOrCode) return null;
      const res = await requirementsApi.getRequirementById(idOrCode);
      if (!res.success || !res.data) {
        throw new Error(res.error?.message || 'Failed to fetch requirement details');
      }
      return res.data;
    },
    enabled: !!idOrCode,
  });
}

// Stats hook
export function useRequirementStats() {
  return useQuery({
    queryKey: REQUIREMENT_KEYS.stats(),
    queryFn: async () => {
      const res = await requirementsApi.getStats();
      if (!res.success) {
        throw new Error((res as any).error?.message || 'Failed to fetch demand statistics');
      }
      return (res as any).data;
    },
  });
}

// Utilization Taxonomy hook
export function useUtilizationTypes() {
  return useQuery({
    queryKey: REQUIREMENT_KEYS.utilizationTypes(),
    queryFn: async () => {
      const res = await requirementsApi.getUtilizationTypes();
      if (!res.success) {
        throw new Error((res as any).error?.message || 'Failed to fetch utilization categories');
      }
      return (res as any).data;
    },
  });
}

// Create Requirement Mutation
export function useCreateRequirement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateRequirementInput) => {
      const res = await requirementsApi.createRequirement(input);
      if (!res.success) {
        throw new Error((res as any).error?.message || 'Failed to create requirement');
      }
      return (res as any).data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: REQUIREMENT_KEYS.all, refetchType: 'all' });
    },
  });
}

// Update Requirement Mutation
export function useUpdateRequirement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateRequirementInput }) => {
      const res = await requirementsApi.updateRequirement(id, data);
      if (!res.success) {
        throw new Error((res as any).error?.message || 'Failed to update requirement');
      }
      return (res as any).data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: REQUIREMENT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: REQUIREMENT_KEYS.detail(variables.id) });
    },
  });
}

// Lifecycle mutations
export function usePublishRequirement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await requirementsApi.publishRequirement(id);
      if (!res.success) {
        throw new Error(res.error?.message || 'Failed to publish requirement');
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REQUIREMENT_KEYS.all });
    },
  });
}

export function usePauseRequirement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const res = await requirementsApi.pauseRequirement(id, reason);
      if (!res.success) {
        throw new Error(res.error?.message || 'Failed to pause requirement');
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REQUIREMENT_KEYS.all });
    },
  });
}

export function useResumeRequirement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await requirementsApi.resumeRequirement(id);
      if (!res.success) {
        throw new Error(res.error?.message || 'Failed to resume requirement');
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REQUIREMENT_KEYS.all });
    },
  });
}

export function useArchiveRequirement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const res = await requirementsApi.archiveRequirement(id, reason);
      if (!res.success) {
        throw new Error(res.error?.message || 'Failed to archive requirement');
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REQUIREMENT_KEYS.all });
    },
  });
}

export function useFulfillRequirement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const res = await requirementsApi.markFulfilled(id, reason);
      if (!res.success) {
        throw new Error(res.error?.message || 'Failed to mark requirement fulfilled');
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REQUIREMENT_KEYS.all });
    },
  });
}
