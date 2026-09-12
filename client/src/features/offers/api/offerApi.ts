import { apiClient } from '@/api/client';

export interface OfferItem {
  id: string;
  inquiry_id: string;
  offer_number: string;
  parent_offer_id?: string;
  version: number;
  offered_by_organization_id: string;
  buyer_organization_id: string;
  seller_organization_id: string;
  offered_by_organization_name?: string;
  buyer_organization_name?: string;
  seller_organization_name?: string;
  listing_id: string;
  listing_title?: string;
  listing_purity?: number;
  listing_location?: string;
  quantity: number;
  quantity_unit: string;
  unit_price: number;
  currency: string;
  delivery_cost: number;
  total_estimated_cost: number;
  valid_until: string;
  message?: string;
  rejection_reason?: string;
  withdrawal_reason?: string;
  status: 'DRAFT' | 'SENT' | 'COUNTERED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN' | 'EXPIRED';
  version_history?: OfferItem[];
  created_at: string;
  updated_at: string;
}

export interface CreateOfferInput {
  inquiry_id: string;
  quantity: number;
  quantity_unit?: string;
  unit_price: number;
  currency?: string;
  delivery_cost?: number;
  valid_until: string;
  message?: string;
}

export interface CounterOfferInput {
  quantity?: number;
  unit_price: number;
  delivery_cost?: number;
  valid_until: string;
  message?: string;
}

export const offerApi = {
  createOffer: (input: CreateOfferInput) => apiClient.post<OfferItem>('/offers', input),
  getOffers: (role: 'sent' | 'received' | 'all' = 'all', status?: string) =>
    apiClient.get<OfferItem[]>(`/offers?role=${role}${status ? `&status=${status}` : ''}`),
  getOfferDetail: (id: string) => apiClient.get<OfferItem>(`/offers/${id}`),
  counterOffer: (id: string, input: CounterOfferInput) => apiClient.post<OfferItem>(`/offers/${id}/counter`, input),
  acceptOffer: (id: string, destination_address?: string) => apiClient.post<any>(`/offers/${id}/accept`, { destination_address }),
  rejectOffer: (id: string, reason?: string) => apiClient.post<{ success: boolean }>(`/offers/${id}/reject`, { reason }),
  withdrawOffer: (id: string, reason?: string) => apiClient.post<{ success: boolean }>(`/offers/${id}/withdraw`, { reason }),
};
