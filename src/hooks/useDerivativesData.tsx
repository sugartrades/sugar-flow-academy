import React from 'react';
import { useQuery } from '@tanstack/react-query';
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
  // Enhanced metrics for advanced features
  weightedFundingRate: number;
  fundingTrend: 'bullish' | 'bearish' | 'neutral';
  leverageSentiment: 'long_dominant' | 'short_dominant' | 'balanced';
  marketMoodScore: number; // 0-1 scale
  floatRange: { min: number; max: number };
  exchangeDistribution: { [exchange: string]: { oi: number; percentage: number } };
}

interface UseDerivativesDataReturn {
  derivatives: DerivativesData[];
  aggregated: AggregatedDerivatives | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

// Query keys
const derivativesDataKeys = {
  all: ['derivativesData'] as const,
  data: () => [...derivativesDataKeys.all, 'data'] as const,
};

interface DerivativesResponse {
  derivatives: DerivativesData[];
  lastUpdated: string;
}

async function fetchDerivativesData(): Promise<DerivativesResponse> {
  const { data, error } = await supabase.functions.invoke('fetch-derivatives-data');
  
  if (error) {
    throw error;
  }

  return {
    derivatives: data?.derivatives || [],
    lastUpdated: data?.lastUpdated || new Date().toISOString(),
  };
}

function calculateAggregatedMetrics(data: DerivativesData[]): AggregatedDerivatives {
  if (data.length === 0) {
    return {
      totalOpenInterest: 0,
      avgLongShortRatio: 1,
      avgFundingRate: 0,
      totalLiquidations24h: 0,
      totalVolume24h: 0,
      exchangeCount: 0,
      estimatedFloat: 8000000000,
      leverageMultiplier: 1,
      weightedFundingRate: 0,
      fundingTrend: 'neutral',
      leverageSentiment: 'balanced',
      marketMoodScore: 0.5,
      floatRange: { min: 6000000000, max: 12000000000 },
      exchangeDistribution: {}
    };
  }

  const totalOpenInterest = data.reduce((sum, item) => sum + item.open_interest, 0);
  const avgLongShortRatio = data.reduce((sum, item) => sum + item.long_short_ratio, 0) / data.length;
  const avgFundingRate = data.reduce((sum, item) => sum + item.funding_rate, 0) / data.length;
  const totalLiquidations24h = data.reduce((sum, item) => sum + item.liquidations_24h, 0);
  const totalVolume24h = data.reduce((sum, item) => sum + item.volume_24h, 0);
  
  // Calculate weighted funding rate based on open interest
  const weightedFundingRate = data.reduce((sum, item) => {
    const weight = item.open_interest / Math.max(totalOpenInterest, 1);
    return sum + (item.funding_rate * weight);
  }, 0);
  
  // Determine funding trend
  const fundingTrend: 'bullish' | 'bearish' | 'neutral' = 
    weightedFundingRate > 0.0005 ? 'bullish' : 
    weightedFundingRate < -0.0005 ? 'bearish' : 'neutral';
  
  // Determine leverage sentiment
  const leverageSentiment: 'long_dominant' | 'short_dominant' | 'balanced' = 
    avgLongShortRatio > 1.3 ? 'long_dominant' :
    avgLongShortRatio < 0.7 ? 'short_dominant' : 'balanced';
  
  // Calculate market mood score (0-1, where 0.5 is neutral)
  const fundingComponent = Math.max(0, Math.min(1, (weightedFundingRate + 0.001) / 0.002));
  const ratioComponent = Math.max(0, Math.min(1, (avgLongShortRatio - 0.5) / 2.0));
  const marketMoodScore = (fundingComponent * 0.6 + ratioComponent * 0.4);
  
  // Advanced exchange float estimation
  // Method 1: Based on total OI and average leverage (assume 3-5x leverage)
  const baseFloatEstimate = totalOpenInterest / 4; // Assume 4x average leverage
  
  // Method 2: Volume-based estimation (exchanges typically hold 2-3 days of volume)
  const volumeBasedFloat = totalVolume24h * 2.5;
  
  // Method 3: Weighted combination with market conditions
  const volatilityAdjustment = Math.abs(weightedFundingRate) * 50000000000; // Higher funding = higher float needs
  const estimatedFloat = Math.max(
    Math.min(baseFloatEstimate + volumeBasedFloat + volatilityAdjustment, 15000000000), // Cap at 15B
    3000000000 // Floor at 3B
  );
  
  // Calculate dynamic float range based on market conditions
  const floatVariance = estimatedFloat * 0.3; // ±30% range
  const floatRange = {
    min: Math.max(1000000000, estimatedFloat - floatVariance),
    max: Math.min(20000000000, estimatedFloat + floatVariance)
  };
  
  // Calculate exchange distribution
  const exchangeDistribution: { [exchange: string]: { oi: number; percentage: number } } = {};
  data.forEach(item => {
    const percentage = (item.open_interest / Math.max(totalOpenInterest, 1)) * 100;
    exchangeDistribution[item.exchange] = {
      oi: item.open_interest,
      percentage: percentage
    };
  });
  
  // Enhanced leverage multiplier calculation
  const fundingPressure = Math.abs(weightedFundingRate) * 500; // Amplify impact
  const ratioImbalance = Math.abs(avgLongShortRatio - 1) * 0.5;
  const liquidationPressure = Math.min(totalLiquidations24h / 100000000, 0.5); // Cap influence
  const leverageMultiplier = Math.max(0.5, Math.min(4.0, 
    1 + (fundingPressure + ratioImbalance + liquidationPressure)
  ));
  
  return {
    totalOpenInterest,
    avgLongShortRatio,
    avgFundingRate,
    totalLiquidations24h,
    totalVolume24h,
    exchangeCount: data.length,
    estimatedFloat,
    leverageMultiplier,
    weightedFundingRate,
    fundingTrend,
    leverageSentiment,
    marketMoodScore,
    floatRange,
    exchangeDistribution
  };
}

export function useDerivativesData(): UseDerivativesDataReturn {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: derivativesDataKeys.data(),
    queryFn: fetchDerivativesData,
    refetchInterval: 90 * 1000, // 90 seconds - faster updates
    staleTime: 1 * 60 * 1000, // 1 minute - shorter cache for fresher data
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    retry: 1, // Reduced retries for faster failure
    retryDelay: (attemptIndex) => Math.min(500 * 2 ** attemptIndex, 3000), // Faster retries
    networkMode: 'offlineFirst',
  });

  // Calculate aggregated metrics with immediate fallback
  const aggregated = React.useMemo(() => {
    if (data?.derivatives && data.derivatives.length > 0) {
      return calculateAggregatedMetrics(data.derivatives);
    }
    
    // Provide immediate fallback data for faster loading
    if (isLoading) {
      console.log('Using fallback derivatives data for faster loading');
      return {
        totalOpenInterest: 1200000000, // 1.2B XRP in OI
        avgLongShortRatio: 1.15,
        avgFundingRate: 0.0002,
        totalLiquidations24h: 25000000,
        totalVolume24h: 800000000,
        exchangeCount: 5,
        estimatedFloat: 8000000000, // 8B XRP
        leverageMultiplier: 1.2,
        weightedFundingRate: 0.0002,
        fundingTrend: 'neutral' as const,
        leverageSentiment: 'balanced' as const,
        marketMoodScore: 0.55,
        floatRange: { min: 6000000000, max: 10000000000 },
        exchangeDistribution: {
          'Binance': { oi: 480000000, percentage: 40 },
          'Bybit': { oi: 360000000, percentage: 30 },
          'OKX': { oi: 240000000, percentage: 20 },
          'Other': { oi: 120000000, percentage: 10 }
        }
      };
    }
    
    return null;
  }, [data?.derivatives, isLoading]);

  const refetchWithLog = React.useCallback(async () => {
    console.log('Manually refetching derivatives data...');
    await refetch();
  }, [refetch]);

  return {
    derivatives: data?.derivatives || [],
    aggregated,
    loading: isLoading,
    error: error instanceof Error ? error.message : null,
    lastUpdated: data?.lastUpdated ? new Date(data.lastUpdated) : null,
    refetch: refetchWithLog,
  };
}