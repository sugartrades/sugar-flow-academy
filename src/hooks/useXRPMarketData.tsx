import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface XRPMarketData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
  sentiment: string;
  lastUpdated: string;
}

interface UseXRPMarketDataReturn {
  xrpData: XRPMarketData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

export function useXRPMarketData(): UseXRPMarketDataReturn {
  const [xrpData, setXrpData] = useState<XRPMarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchXRPData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase.functions.invoke('fetch-market-data');
      
      if (fetchError) {
        throw new Error(`Failed to fetch market data: ${fetchError.message}`);
      }

      if (data?.cryptos) {
        // Find XRP data from the response
        const xrpCrypto = data.cryptos.find((crypto: any) => 
          crypto.symbol.toLowerCase() === 'xrp'
        );
        
        if (xrpCrypto) {
          setXrpData({
            ...xrpCrypto,
            lastUpdated: data.lastUpdated
          });
          setLastUpdated(new Date());
        } else {
          throw new Error('XRP data not found in market response');
        }
      } else {
        throw new Error('Invalid market data response');
      }
    } catch (err) {
      console.error('Error fetching XRP data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch XRP data');
      
      // Fallback data
      setXrpData({
        symbol: 'XRP',
        name: 'XRP',
        price: 0.60, // Fallback price
        change24h: 0,
        marketCap: 0,
        sentiment: 'neutral',
        lastUpdated: new Date().toISOString()
      });
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchXRPData();
    
    // Set up auto-refresh every 2 minutes
    const interval = setInterval(fetchXRPData, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchXRPData]);

  return {
    xrpData,
    loading,
    error,
    lastUpdated,
    refetch: fetchXRPData
  };
}