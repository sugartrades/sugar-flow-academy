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
      
      // Check for Supabase client errors first
      if (fetchError) {
        console.error('Supabase client error:', fetchError);
        throw new Error(`Failed to fetch market data: ${fetchError.message}`);
      }

      // Check if the response indicates an API error
      if (data?.error || data?.usingFallback) {
        console.warn('API returned fallback data:', data.error);
        setError(`API Error: ${data.error || 'Using fallback data'}`);
      }

      // Check if we have valid data
      if (data?.cryptos && Array.isArray(data.cryptos)) {
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
          
          // Clear error if we successfully got data (only for live data)
          if (!data?.error && !data?.usingFallback) {
            setError(null);
          }
          return; // Successfully set data, exit early
        } else {
          throw new Error('XRP data not found in market response');
        }
      } else {
        console.error('Invalid response structure:', data);
        throw new Error('Invalid market data response structure');
      }
    } catch (err) {
      console.error('Error fetching XRP data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch XRP data';
      setError(errorMessage);
      
      // Only set fallback data if we don't already have valid data
      setXrpData(prevData => {
        if (prevData && prevData.price > 0) {
          // Keep existing data if we have it
          console.warn('Keeping existing XRP data due to API error:', errorMessage);
          return prevData;
        }
        // Only use fallback if we have no data at all
        console.warn('Using fallback XRP data due to API error:', errorMessage);
        return {
          symbol: 'XRP',
          name: 'XRP',
          price: 2.98, // Updated fallback price to current market value
          change24h: 0,
          marketCap: 170000000000, // Approximate current market cap
          sentiment: 'neutral',
          lastUpdated: new Date().toISOString()
        };
      });
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, []); // Remove xrpData dependency to prevent infinite loops

  useEffect(() => {
    fetchXRPData();
    
    // Set up auto-refresh every 5 minutes to reduce API pressure
    const interval = setInterval(fetchXRPData, 5 * 60 * 1000);
    
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