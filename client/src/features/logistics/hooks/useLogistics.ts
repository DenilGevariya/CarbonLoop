import { useState, useEffect, useCallback } from 'react';
import { logisticsApi } from '../api/logisticsApi';
import type { LogisticsQuote, LogisticsProviderInfo } from '../api/logisticsApi';

export function useLogisticsQuotes(role: 'sent' | 'received' | 'all' = 'all', orderId?: string, status?: string) {
  const [quotes, setQuotes] = useState<LogisticsQuote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await logisticsApi.getQuotes(role, orderId, status);
      setQuotes(res?.items || []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load logistics quotes');
    } finally {
      setLoading(false);
    }
  }, [role, orderId, status]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  return { quotes, loading, error, refetch: fetchQuotes };
}

export function useLogisticsProviders() {
  const [providers, setProviders] = useState<LogisticsProviderInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await logisticsApi.getProviders();
        setProviders(res || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load logistics providers');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { providers, loading, error };
}

export function useLogisticsQuoteDetail(quoteId?: string) {
  const [quote, setQuote] = useState<LogisticsQuote | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!quoteId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await logisticsApi.getQuoteDetail(quoteId);
      setQuote(res);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load quote details');
    } finally {
      setLoading(false);
    }
  }, [quoteId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return { quote, loading, error, refetch: fetchDetail };
}
