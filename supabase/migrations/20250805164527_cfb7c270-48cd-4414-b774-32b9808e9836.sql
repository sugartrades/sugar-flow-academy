-- Create model calibration data table
CREATE TABLE public.model_calibration_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  event_date DATE NOT NULL,
  xrp_price_usd NUMERIC(10,4) NOT NULL,
  market_cap_usd NUMERIC(20,2) NOT NULL,
  order_value_usd NUMERIC(20,2) NOT NULL,
  order_source TEXT NOT NULL, -- e.g., 'coinglass', 'manual', 'whale_tracker'
  order_type TEXT NOT NULL, -- e.g., 'large_buy', 'large_sell', 'whale_movement'
  expected_multiplier NUMERIC(6,3) NOT NULL,
  actual_multiplier NUMERIC(6,3),
  market_cap_increase_usd NUMERIC(20,2),
  time_to_peak_minutes INTEGER,
  confidence_score NUMERIC(3,2) DEFAULT 0.75, -- 0.0 to 1.0
  data_quality TEXT DEFAULT 'good', -- 'excellent', 'good', 'fair', 'poor'
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.model_calibration_data ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage calibration data" 
ON public.model_calibration_data 
FOR ALL 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Anyone can view active calibration data" 
ON public.model_calibration_data 
FOR SELECT 
USING (is_active = true);

-- Create indexes for performance
CREATE INDEX idx_calibration_event_date ON public.model_calibration_data(event_date DESC);
CREATE INDEX idx_calibration_order_value ON public.model_calibration_data(order_value_usd);
CREATE INDEX idx_calibration_confidence ON public.model_calibration_data(confidence_score DESC);
CREATE INDEX idx_calibration_active ON public.model_calibration_data(is_active) WHERE is_active = true;

-- Create trigger for updated_at
CREATE TRIGGER update_calibration_data_updated_at
BEFORE UPDATE ON public.model_calibration_data
FOR EACH ROW
EXECUTE FUNCTION public.update_derivatives_updated_at();

-- Insert some sample calibration data
INSERT INTO public.model_calibration_data (
  event_name, 
  event_date, 
  xrp_price_usd, 
  market_cap_usd, 
  order_value_usd, 
  order_source, 
  order_type,
  expected_multiplier,
  actual_multiplier,
  market_cap_increase_usd,
  time_to_peak_minutes,
  confidence_score,
  data_quality,
  notes
) VALUES 
(
  'Coinglass Large Buy Order', 
  '2024-01-15', 
  0.6200, 
  34650000000, 
  50000000, 
  'coinglass', 
  'large_buy',
  2.50,
  2.45,
  122500000,
  15,
  0.90,
  'excellent',
  'High-confidence data from Coinglass API with verified market impact'
),
(
  'Whale Movement to Binance',
  '2024-01-22',
  0.5850,
  32700000000,
  75000000,
  'whale_tracker',
  'whale_movement',
  2.80,
  2.95,
  221250000,
  22,
  0.85,
  'good',
  'Large whale transfer observed with subsequent price movement'
),
(
  'Flash Large Sell Order',
  '2024-02-03',
  0.5950,
  33200000000,
  45000000,
  'manual',
  'large_sell',
  -2.20,
  -2.35,
  -105750000,
  8,
  0.80,
  'good',
  'Manual entry from trading floor observation'
);

-- Create function to get weighted calibration metrics
CREATE OR REPLACE FUNCTION public.get_weighted_calibration_metrics(
  p_order_value_usd NUMERIC DEFAULT NULL,
  p_order_type TEXT DEFAULT NULL,
  p_confidence_threshold NUMERIC DEFAULT 0.7
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  weighted_multiplier NUMERIC;
  confidence_avg NUMERIC;
  data_points INTEGER;
  accuracy_score NUMERIC;
BEGIN
  -- Get weighted average multiplier and statistics
  SELECT 
    COALESCE(
      SUM(expected_multiplier * confidence_score) / NULLIF(SUM(confidence_score), 0),
      2.5
    ),
    COALESCE(AVG(confidence_score), 0.75),
    COUNT(*),
    COALESCE(
      1 - AVG(ABS(expected_multiplier - COALESCE(actual_multiplier, expected_multiplier)) / ABS(expected_multiplier)),
      0.85
    )
  INTO 
    weighted_multiplier,
    confidence_avg,
    data_points,
    accuracy_score
  FROM model_calibration_data 
  WHERE is_active = true 
    AND confidence_score >= p_confidence_threshold
    AND (p_order_type IS NULL OR order_type = p_order_type)
    AND (p_order_value_usd IS NULL OR ABS(order_value_usd - p_order_value_usd) / p_order_value_usd < 0.5);
  
  result := jsonb_build_object(
    'weightedMultiplier', COALESCE(weighted_multiplier, 2.5),
    'averageConfidence', COALESCE(confidence_avg, 0.75),
    'dataPoints', COALESCE(data_points, 0),
    'accuracyScore', COALESCE(accuracy_score, 0.85),
    'lastUpdated', NOW()
  );
  
  RETURN result;
END;
$$;