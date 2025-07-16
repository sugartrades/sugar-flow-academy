-- Update the test function to create a wallet transaction first
-- This satisfies the foreign key constraint
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
  tx_exists boolean;
BEGIN
  -- Check if transaction already exists
  SELECT EXISTS(
    SELECT 1 FROM wallet_transactions 
    WHERE transaction_hash = p_transaction_hash
  ) INTO tx_exists;
  
  -- Create wallet transaction if it doesn't exist
  IF NOT tx_exists THEN
    INSERT INTO wallet_transactions (
      wallet_address,
      transaction_hash,
      amount,
      currency,
      transaction_type,
      transaction_date,
      ledger_index,
      source_address,
      destination_address
    ) VALUES (
      p_wallet_address,
      p_transaction_hash,
      p_amount,
      'XRP',
      p_transaction_type,
      NOW(),
      99999999, -- Test ledger index
      CASE WHEN p_transaction_type = 'sent' THEN p_wallet_address ELSE 'rTestSenderAddress123' END,
      CASE WHEN p_transaction_type = 'received' THEN p_wallet_address ELSE 'rTestReceiverAddress123' END
    );
  END IF;
  
  -- Now insert the whale alert
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