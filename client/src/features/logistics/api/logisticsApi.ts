import { apiClient } from '@/api/client';

export type TransportMode = 'ROAD' | 'RAIL' | 'PIPELINE' | 'SHIP' | 'OTHER' | 'ISO_TANK_TRUCK' | 'CYLINDER_CASCADE' | 'RAIL_TANKER';
export type QuoteStatus = 'DRAFT' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN' | 'EXPIRED' | 'PENDING';

export interface LogisticsProviderInfo {
  id: string;
  name: string;
  slug?: string;
  verification_status: string;
  transport_modes?: string[];
  service_regions?: string[];
  city?: string;
  state?: string;
  country?: string;
}

export interface LogisticsQuote {
  id: string;
  quote_number?: string;
  order_id: string;
  order_number?: string;
  provider_organization_id: string;
  provider_name?: string;
  provider_verification?: string;
  origin_facility_id?: string;
  origin_facility_name?: string;
  origin_city?: string;
  destination_facility_id?: string;
  destination_facility_name?: string;
  destination_city?: string;
  distance_km: number;
  estimated_duration_minutes: number;
  transport_mode: TransportMode;
  base_cost: number;
  fuel_surcharge: number;
  handling_cost: number;
  other_cost: number;
  total_cost: number;
  currency: string;
  estimated_co2e_kg: number;
  valid_until: string;
  status: QuoteStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateQuoteInput {
  order_id: string;
  transport_mode: TransportMode;
  base_cost: number;
  fuel_surcharge?: number;
  handling_cost?: number;
  other_cost?: number;
  currency?: string;
  valid_until: string;
  notes?: string;
  origin_facility_id?: string;
  destination_facility_id?: string;
}

export const logisticsApi = {
  getProviders: () => apiClient.get<LogisticsProviderInfo[]>('/logistics/providers'),
  getQuotes: (role: 'sent' | 'received' | 'all' = 'all', orderId?: string, status?: string) => {
    let url = `/logistics/quotes?role=${role}`;
    if (orderId) url += `&order_id=${orderId}`;
    if (status) url += `&status=${status}`;
    return apiClient.get<{ items: LogisticsQuote[]; total: number }>(url);
  },
  getQuoteDetail: (id: string) => apiClient.get<LogisticsQuote>(`/logistics/quotes/${id}`),
  createQuote: (data: CreateQuoteInput) => apiClient.post<LogisticsQuote>('/logistics/quotes', data),
  acceptQuote: (id: string) => apiClient.post<any>(`/logistics/quotes/${id}/accept`, {}),
  rejectQuote: (id: string, reason?: string) => apiClient.post<void>(`/logistics/quotes/${id}/reject`, { reason }),
  withdrawQuote: (id: string, reason?: string) => apiClient.post<void>(`/logistics/quotes/${id}/withdraw`, { reason }),
  requestLogistics: (orderId: string, notes?: string) => apiClient.post<any>(`/orders/${orderId}/logistics/request`, { notes }),
};
