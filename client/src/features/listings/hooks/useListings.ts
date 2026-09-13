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
    mutationFn: (input: CreateListingInput) => createListing(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['mySupplyListings'] }),
        queryClient.invalidateQueries({ queryKey: ['marketplaceListings'] }),
        queryClient.invalidateQueries({ queryKey: ['marketplaceStats'] }),
      ]);
    },
  });
}

export function useUpdateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateListingInput }) => updateListing(id, input),
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
      switch (action) {
        case 'publish': return publishListing(id);
        case 'pause': return pauseListing(id, reason);
        case 'resume': return resumeListing(id);
        case 'archive': return archiveListing(id, reason);
        case 'exhausted': return markExhaustedListing(id, reason);
        default: throw new Error('Unknown action');
      }
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
