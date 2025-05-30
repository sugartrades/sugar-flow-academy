
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CryptoData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
  sentiment: string;
}

interface MarketData {
  cryptos: CryptoData[];
  lastUpdated: string;
}

export function useRealTimeMarketData() {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [currentCryptoIndex, setCurrentCryptoIndex] = useState(0);
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
        cryptos: [
          {
            symbol: 'BTC',
            name: 'Bitcoin',
            price: 42000,
            change24h: 0,
            marketCap: 800000000000,
            sentiment: 'Neutral'
          },
          {
            symbol: 'ETH',
            name: 'Ethereum',
            price: 2500,
            change24h: 0,
            marketCap: 300000000000,
            sentiment: 'Neutral'
          },
          {
            symbol: 'XRP',
            name: 'XRP',
            price: 0.50,
            change24h: 0,
            marketCap: 25000000000,
            sentiment: 'Neutral'
          }
        ],
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

  // Rotation logic - switch crypto every 5 seconds
  useEffect(() => {
    if (!marketData?.cryptos || marketData.cryptos.length <= 1) return;

    const rotationInterval = setInterval(() => {
      setCurrentCryptoIndex((prev) => (prev + 1) % marketData.cryptos.length);
    }, 5000);

    return () => clearInterval(rotationInterval);
  }, [marketData?.cryptos]);

  const currentCrypto = marketData?.cryptos?.[currentCryptoIndex] || null;

  return { 
    marketData, 
    currentCrypto, 
    currentCryptoIndex,
    totalCryptos: marketData?.cryptos?.length || 0,
    loading, 
    error, 
    refetch: fetchMarketData 
  };
}
