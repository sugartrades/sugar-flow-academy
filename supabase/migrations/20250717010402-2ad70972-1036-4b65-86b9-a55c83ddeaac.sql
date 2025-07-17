-- Fix XRP whale tracking bot issues by initializing last_ledger_index and improving logic

-- Step 1: Initialize last_ledger_index for existing wallets to prevent fetching all historical data
-- Set to a recent ledger index (around current mainnet ledger) to avoid processing old transactions
UPDATE wallet_monitoring 
SET last_ledger_index = 89500000 
WHERE last_ledger_index IS NULL;

-- Step 2: Create function to get current ledger index safely
CREATE OR REPLACE FUNCTION get_current_ledger_index()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_ledger bigint;
BEGIN
    -- Get the highest ledger index from recent transactions as a fallback
    SELECT COALESCE(MAX(ledger_index), 89500000) INTO current_ledger
    FROM wallet_transactions 
    WHERE created_at > NOW() - INTERVAL '7 days';
    
    -- Ensure we have a reasonable minimum ledger index
    IF current_ledger < 89000000 THEN
        current_ledger := 89500000;
    END IF;
    
    RETURN current_ledger;
END;
$$;

-- Step 3: Create function to safely update last_ledger_index
CREATE OR REPLACE FUNCTION update_wallet_last_ledger_index(
    p_wallet_address text,
    p_new_ledger_index bigint
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only update if the new ledger index is higher than the current one
    UPDATE wallet_monitoring 
    SET 
        last_ledger_index = GREATEST(COALESCE(last_ledger_index, 0), p_new_ledger_index),
        last_checked_at = now()
    WHERE wallet_address = p_wallet_address;
END;
$$;

-- Step 4: Add unique constraint on transaction hash to prevent duplicates
ALTER TABLE wallet_transactions 
ADD CONSTRAINT unique_transaction_hash 
UNIQUE (transaction_hash);

-- Step 5: Create index for better performance on ledger_index queries
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_ledger_wallet 
ON wallet_transactions(wallet_address, ledger_index);

-- Step 6: Create index for monitoring queries
CREATE INDEX IF NOT EXISTS idx_wallet_monitoring_active_checked 
ON wallet_monitoring(is_active, last_checked_at) 
WHERE is_active = true;