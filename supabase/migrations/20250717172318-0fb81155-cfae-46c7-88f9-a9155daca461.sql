-- Update whale alert thresholds to proper whale levels (50,000+ XRP minimum)
UPDATE wallet_monitoring 
SET alert_threshold = 50000 
WHERE alert_threshold < 50000;

-- Add more significant whale wallets to monitoring
INSERT INTO wallet_monitoring (wallet_address, owner_name, alert_threshold, is_active) VALUES
-- Ripple Labs wallets
('rLNaPoKeeBjZe2qs6x52yVPZpZ8td4dc6w', 'Ripple Labs', 100000, true),
('rEhxGqkqPPSxQ3P25J2N1xnhPSPtpHqhvd', 'Ripple Labs', 100000, true),
('rJHygWcTLVpSXziqBkSdGJHWF5BLXgGojM', 'Ripple Labs', 100000, true),
('rUzSNPtxrmeSTpnjsvaTuQvF2SQFPFSvLn', 'Ripple Labs', 100000, true),

-- Exchange hot wallets
('rLCdN4oMVNyiQdL6LK2e5SjyVaUqA9BzWq', 'Binance Hot Wallet', 500000, true),
('rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh', 'Coinbase Hot Wallet', 500000, true),
('rLHVsKqC72M8FXPfEwSyYkufezZJvNZuDY', 'Bitstamp Hot Wallet', 250000, true),
('rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH', 'Kraken Hot Wallet', 250000, true),

-- Known whale addresses
('rDfrrrBJZshSQDvfT2kmL9oUBdish52unH', 'Major Whale #1', 100000, true),
('rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY', 'Pepper Hot Wallet', 200000, true),
('rGWrZyQqhTp9Xu7G5Pkayo7bXjH4k4QYpf', 'Gatehub Hot Wallet', 200000, true),
('rEb3SrWEyqKkfQfgfTJ9hBTHYGBhT1YX7n', 'Crypto.com Hot Wallet', 300000, true)

ON CONFLICT (wallet_address) DO UPDATE SET
  alert_threshold = EXCLUDED.alert_threshold,
  is_active = EXCLUDED.is_active;

-- Add additional alert types and categories
ALTER TABLE whale_alerts ADD COLUMN IF NOT EXISTS alert_severity TEXT DEFAULT 'medium';
ALTER TABLE whale_alerts ADD COLUMN IF NOT EXISTS explorer_links JSONB DEFAULT '{}';
ALTER TABLE whale_alerts ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Create trend analysis table for tracking patterns
CREATE TABLE IF NOT EXISTS whale_activity_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  time_window TEXT NOT NULL, -- 'hour', 'day', 'week'
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  transaction_count INTEGER DEFAULT 0,
  total_volume NUMERIC DEFAULT 0,
  average_amount NUMERIC DEFAULT 0,
  largest_amount NUMERIC DEFAULT 0,
  exchange_deposits INTEGER DEFAULT 0,
  internal_transfers INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new table
ALTER TABLE whale_activity_trends ENABLE ROW LEVEL SECURITY;

-- Create policy for trend data (admins only)
CREATE POLICY "Admins can manage trend data" 
ON whale_activity_trends 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Create function to analyze trends for whale alerts
CREATE OR REPLACE FUNCTION analyze_whale_trends(p_wallet_address TEXT, p_time_window TEXT DEFAULT 'hour')
RETURNS JSONB AS $$
DECLARE
  recent_count INTEGER;
  recent_volume NUMERIC;
  trend_data JSONB;
  time_filter TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Set time filter based on window
  CASE p_time_window
    WHEN 'hour' THEN time_filter := NOW() - INTERVAL '1 hour';
    WHEN 'day' THEN time_filter := NOW() - INTERVAL '1 day';
    WHEN 'week' THEN time_filter := NOW() - INTERVAL '1 week';
    ELSE time_filter := NOW() - INTERVAL '1 hour';
  END CASE;

  -- Get recent activity count and volume
  SELECT 
    COUNT(*),
    COALESCE(SUM(amount), 0)
  INTO recent_count, recent_volume
  FROM wallet_transactions 
  WHERE wallet_address = p_wallet_address 
    AND transaction_date >= time_filter;

  -- Build trend data
  trend_data := jsonb_build_object(
    'time_window', p_time_window,
    'recent_transactions', recent_count,
    'recent_volume', recent_volume,
    'analysis_timestamp', NOW()
  );

  RETURN trend_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;