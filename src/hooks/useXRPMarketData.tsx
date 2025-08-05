import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDerivativesData, AggregatedDerivatives } from './useDerivativesData';

interface XRPMarketData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
  sentiment: string;
  lastUpdated: string;
  liquidations?: {
    total24h: number;
    long24h: number;
    short24h: number;
    exchanges: string[];
  };
}

interface EnhancedXRPMarketData extends XRPMarketData {
  derivatives?: AggregatedDerivatives;
}

interface UseXRPMarketDataReturn {
  xrpData: EnhancedXRPMarketData | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
  derivativesEnabled: boolean;
  setDerivativesEnabled: (enabled: boolean) => void;
  dataSource: string | null;
}

// Query keys
const xrpMarketDataKeys = {
  all: ['xrpMarketData'] as const,
  market: () => [...xrpMarketDataKeys.all, 'market'] as const,
};

async function fetchXRPMarketData(): Promise<{
  xrpData: XRPMarketData;
  dataSource: string;
}> {
  const { data, error } = await supabase.functions.invoke('fetch-market-data');
  
  if (error) {
    throw new Error(`Failed to fetch market data: ${error.message}`);
  }

  // Handle fallback data gracefully
  if (data?.error || data?.usingFallback) {
    console.info('Using cached or fallback market data');
  }

  // Check if we have valid data
  if (data?.cryptos && Array.isArray(data.cryptos)) {
    const xrpCrypto = data.cryptos.find((crypto: any) => 
      crypto.symbol.toLowerCase() === 'xrp'
    );
    
    if (xrpCrypto) {
      return {
        xrpData: {
          ...xrpCrypto,
          lastUpdated: data.lastUpdated
        },
        dataSource: data.dataSource || 'coingecko'
      };
    } else {
      throw new Error('XRP data not found in market response');
    }
  } else {
    throw new Error('Invalid market data response structure');
  }
}

export function useXRPMarketData(): UseXRPMarketDataReturn {
  const { aggregated: derivativesData, loading: derivativesLoading } = useDerivativesData();
  
  // This would typically come from a state management solution or localStorage
  // For now, we'll use a simple state approach since we need to maintain the setter
  const [derivativesEnabled, setDerivativesEnabled] = React.useState(true);

  const {
    data: marketData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: xrpMarketDataKeys.market(),
    queryFn: fetchXRPMarketData,
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    staleTime: 10 * 60 * 1000, // 10 minutes - longer cache to reduce API calls
    gcTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
    retry: (failureCount, error) => {
      // Don't retry if it's a known API issue (fallback data is acceptable)
      if (error?.message?.includes('fallback') || error?.message?.includes('cached')) {
        return false;
      }
      return failureCount < 2; // Reduced retries from 3 to 2
    },
    retryDelay: (attemptIndex) => Math.min(500 * 2 ** attemptIndex, 5000), // Faster, shorter delays
    networkMode: 'offlineFirst', // Use cache first when possible
  });

  // Enhanced XRP data with derivatives
  const enhancedXrpData: EnhancedXRPMarketData | null = React.useMemo(() => {
    if (!marketData?.xrpData) return null;

    const enhanced: EnhancedXRPMarketData = {
      ...marketData.xrpData,
    };

    // Add derivatives data if enabled and available
    if (derivativesEnabled && derivativesData) {
      enhanced.derivatives = derivativesData;
    }

    return enhanced;
  }, [marketData?.xrpData, derivativesEnabled, derivativesData]);

  // Handle error state with fallback data
  const errorMessage = React.useMemo(() => {
    if (error) {
      // Don't show errors for fallback data scenarios
      if (marketData?.xrpData && marketData.xrpData.price > 0) {
        return null; // We have valid data, don't show error
      }
      return error instanceof Error ? error.message : 'Failed to fetch XRP data';
    }
    return null;
  }, [error, marketData]);

  // Provide fallback data immediately if we have no data
  const finalXrpData = React.useMemo(() => {
    if (enhancedXrpData) return enhancedXrpData;
    
    // Always provide fallback data for immediate loading
    console.log('Using fallback XRP data for faster loading');
    return {
      symbol: 'XRP',
      name: 'XRP',
      price: 3.06, // Use recent market price
      change24h: 1.58,
      marketCap: 181456208127,
      sentiment: 'Slightly Bullish - Modest gains',
      lastUpdated: new Date().toISOString()
    };
  }, [enhancedXrpData]);

  const refetchWithLog = React.useCallback(async () => {
    console.log('Manually refetching XRP market data...');
    await refetch();
  }, [refetch]);

  return {
    xrpData: finalXrpData,
    loading: isLoading || derivativesLoading,
    refreshing: isFetching && !isLoading,
    error: errorMessage,
    lastUpdated: marketData?.xrpData ? new Date() : null,
    refetch: refetchWithLog,
    derivativesEnabled,
    setDerivativesEnabled,
    dataSource: marketData?.dataSource || null,
  };
}