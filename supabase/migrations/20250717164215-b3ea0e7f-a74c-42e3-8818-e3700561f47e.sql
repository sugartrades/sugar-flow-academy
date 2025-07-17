-- Add destination_tag column to whale_alerts table
ALTER TABLE whale_alerts ADD COLUMN IF NOT EXISTS destination_tag text;

-- Add exchange_name column to whale_alerts table  
ALTER TABLE whale_alerts ADD COLUMN IF NOT EXISTS exchange_name text;

-- Add alert_category column to whale_alerts table
ALTER TABLE whale_alerts ADD COLUMN IF NOT EXISTS alert_category text DEFAULT 'whale_movement';

-- Add destination_tag column to wallet_transactions table
ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS destination_tag text;

-- Add exchange_name column to wallet_transactions table
ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS exchange_name text;

-- Create index for better performance on destination_tag lookups
CREATE INDEX IF NOT EXISTS idx_whale_alerts_destination_tag ON whale_alerts(destination_tag);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_destination_tag ON wallet_transactions(destination_tag);

-- Create index for exchange_name lookups
CREATE INDEX IF NOT EXISTS idx_whale_alerts_exchange_name ON whale_alerts(exchange_name);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_exchange_name ON wallet_transactions(exchange_name);