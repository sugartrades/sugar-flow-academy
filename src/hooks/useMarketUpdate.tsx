
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MarketUpdate {
  id: string;
  title: string;
  content: string;
}

export function useMarketUpdate() {
  const [update, setUpdate] = useState<MarketUpdate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMarketUpdate() {
      try {
        const { data } = await supabase
          .from('market_updates')
          .select('id, title, content')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (data) {
          setUpdate(data);
        }
      } catch (error) {
        console.error('Error fetching market update:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMarketUpdate();
  }, []);

  return { update, loading };
}
