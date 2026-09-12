import { apiClient } from '@/api/client';

export interface InquiryItem {
  id: string;
  listing_id: string;
  requirement_id?: string;
  buyer_organization_id: string;
  seller_organization_id: string;
  buyer_organization_name?: string;
  seller_organization_name?: string;
  listing_title?: string;
  listing_purity?: number;
  requirement_title?: string;
  requested_quantity: number;
  message: string;
  status: 'OPEN' | 'RESPONDED' | 'NEGOTIATING' | 'CONVERTED' | 'CLOSED' | 'CANCELLED';
  message_count?: number;
  created_at: string;
  updated_at: string;
}

export interface InquiryMessage {
  id: string;
  inquiry_id: string;
  sender_user_id: string;
  sender_organization_id: string;
  sender_user_name?: string;
  sender_organization_name?: string;
  message: string;
  created_at: string;
}

export interface InquiryDetail extends InquiryItem {
  listing?: {
    id: string;
    title: string;
    purity_percentage: number;
    price_per_ton: number;
    remaining_quantity: number;
    facility_name?: string;
    city?: string;
    state?: string;
    currency?: string;
    organization_name?: string;
  };
  requirement?: {
    id: string;
    title: string;
    required_quantity: number;
    required_purity_percentage: number;
    target_price_per_ton?: number;
    location_city?: string;
    location_state?: string;
    organization_name?: string;
  };
  match_score?: number | null;
  messages?: InquiryMessage[];
  current_offer?: any;
}

export interface CreateInquiryInput {
  listing_id: string;
  requirement_id?: string;
  requested_quantity: number;
  message: string;
}

export const inquiryApi = {
  createInquiry: (input: CreateInquiryInput) => apiClient.post<InquiryItem>('/inquiries', input),
  getInquiries: (role: 'sent' | 'received' | 'all' = 'all', status?: string) =>
    apiClient.get<InquiryItem[]>(`/inquiries?role=${role}${status ? `&status=${status}` : ''}`),
  getInquiryDetail: (id: string) => apiClient.get<InquiryDetail>(`/inquiries/${id}`),
  getMessages: (id: string) => apiClient.get<InquiryMessage[]>(`/inquiries/${id}/messages`),
  sendMessage: (id: string, message: string) => apiClient.post<InquiryMessage>(`/inquiries/${id}/messages`, { message }),
  closeInquiry: (id: string) => apiClient.post<{ success: boolean }>(`/inquiries/${id}/close`),
};
