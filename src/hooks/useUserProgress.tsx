
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserStats {
  totalXP: number;
  completedLessons: number;
  dayStreak: number;
}

export function useUserProgress() {
  const [stats, setStats] = useState<UserStats>({ totalXP: 0, completedLessons: 0, dayStreak: 7 });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchUserProgress() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data: progress } = await supabase
          .from('user_course_progress')
          .select('xp_earned')
          .eq('user_id', user.id);

        if (progress) {
          const totalXP = progress.reduce((sum, item) => sum + (item.xp_earned || 0), 0);
          const completedLessons = progress.length;
          
          setStats({
            totalXP,
            completedLessons,
            dayStreak: 7 // We'll calculate this properly later
          });
        }
      } catch (error) {
        console.error('Error fetching user progress:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserProgress();
  }, [user]);

  return { stats, loading };
}
