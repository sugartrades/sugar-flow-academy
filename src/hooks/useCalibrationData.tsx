import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CalibrationMetrics {
  weightedMultiplier: number;
  averageConfidence: number;
  dataPoints: number;
  accuracyScore: number;
  lastUpdated: string;
}

interface CalibrationData {
  id: string;
  event_name: string;
  event_date: string;
  xrp_price_usd: number;
  market_cap_usd: number;
  order_value_usd: number;
  order_source: string;
  order_type: string;
  expected_multiplier: number;
  actual_multiplier?: number;
  market_cap_increase_usd?: number;
  time_to_peak_minutes?: number;
  confidence_score: number;
  data_quality: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
}

export const useCalibrationData = (orderValue?: number, orderType?: string) => {
  const [metrics, setMetrics] = useState<CalibrationMetrics | null>(null);
  const [rawData, setRawData] = useState<CalibrationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCalibrationData();
  }, [orderValue, orderType]);

  const fetchCalibrationData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch raw calibration data
      const { data: rawCalibrationData, error: rawError } = await supabase
        .from('model_calibration_data')
        .select('*')
        .eq('is_active', true)
        .order('event_date', { ascending: false });

      if (rawError) throw rawError;

      setRawData(rawCalibrationData || []);

      // Fetch weighted metrics using the database function
      const { data: metricsData, error: metricsError } = await supabase
        .rpc('get_weighted_calibration_metrics', {
          p_order_value_usd: orderValue || null,
          p_order_type: orderType || null,
          p_confidence_threshold: 0.7
        });

      if (metricsError) {
        console.warn('Error fetching weighted metrics, using fallback:', metricsError);
        // Fallback calculation
        const fallbackMetrics = calculateFallbackMetrics(rawCalibrationData || [], orderValue, orderType);
        setMetrics(fallbackMetrics);
      } else {
        setMetrics(metricsData as unknown as CalibrationMetrics);
      }

    } catch (err) {
      console.error('Error fetching calibration data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Provide fallback metrics
      setMetrics({
        weightedMultiplier: 2.5,
        averageConfidence: 0.75,
        dataPoints: 0,
        accuracyScore: 0.85,
        lastUpdated: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateFallbackMetrics = (
    data: CalibrationData[], 
    orderValue?: number, 
    orderType?: string
  ): CalibrationMetrics => {
    if (!data.length) {
      return {
        weightedMultiplier: 2.5,
        averageConfidence: 0.75,
        dataPoints: 0,
        accuracyScore: 0.85,
        lastUpdated: new Date().toISOString()
      };
    }

    // Filter relevant data points
    const relevantData = data.filter(item => {
      const confidenceOk = item.confidence_score >= 0.7;
      const typeMatch = !orderType || item.order_type === orderType;
      const valueMatch = !orderValue || 
        Math.abs(item.order_value_usd - orderValue) / orderValue < 0.5;
      
      return confidenceOk && typeMatch && valueMatch;
    });

    if (!relevantData.length) {
      return {
        weightedMultiplier: 2.5,
        averageConfidence: 0.75,
        dataPoints: 0,
        accuracyScore: 0.85,
        lastUpdated: new Date().toISOString()
      };
    }

    // Calculate weighted average
    const totalWeight = relevantData.reduce((sum, item) => sum + item.confidence_score, 0);
    const weightedMultiplier = relevantData.reduce(
      (sum, item) => sum + (item.expected_multiplier * item.confidence_score), 
      0
    ) / totalWeight;

    // Calculate accuracy score
    const accuracyScore = relevantData
      .filter(item => item.actual_multiplier !== null && item.actual_multiplier !== undefined)
      .reduce((sum, item, _, arr) => {
        const error = Math.abs(item.expected_multiplier - item.actual_multiplier!) / Math.abs(item.expected_multiplier);
        return sum + (1 - error) / arr.length;
      }, 0) || 0.85;

    return {
      weightedMultiplier,
      averageConfidence: relevantData.reduce((sum, item) => sum + item.confidence_score, 0) / relevantData.length,
      dataPoints: relevantData.length,
      accuracyScore,
      lastUpdated: new Date().toISOString()
    };
  };

  return {
    metrics,
    rawData,
    loading,
    error,
    refetch: fetchCalibrationData
  };
};