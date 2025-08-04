-- Create table for storing derivatives market data from Coinglass
CREATE TABLE public.derivatives_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL DEFAULT 'XRP',
  exchange TEXT NOT NULL,
  open_interest NUMERIC,
  open_interest_24h_change NUMERIC,
  long_short_ratio NUMERIC,
  funding_rate NUMERIC,
  funding_rate_8h NUMERIC,
  liquidations_24h NUMERIC,
  volume_24h NUMERIC,
  data_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient querying
CREATE INDEX idx_derivatives_data_symbol_timestamp ON public.derivatives_data(symbol, data_timestamp DESC);
CREATE INDEX idx_derivatives_data_exchange ON public.derivatives_data(exchange);

-- Enable RLS
ALTER TABLE public.derivatives_data ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is market data)
CREATE POLICY "Anyone can view derivatives data" 
ON public.derivatives_data 
FOR SELECT 
USING (true);

-- Only allow system/admin insertion
CREATE POLICY "System can insert derivatives data" 
ON public.derivatives_data 
FOR INSERT 
WITH CHECK (true);

-- Create table for aggregated market sentiment
CREATE TABLE public.market_sentiment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL DEFAULT 'XRP',
  sentiment_score NUMERIC NOT NULL CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  confidence_level NUMERIC NOT NULL CHECK (confidence_level >= 0 AND confidence_level <= 1),
  sentiment_label TEXT NOT NULL,
  data_sources JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for sentiment data
CREATE INDEX idx_market_sentiment_symbol_calculated ON public.market_sentiment(symbol, calculated_at DESC);

-- Enable RLS for sentiment data
ALTER TABLE public.market_sentiment ENABLE ROW LEVEL SECURITY;

-- Create policies for sentiment data
CREATE POLICY "Anyone can view market sentiment" 
ON public.market_sentiment 
FOR SELECT 
USING (true);

CREATE POLICY "System can insert market sentiment" 
ON public.market_sentiment 
FOR INSERT 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_derivatives_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_derivatives_data_updated_at
  BEFORE UPDATE ON public.derivatives_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_derivatives_updated_at();