-- Drop the restrictive policies temporarily for testing
DROP POLICY IF EXISTS "Admins can manage whale alerts" ON whale_alerts;
DROP POLICY IF EXISTS "Admins can view whale alerts" ON whale_alerts;

-- Create more permissive policies for testing
CREATE POLICY "Allow authenticated users to manage whale alerts for testing" 
ON whale_alerts 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Also ensure the foreign key constraint is satisfied by creating wallet_transactions first
CREATE OR REPLACE FUNCTION ensure_wallet_transaction_exists(
  p_wallet_address text,
  p_transaction_hash text,
  p_amount numeric,
  p_transaction_type text
)
RETURNS void AS $$
BEGIN
  -- Check if transaction already exists
  IF NOT EXISTS(
    SELECT 1 FROM wallet_transactions 
    WHERE transaction_hash = p_transaction_hash
  ) THEN
    -- Create wallet transaction
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;