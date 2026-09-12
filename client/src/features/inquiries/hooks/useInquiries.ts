import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inquiryApi, type CreateInquiryInput } from '../api/inquiryApi';

export const INQUIRIES_QUERY_KEY = ['inquiries'];

export function useInquiries(role: 'sent' | 'received' | 'all' = 'all', status?: string) {
  return useQuery({
    queryKey: [...INQUIRIES_QUERY_KEY, role, status],
    queryFn: () => inquiryApi.getInquiries(role, status),
  });
}

export function useInquiry(id?: string) {
  return useQuery({
    queryKey: [...INQUIRIES_QUERY_KEY, id],
    queryFn: () => (id ? inquiryApi.getInquiryDetail(id) : null),
    enabled: !!id,
    refetchInterval: 10000,
  });
}

export function useCreateInquiry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInquiryInput) => inquiryApi.createInquiry(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INQUIRIES_QUERY_KEY });
    },
  });
}

export function useSendInquiryMessage(inquiryId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (message: string) => inquiryApi.sendMessage(inquiryId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...INQUIRIES_QUERY_KEY, inquiryId] });
      queryClient.invalidateQueries({ queryKey: INQUIRIES_QUERY_KEY });
    },
  });
}

export function useCloseInquiry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => inquiryApi.closeInquiry(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [...INQUIRIES_QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: INQUIRIES_QUERY_KEY });
    },
  });
}
