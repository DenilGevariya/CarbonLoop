export type InquiryStatus = 
  | 'OPEN'
  | 'RESPONDED'
  | 'NEGOTIATING'
  | 'CONVERTED'
  | 'CLOSED'
  | 'CANCELLED';

export interface Inquiry {
  id: string;
  listing_id: string;
  requirement_id?: string | null;
  buyer_organization_id: string;
  seller_organization_id: string;
  initiated_by?: string | null;
  requested_quantity: number;
  message: string;
  status: InquiryStatus;
  created_at: string;
  updated_at: string;
}

export interface InquiryMessage {
  id: string;
  inquiry_id: string;
  sender_user_id: string;
  sender_organization_id: string;
  message: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  sender_user_name?: string;
  sender_organization_name?: string;
}

export interface CreateInquiryDTO {
  listing_id: string;
  requirement_id?: string;
  requested_quantity: number;
  message: string;
}

export interface InquiryDetail extends Inquiry {
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
  buyer_organization?: { id: string; name: string; org_type?: string };
  seller_organization?: { id: string; name: string; org_type?: string };
  messages?: InquiryMessage[];
  current_offer?: any;
}
