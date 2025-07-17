-- Update the get_current_ledger_index function to use the user-specified baseline
CREATE OR REPLACE FUNCTION public.get_current_ledger_index()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_ledger bigint;
BEGIN
    -- Get a recent ledger index that's safely in the past but not too old
    -- Using user-specified baseline of 97524119
    SELECT COALESCE(MAX(ledger_index), 97524119) INTO current_ledger
    FROM wallet_transactions 
    WHERE created_at > NOW() - INTERVAL '1 day';
    
    -- Ensure we have a reasonable recent ledger index (97524119 or higher)
    IF current_ledger < 97524119 THEN
        current_ledger := 97524119;
    END IF;
    
    RETURN current_ledger;
END;
$$;

-- Update all wallets to use the new baseline ledger index
UPDATE wallet_monitoring 
SET last_ledger_index = 97524119
WHERE last_ledger_index < 97524119 OR last_ledger_index IS NULL;