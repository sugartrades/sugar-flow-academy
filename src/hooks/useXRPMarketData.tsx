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
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error) => {
      // Don't retry if it's a known API issue (fallback data is acceptable)
      if (error?.message?.includes('fallback') || error?.message?.includes('cached')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
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

  // Provide fallback data if we have no data at all
  const finalXrpData = React.useMemo(() => {
    if (enhancedXrpData) return enhancedXrpData;
    
    if (errorMessage && !marketData) {
      // Only use fallback if we have no data at all
      console.warn('Using fallback XRP data due to API error:', errorMessage);
      return {
        symbol: 'XRP',
        name: 'XRP',
        price: 3.00,
        change24h: 0,
        marketCap: 170000000000,
        sentiment: 'neutral',
        lastUpdated: new Date().toISOString()
      };
    }
    
    return null;
  }, [enhancedXrpData, errorMessage, marketData]);

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