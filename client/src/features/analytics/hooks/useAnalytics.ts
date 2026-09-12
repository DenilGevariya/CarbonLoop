import { useState, useEffect, useCallback } from 'react';
import { analyticsApi } from '../api/analyticsApi';
import type {
  Timeframe,
  NetworkOverviewKPIs,
  CarbonFlowFunnel,
  SupplyAnalytics,
  DemandAnalytics,
  MatchingAnalytics,
  LogisticsAnalytics,
  RegionalBalanceRow,
  NetworkObservation,
  ImpactAnalyticsReport,
  PublicImpactSummary,
} from '../api/analyticsApi';

export function useAnalyticsOverview(timeframe: Timeframe = '30d') {
  const [overview, setOverview] = useState<NetworkOverviewKPIs | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsApi.getOverview(timeframe);
      setOverview(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load analytics overview');
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return { overview, loading, error, refetch: fetchOverview };
}

export function useCarbonFlowFunnel(timeframe: Timeframe = '30d') {
  const [funnel, setFunnel] = useState<CarbonFlowFunnel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await analyticsApi.getFunnel(timeframe);
        setFunnel(data);
      } catch (err) {
        console.error('Failed to load funnel analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [timeframe]);

  return { funnel, loading };
}

export function useSupplyAnalytics(timeframe: Timeframe = '30d') {
  const [supply, setSupply] = useState<SupplyAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await analyticsApi.getSupply(timeframe);
        setSupply(data);
      } catch (err) {
        console.error('Failed to load supply analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [timeframe]);

  return { supply, loading };
}

export function useDemandAnalytics(timeframe: Timeframe = '30d') {
  const [demand, setDemand] = useState<DemandAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await analyticsApi.getDemand(timeframe);
        setDemand(data);
      } catch (err) {
        console.error('Failed to load demand analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [timeframe]);

  return { demand, loading };
}

export function useMatchingAnalytics(timeframe: Timeframe = '30d') {
  const [matching, setMatching] = useState<MatchingAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await analyticsApi.getMatching(timeframe);
        setMatching(data);
      } catch (err) {
        console.error('Failed to load matching analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [timeframe]);

  return { matching, loading };
}

export function useLogisticsAnalytics(timeframe: Timeframe = '30d') {
  const [logistics, setLogistics] = useState<LogisticsAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await analyticsApi.getLogistics(timeframe);
        setLogistics(data);
      } catch (err) {
        console.error('Failed to load logistics analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [timeframe]);

  return { logistics, loading };
}

export function useRegionalBalances() {
  const [regions, setRegions] = useState<RegionalBalanceRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await analyticsApi.getRegions();
        setRegions(data || []);
      } catch (err) {
        console.error('Failed to load regional balance analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { regions, loading };
}

export function useNetworkObservations(timeframe: Timeframe = '30d') {
  const [observations, setObservations] = useState<NetworkObservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await analyticsApi.getObservations(timeframe);
        setObservations(data || []);
      } catch (err) {
        console.error('Failed to load network observations:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [timeframe]);

  return { observations, loading };
}

export function useImpactAnalyticsReport(timeframe: Timeframe = '30d') {
  const [report, setReport] = useState<ImpactAnalyticsReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await analyticsApi.getImpactReport(timeframe);
        setReport(data);
      } catch (err) {
        console.error('Failed to load impact analytics report:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [timeframe]);

  return { report, loading };
}

export function usePublicImpactSummary() {
  const [summary, setSummary] = useState<PublicImpactSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await analyticsApi.getPublicImpact();
        setSummary(data);
      } catch (err) {
        console.error('Failed to load public impact summary:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { summary, loading };
}
