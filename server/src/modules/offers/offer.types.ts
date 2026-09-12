export type OfferStatus =
  | 'DRAFT'
  | 'SENT'
  | 'COUNTERED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'EXPIRED';

export interface Offer {
  id: string;
  inquiry_id: string;
  offer_number: string;
  parent_offer_id?: string | null;
  version: number;
  offered_by_organization_id: string;
  buyer_organization_id: string;
  seller_organization_id: string;
  listing_id: string;
  quantity: number;
  quantity_unit: string;
  unit_price: number;
  currency: string;
  delivery_cost: number;
  total_estimated_cost: number;
  valid_until: string;
  message?: string | null;
  rejection_reason?: string | null;
  withdrawal_reason?: string | null;
  status: OfferStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateOfferDTO {
  inquiry_id: string;
  quantity: number;
  quantity_unit?: string;
  unit_price: number;
  currency?: string;
  delivery_cost?: number;
  valid_until: string;
  message?: string;
}

export interface CounterOfferDTO {
  quantity?: number;
  unit_price: number;
  delivery_cost?: number;
  valid_until: string;
  message?: string;
}

export interface OfferDetail extends Offer {
  offered_by_organization_name?: string;
  buyer_organization_name?: string;
  seller_organization_name?: string;
  listing_title?: string;
  listing_purity?: number;
  listing_location?: string;
  version_history?: Offer[];
}
