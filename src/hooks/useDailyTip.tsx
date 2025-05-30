
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DailyTip {
  id: string;
  content: string;
  category: string;
}

export function useDailyTip() {
  const [tip, setTip] = useState<DailyTip | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchDailyTip() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // First check if user has seen a tip today
        const { data: userTip } = await supabase
          .from('user_daily_tips')
          .select('tip_id, daily_tips(id, content, category)')
          .eq('user_id', user.id)
          .eq('shown_date', new Date().toISOString().split('T')[0])
          .single();

        if (userTip?.daily_tips) {
          setTip(userTip.daily_tips as DailyTip);
        } else {
          // Get a random tip that user hasn't seen recently
          const { data: tips } = await supabase
            .from('daily_tips')
            .select('id, content, category')
            .eq('is_active', true)
            .limit(50);

          if (tips && tips.length > 0) {
            const randomTip = tips[Math.floor(Math.random() * tips.length)];
            setTip(randomTip);

            // Record that user saw this tip today
            await supabase
              .from('user_daily_tips')
              .insert({
                user_id: user.id,
                tip_id: randomTip.id,
                shown_date: new Date().toISOString().split('T')[0]
              });
          }
        }
      } catch (error) {
        console.error('Error fetching daily tip:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDailyTip();
  }, [user]);

  return { tip, loading };
}
