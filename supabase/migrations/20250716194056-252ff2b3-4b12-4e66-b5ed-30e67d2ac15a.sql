-- Set up the service role key configuration for the whale alert trigger
-- This allows the trigger to authenticate with the edge function
ALTER DATABASE postgres SET app.settings.service_role_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5eGZiYmtnZ2lucmJwaHRyaGRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODQ4NjE3MywiZXhwIjoyMDY0MDYyMTczfQ.JoTun6WaA9Cg3YS_GfwfRaJmQ2yO9LPQ8RFRVcJTMFs';

-- Also create a test function to manually insert whale alerts for testing
CREATE OR REPLACE FUNCTION test_whale_alert_trigger(
  p_wallet_address text,
  p_owner_name text,
  p_transaction_hash text,
  p_amount numeric,
  p_transaction_type text DEFAULT 'Payment'
)
RETURNS uuid AS $$
DECLARE
  alert_id uuid;
BEGIN
  -- Insert a test whale alert
  INSERT INTO whale_alerts (
    wallet_address,
    owner_name,
    transaction_hash,
    amount,
    transaction_type,
    alert_type,
    is_sent
  ) VALUES (
    p_wallet_address,
    p_owner_name,
    p_transaction_hash,
    p_amount,
    p_transaction_type,
    'whale_movement',
    false
  ) RETURNING id INTO alert_id;
  
  RETURN alert_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;