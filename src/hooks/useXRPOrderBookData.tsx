import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface OrderBookLevel {
  price: number;
  size: number;
}

export interface ExchangeOrderBookData {
  exchange: string;
  orderBook: {
    asks: OrderBookLevel[];
    bids: OrderBookLevel[];
  };
  currentPrice: number;
  xrpFloat: number;
  timestamp: string;
}

export interface OrderBookData {
  exchanges: ExchangeOrderBookData[];
  aggregatedFloat: number;
  averageFloat: number;
  lastUpdated: string;
}

interface UseXRPOrderBookDataReturn {
  orderBookData: OrderBookData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  selectedExchange: string | null;
  setSelectedExchange: (exchange: string | null) => void;
}

export const useXRPOrderBookData = (): UseXRPOrderBookDataReturn => {
  const [orderBookData, setOrderBookData] = useState<OrderBookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExchange, setSelectedExchange] = useState<string | null>(null);

  const fetchOrderBookData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase.functions.invoke('fetch-order-book-data');

      if (supabaseError) {
        throw new Error(`Supabase function error: ${supabaseError.message}`);
      }

      if (data?.error) {
        // Handle edge function errors but still set fallback data if available
        setError(`Order book fetch error: ${data.error}`);
        
        if (data.usingFallback) {
          console.warn('Using fallback order book data due to API error');
          setOrderBookData(data);
        }
      } else {
        setOrderBookData(data);
        setError(null);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch order book data';
      setError(errorMessage);
      console.error('Order book data fetch error:', err);
      
      // Set minimal fallback data structure
      setOrderBookData({
        exchanges: [],
        aggregatedFloat: 0,
        averageFloat: 0,
        lastUpdated: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrderBookData();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchOrderBookData, 30000);

    return () => clearInterval(interval);
  }, [fetchOrderBookData]);

  return {
    orderBookData,
    loading,
    error,
    refetch: fetchOrderBookData,
    selectedExchange,
    setSelectedExchange,
  };
};