
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MarketData {
  title: string;
  content: string;
  price: number;
  change24h: number;
  marketCap: number;
  sentiment: string;
  lastUpdated: string;
}

export function useRealTimeMarketData() {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketData = async () => {
    try {
      console.log('Calling fetch-market-data edge function...');
      
      const { data, error: functionError } = await supabase.functions.invoke('fetch-market-data');
      
      if (functionError) {
        throw new Error(functionError.message);
      }

      console.log('Market data received:', data);
      setMarketData(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching market data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch market data');
      
      // Set fallback data
      setMarketData({
        title: 'Market Update',
        content: 'Bitcoin is showing strong support at $42,000. Consider this level for your analysis.',
        price: 42000,
        change24h: 0,
        marketCap: 800000000000,
        sentiment: 'Neutral',
        lastUpdated: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchMarketData();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchMarketData, 30000);

    return () => clearInterval(interval);
  }, []);

  return { marketData, loading, error, refetch: fetchMarketData };
}
