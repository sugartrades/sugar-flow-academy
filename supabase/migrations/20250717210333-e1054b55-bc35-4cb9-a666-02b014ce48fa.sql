-- Update the cleanup function to handle foreign key constraints correctly
CREATE OR REPLACE FUNCTION public.cleanup_destination_tag_test_data()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  tx_count integer;
  alert_count integer;
BEGIN
  -- Delete test whale alerts first (due to foreign key constraint)
  DELETE FROM whale_alerts 
  WHERE transaction_hash LIKE 'TEST_%' 
     OR transaction_hash LIKE 'DB_TEST_%'
     OR transaction_hash LIKE 'WHALE_DB_TEST_%'
     OR transaction_hash LIKE 'EXCHANGE_TEST_%'
     OR transaction_hash LIKE 'INTEGRATION_TEST_%'
     OR transaction_hash LIKE 'BULK_TEST_%'
     OR transaction_hash LIKE 'CUSTOM_TEST_%'
     OR owner_name LIKE 'Test%';
  
  GET DIAGNOSTICS alert_count = ROW_COUNT;
  
  -- Then delete test transactions
  DELETE FROM wallet_transactions 
  WHERE transaction_hash LIKE 'TEST_%' 
     OR transaction_hash LIKE 'DB_TEST_%'
     OR transaction_hash LIKE 'WHALE_DB_TEST_%'
     OR transaction_hash LIKE 'EXCHANGE_TEST_%'
     OR transaction_hash LIKE 'INTEGRATION_TEST_%'
     OR transaction_hash LIKE 'BULK_TEST_%'
     OR transaction_hash LIKE 'CUSTOM_TEST_%';
  
  GET DIAGNOSTICS tx_count = ROW_COUNT;
  
  -- Also clean up any notification attempts for deleted alerts
  DELETE FROM notification_attempts 
  WHERE whale_alert_id NOT IN (SELECT id FROM whale_alerts);
  
  RETURN jsonb_build_object(
    'transactions_deleted', tx_count,
    'alerts_deleted', alert_count,
    'cleanup_timestamp', NOW()
  );
END;
$function$;