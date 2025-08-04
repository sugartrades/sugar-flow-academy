import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DerivativesData {
  symbol: string;
  exchange: string;
  open_interest: number;
  open_interest_24h_change: number;
  long_short_ratio: number;
  funding_rate: number;
  funding_rate_8h: number;
  liquidations_24h: number;
  volume_24h: number;
  data_timestamp: string;
}

export interface AggregatedDerivatives {
  totalOpenInterest: number;
  avgLongShortRatio: number;
  avgFundingRate: number;
  totalLiquidations24h: number;
  totalVolume24h: number;
  exchangeCount: number;
  estimatedFloat: number;
  leverageMultiplier: number;
}

interface UseDerivativesDataReturn {
  derivatives: DerivativesData[];
  aggregated: AggregatedDerivatives | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

export function useDerivativesData(): UseDerivativesDataReturn {
  const [derivatives, setDerivatives] = useState<DerivativesData[]>([]);
  const [aggregated, setAggregated] = useState<AggregatedDerivatives | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDerivativesData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: functionError } = await supabase.functions.invoke('fetch-derivatives-data');
      
      if (functionError) {
        throw functionError;
      }

      if (data) {
        setDerivatives(data.derivatives || []);
        setLastUpdated(new Date(data.lastUpdated));
        
        // Calculate aggregated metrics
        if (data.derivatives && data.derivatives.length > 0) {
          const agg = calculateAggregatedMetrics(data.derivatives);
          setAggregated(agg);
        }
      }
    } catch (err) {
      console.error('Error fetching derivatives data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch derivatives data');
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateAggregatedMetrics = (data: DerivativesData[]): AggregatedDerivatives => {
    const totalOpenInterest = data.reduce((sum, item) => sum + item.open_interest, 0);
    const avgLongShortRatio = data.reduce((sum, item) => sum + item.long_short_ratio, 0) / data.length;
    const avgFundingRate = data.reduce((sum, item) => sum + item.funding_rate, 0) / data.length;
    const totalLiquidations24h = data.reduce((sum, item) => sum + item.liquidations_24h, 0);
    const totalVolume24h = data.reduce((sum, item) => sum + item.volume_24h, 0);
    
    // Estimate exchange float based on open interest and volume
    // Rough estimate: OI represents leveraged positions, float estimation
    const estimatedFloat = Math.min(totalOpenInterest * 0.3, 10000000000); // Cap at 10B XRP
    
    // Calculate leverage multiplier based on funding rates and long/short ratio
    const fundingPressure = Math.abs(avgFundingRate) * 100; // Convert to percentage
    const ratioImbalance = Math.abs(avgLongShortRatio - 1) * 2; // Deviation from neutral
    const leverageMultiplier = 1 + (fundingPressure + ratioImbalance) * 0.1; // Base multiplier
    
    return {
      totalOpenInterest,
      avgLongShortRatio,
      avgFundingRate,
      totalLiquidations24h,
      totalVolume24h,
      exchangeCount: data.length,
      estimatedFloat,
      leverageMultiplier: Math.min(leverageMultiplier, 3) // Cap at 3x
    };
  };

  useEffect(() => {
    fetchDerivativesData();
    
    // Set up interval for periodic updates (every 5 minutes)
    const interval = setInterval(fetchDerivativesData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchDerivativesData]);

  return {
    derivatives,
    aggregated,
    loading,
    error,
    lastUpdated,
    refetch: fetchDerivativesData,
  };
}