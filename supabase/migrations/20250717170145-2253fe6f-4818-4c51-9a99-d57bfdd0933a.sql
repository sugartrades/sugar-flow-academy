-- Enhanced destination tag test suite functionality

-- Create function to generate comprehensive test data
CREATE OR REPLACE FUNCTION public.generate_destination_tag_test_data(p_count integer DEFAULT 10)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  i integer;
  test_data jsonb[];
  wallet_addresses text[] := ARRAY[
    'rDsbeomae4FXwgQs4XV4fkKaVpTBLsZy1X',
    'rUzSNPtxrmeSTpnjsvaTuQvF2SQFPFSvLn',
    'rQKZSMgmBJvv3FvWj1vuGjUXnegTqJc25z'
  ];
  exchange_addresses text[] := ARRAY[
    'rLNaPoKeeBjZe2qs6x52yVPZpZ8td4dc6w',
    'rEhxGqkqPPSxQ3P25J2N1xnhPSPtpHqhvd',
    'rJHygWcTLVpSXziqBkSdGJHWF5BLXgGojM'
  ];
  exchange_names text[] := ARRAY['Binance', 'Kraken', 'Coinbase'];
  tx_hash text;
  result jsonb;
BEGIN
  FOR i IN 1..p_count LOOP
    tx_hash := 'TEST_' || extract(epoch from now())::text || '_' || i::text;
    
    -- Insert test wallet transaction
    INSERT INTO wallet_transactions (
      wallet_address,
      transaction_hash,
      amount,
      currency,
      transaction_type,
      destination_address,
      destination_tag,
      exchange_name,
      ledger_index,
      transaction_date,
      source_address
    ) VALUES (
      wallet_addresses[((i - 1) % array_length(wallet_addresses, 1)) + 1],
      tx_hash,
      50000 + (i * 1000),
      'XRP',
      'Payment',
      exchange_addresses[((i - 1) % array_length(exchange_addresses, 1)) + 1],
      (12345 + i)::text,
      exchange_names[((i - 1) % array_length(exchange_names, 1)) + 1],
      99999999 + i,
      NOW(),
      wallet_addresses[((i - 1) % array_length(wallet_addresses, 1)) + 1]
    );
    
    -- Create whale alert if amount is significant
    IF (50000 + (i * 1000)) >= 50000 THEN
      INSERT INTO whale_alerts (
        wallet_address,
        owner_name,
        transaction_hash,
        amount,
        transaction_type,
        alert_type,
        alert_category,
        destination_tag,
        exchange_name,
        is_sent
      ) VALUES (
        wallet_addresses[((i - 1) % array_length(wallet_addresses, 1)) + 1],
        'Test User ' || i::text,
        tx_hash,
        50000 + (i * 1000),
        'Payment',
        'whale_movement',
        'exchange_deposit',
        (12345 + i)::text,
        exchange_names[((i - 1) % array_length(exchange_names, 1)) + 1],
        false
      );
    END IF;
    
    test_data := test_data || jsonb_build_object(
      'transaction_hash', tx_hash,
      'destination_tag', (12345 + i)::text,
      'exchange_name', exchange_names[((i - 1) % array_length(exchange_names, 1)) + 1],
      'amount', 50000 + (i * 1000)
    );
  END LOOP;
  
  result := jsonb_build_object(
    'generated_count', p_count,
    'test_data', test_data,
    'timestamp', NOW()
  );
  
  RETURN result;
END;
$$;

-- Create function to clean up test data
CREATE OR REPLACE FUNCTION public.cleanup_destination_tag_test_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tx_count integer;
  alert_count integer;
BEGIN
  -- Delete test transactions
  DELETE FROM wallet_transactions 
  WHERE transaction_hash LIKE 'TEST_%' 
     OR transaction_hash LIKE 'DB_TEST_%'
     OR transaction_hash LIKE 'WHALE_DB_TEST_%'
     OR transaction_hash LIKE 'EXCHANGE_TEST_%'
     OR transaction_hash LIKE 'INTEGRATION_TEST_%'
     OR transaction_hash LIKE 'BULK_TEST_%'
     OR transaction_hash LIKE 'CUSTOM_TEST_%';
  
  GET DIAGNOSTICS tx_count = ROW_COUNT;
  
  -- Delete test whale alerts
  DELETE FROM whale_alerts 
  WHERE transaction_hash LIKE 'TEST_%' 
     OR transaction_hash LIKE 'DB_TEST_%'
     OR transaction_hash LIKE 'WHALE_DB_TEST_%'
     OR transaction_hash LIKE 'EXCHANGE_TEST_%'
     OR transaction_hash LIKE 'INTEGRATION_TEST_%'
     OR transaction_hash LIKE 'BULK_TEST_%'
     OR transaction_hash LIKE 'CUSTOM_TEST_%';
  
  GET DIAGNOSTICS alert_count = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'transactions_deleted', tx_count,
    'alerts_deleted', alert_count,
    'cleanup_timestamp', NOW()
  );
END;
$$;

-- Create function to test destination tag categorization
CREATE OR REPLACE FUNCTION public.test_destination_tag_categorization(p_destination_address text, p_destination_tag text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  exchange_name text;
BEGIN
  -- Simple exchange detection based on known addresses
  CASE p_destination_address
    WHEN 'rLNaPoKeeBjZe2qs6x52yVPZpZ8td4dc6w' THEN exchange_name := 'Binance';
    WHEN 'rEhxGqkqPPSxQ3P25J2N1xnhPSPtpHqhvd' THEN exchange_name := 'Kraken';
    WHEN 'rJHygWcTLVpSXziqBkSdGJHWF5BLXgGojM' THEN exchange_name := 'Coinbase';
    ELSE exchange_name := 'Unknown';
  END CASE;
  
  result := jsonb_build_object(
    'destination_address', p_destination_address,
    'destination_tag', p_destination_tag,
    'exchange_name', exchange_name,
    'is_exchange', exchange_name != 'Unknown',
    'test_timestamp', NOW()
  );
  
  RETURN result;
END;
$$;