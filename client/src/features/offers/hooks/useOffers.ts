import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { offerApi, type CreateOfferInput, type CounterOfferInput } from '../api/offerApi';
import { INQUIRIES_QUERY_KEY } from '@/features/inquiries/hooks/useInquiries';
import { ORDERS_QUERY_KEY } from '@/features/orders/hooks/useOrders';

export const OFFERS_QUERY_KEY = ['offers'];

export function useOffers(role: 'sent' | 'received' | 'all' = 'all', status?: string) {
  return useQuery({
    queryKey: [...OFFERS_QUERY_KEY, role, status],
    queryFn: () => offerApi.getOffers(role, status),
  });
}

export function useOffer(id?: string) {
  return useQuery({
    queryKey: [...OFFERS_QUERY_KEY, id],
    queryFn: () => (id ? offerApi.getOfferDetail(id) : null),
    enabled: !!id,
    refetchInterval: 10000,
  });
}

export function useCreateOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOfferInput) => offerApi.createOffer(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OFFERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: INQUIRIES_QUERY_KEY });
    },
  });
}

export function useCounterOffer(offerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CounterOfferInput) => offerApi.counterOffer(offerId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OFFERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: INQUIRIES_QUERY_KEY });
    },
  });
}

export function useAcceptOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ offerId, destinationAddress }: { offerId: string; destinationAddress?: string }) =>
      offerApi.acceptOffer(offerId, destinationAddress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OFFERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: INQUIRIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
    },
  });
}

export function useRejectOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ offerId, reason }: { offerId: string; reason?: string }) =>
      offerApi.rejectOffer(offerId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OFFERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: INQUIRIES_QUERY_KEY });
    },
  });
}

export function useWithdrawOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ offerId, reason }: { offerId: string; reason?: string }) =>
      offerApi.withdrawOffer(offerId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OFFERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: INQUIRIES_QUERY_KEY });
    },
  });
}
