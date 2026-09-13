import { apiRequest } from '@/lib/api';
import type { 
  ListingDTO, 
  ListingFilterParams, 
  MarketplaceStatsDTO, 
  EmitterSupplyStatsDTO, 
  CreateListingInput, 
  UpdateListingInput 
} from '../types/listing';

export async function getMarketplaceListings(params: ListingFilterParams = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.search) queryParams.set('search', params.search);
  if (params.location) queryParams.set('location', params.location);
  if (params.organizationId) queryParams.set('organizationId', params.organizationId);
  if (params.facilityId) queryParams.set('facilityId', params.facilityId);
  if (params.minQuantity !== undefined) queryParams.set('minQuantity', params.minQuantity.toString());
  if (params.maxQuantity !== undefined) queryParams.set('maxQuantity', params.maxQuantity.toString());
  if (params.minPurity !== undefined) queryParams.set('minPurity', params.minPurity.toString());
  if (params.maxPurity !== undefined) queryParams.set('maxPurity', params.maxPurity.toString());
  if (params.minPrice !== undefined) queryParams.set('minPrice', params.minPrice.toString());
  if (params.maxPrice !== undefined) queryParams.set('maxPrice', params.maxPrice.toString());
  if (params.physicalForm) queryParams.set('physicalForm', params.physicalForm);
  if (params.deliveryAvailable !== undefined) queryParams.set('deliveryAvailable', params.deliveryAvailable.toString());
  if (params.pickupAvailable !== undefined) queryParams.set('pickupAvailable', params.pickupAvailable.toString());
  if (params.page) queryParams.set('page', params.page.toString());
  if (params.limit) queryParams.set('limit', params.limit.toString());
  if (params.sort) queryParams.set('sort', params.sort);

  const qs = queryParams.toString();
  return apiRequest<{
    items?: ListingDTO[];
    data?: ListingDTO[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>(`/listings${qs ? `?${qs}` : ''}`);
}

export async function getMarketplaceStats() {
  return apiRequest<MarketplaceStatsDTO>('/listings/stats');
}

export async function getMySupplyListings(params: ListingFilterParams = {}) {
  const queryParams = new URLSearchParams();
  if (params.status) queryParams.set('status', params.status);
  if (params.search) queryParams.set('search', params.search);
  if (params.page) queryParams.set('page', params.page.toString());
  if (params.limit) queryParams.set('limit', params.limit.toString());

  const qs = queryParams.toString();
  return apiRequest<{
    items?: ListingDTO[];
    data?: ListingDTO[];
    stats?: EmitterSupplyStatsDTO;
    pagination?: { page: number; limit: number; total: number; totalPages: number };
  }>(`/listings/my-supply${qs ? `?${qs}` : ''}`);
}

export async function getListingDetail(identifier: string) {
  return apiRequest<ListingDTO>(`/listings/${identifier}`);
}

export async function createListing(input: CreateListingInput) {
  return apiRequest<ListingDTO>('/listings', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateListing(id: string, input: UpdateListingInput) {
  return apiRequest<ListingDTO>(`/listings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function publishListing(id: string) {
  return apiRequest<ListingDTO>(`/listings/${id}/publish`, {
    method: 'POST',
  });
}

export async function pauseListing(id: string, reason?: string) {
  return apiRequest<ListingDTO>(`/listings/${id}/pause`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export async function resumeListing(id: string) {
  return apiRequest<ListingDTO>(`/listings/${id}/resume`, {
    method: 'POST',
  });
}

export async function archiveListing(id: string, reason?: string) {
  return apiRequest<ListingDTO>(`/listings/${id}/archive`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export async function markExhaustedListing(id: string, reason?: string) {
  return apiRequest<ListingDTO>(`/listings/${id}/mark-exhausted`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}
