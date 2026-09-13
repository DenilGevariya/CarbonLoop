import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getMarketplaceListings, 
  getMarketplaceStats, 
  getMySupplyListings, 
  getListingDetail, 
  createListing, 
  updateListing, 
  publishListing, 
  pauseListing, 
  resumeListing, 
  archiveListing, 
  markExhaustedListing 
} from '../api/listingsApi';
import type { ListingFilterParams, CreateListingInput, UpdateListingInput } from '../types/listing';

function getApiErrorMessage(response: { error?: unknown }) {
  const error = response.error;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return 'The listing request could not be completed.';
}

export function useMarketplaceListings(filters: ListingFilterParams = {}) {
  return useQuery({
    queryKey: ['marketplaceListings', filters],
    queryFn: async () => {
      const res = await getMarketplaceListings(filters);
      if (!res.success) throw new Error((res as any).error?.message || 'Failed to load marketplace listings');
      // Return full response so consumers can access data/items and pagination
      const { success: _s, error: _e, ...rest } = res as any;
      return rest as { data?: any[]; items?: any[]; pagination?: any };
    },
  });
}

export function useMarketplaceStats() {
  return useQuery({
    queryKey: ['marketplaceStats'],
    queryFn: async () => {
      const res = await getMarketplaceStats();
      if (!res.success) throw new Error(res.error?.message || 'Failed to load marketplace stats');
      return res.data;
    },
  });
}

export function useMySupplyListings(filters: ListingFilterParams = {}) {
  return useQuery({
    queryKey: ['mySupplyListings', filters],
    queryFn: async () => {
      const res = await getMySupplyListings(filters);
      if (!res.success) throw new Error((res as any).error?.message || 'Failed to load supply listings');
      // Return full response so consumers can access data/items, stats, and pagination
      const { success: _s, error: _e, ...rest } = res as any;
      return rest as { data?: any[]; items?: any[]; stats?: any; pagination?: any };
    },
  });
}

export function useListingDetail(identifier?: string) {
  return useQuery({
    queryKey: ['listingDetail', identifier],
    queryFn: async () => {
      if (!identifier) return null;
      const res = await getListingDetail(identifier);
      if (!res.success) throw new Error(res.error?.message || 'Listing not found');
      return res.data;
    },
    enabled: !!identifier,
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateListingInput) => {
      const response = await createListing(input);
      if (!response.success) {
        throw new Error(getApiErrorMessage(response));
      }
      return response;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['mySupplyListings'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['marketplaceListings'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['marketplaceStats'], refetchType: 'all' }),
      ]);
    },
  });
}

export function useUpdateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateListingInput }) => {
      const response = await updateListing(id, input);
      if (!response.success) {
        throw new Error(getApiErrorMessage(response));
      }
      return response;
    },
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['listingDetail', variables.id] }),
        queryClient.invalidateQueries({ queryKey: ['mySupplyListings'] }),
        queryClient.invalidateQueries({ queryKey: ['marketplaceListings'] }),
      ]);
    },
  });
}

export function useListingStatusAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action, reason }: { id: string; action: 'publish' | 'pause' | 'resume' | 'archive' | 'exhausted'; reason?: string }) => {
      let response;
      switch (action) {
        case 'publish': response = await publishListing(id); break;
        case 'pause': response = await pauseListing(id, reason); break;
        case 'resume': response = await resumeListing(id); break;
        case 'archive': response = await archiveListing(id, reason); break;
        case 'exhausted': response = await markExhaustedListing(id, reason); break;
        default: throw new Error('Unknown action');
      }
      if (!response.success) {
        throw new Error(getApiErrorMessage(response));
      }
      return response;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['mySupplyListings'] }),
        queryClient.invalidateQueries({ queryKey: ['marketplaceListings'] }),
        queryClient.invalidateQueries({ queryKey: ['marketplaceStats'] }),
        queryClient.invalidateQueries({ queryKey: ['listingDetail'] }),
      ]);
    },
  });
}
