import { apiClient } from '@/api/client';

export interface OrderItem {
  id: string;
  order_number: string;
  offer_id: string;
  listing_id: string;
  requirement_id?: string;
  buyer_organization_id: string;
  seller_organization_id: string;
  buyer_organization_name?: string;
  seller_organization_name?: string;
  listing_title?: string;
  listing_purity?: number;
  quantity: number;
  quantity_unit: string;
  unit_price: number;
  currency: string;
  subtotal_amount: number;
  delivery_cost: number;
  total_amount: number;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PREPARATION' | 'READY_FOR_SHIPMENT' | 'IN_TRANSIT' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
  destination_address?: string;
  seller_confirmed_at?: string | null;
  buyer_confirmed_at?: string | null;
  logistics_confirmed_at?: string | null;
  buyer_receipt_confirmed_at?: string | null;
  reconfirmation_required?: boolean;
  declared_purity?: number;
  verified_purity?: number;
  commercial_snapshot?: any;
  status_history?: any[];
  created_at: string;
  updated_at: string;
}

type OrdersResponse =
  | OrderItem[]
  | {
      data?: OrderItem[];
      items?: OrderItem[];
    };

export const orderApi = {
  getOrders: async (role: 'sent' | 'received' | 'all' = 'all', status?: string): Promise<OrderItem[]> => {
    const response = await apiClient.get<OrdersResponse>(`/orders?role=${role}${status ? `&status=${status}` : ''}`);

    // The list endpoint includes pagination alongside the data array. Keep the
    // hook contract stable for consumers that only need the order collection.
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response.items)) return response.items;
    return [];
  },
  getOrderDetail: (id: string) => apiClient.get<OrderItem>(`/orders/${id}`),
  confirmHandshake: (id: string) => apiClient.post<OrderItem>(`/orders/${id}/confirm-handshake`, {}),
  updateTerms: (id: string, terms: { quantity?: number; unitPrice?: number; deliveryCost?: number }) =>
    apiClient.post<OrderItem>(`/orders/${id}/update-terms`, terms),
  confirmReceipt: (id: string, payload: { verifiedPurity?: number }) =>
    apiClient.post<OrderItem>(`/orders/${id}/confirm-receipt`, payload),
};
