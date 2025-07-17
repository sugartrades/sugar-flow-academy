-- Update the get_current_ledger_index function to return a more recent ledger index
CREATE OR REPLACE FUNCTION public.get_current_ledger_index()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_ledger bigint;
BEGIN
    -- Get a recent ledger index that's safely in the past but not too old
    -- Current mainnet is around 92+ million, so we'll use 92.5 million as a safe baseline
    SELECT COALESCE(MAX(ledger_index), 92500000) INTO current_ledger
    FROM wallet_transactions 
    WHERE created_at > NOW() - INTERVAL '1 day';
    
    -- Ensure we have a reasonable recent ledger index (92.5M or higher)
    IF current_ledger < 92500000 THEN
        current_ledger := 92500000;
    END IF;
    
    RETURN current_ledger;
END;
$$;

-- Update all wallets with old last_ledger_index to a more recent one
UPDATE wallet_monitoring 
SET last_ledger_index = 92500000
WHERE last_ledger_index < 92500000 OR last_ledger_index IS NULL;