-- Clean up monitoring health records for invalid wallet addresses
DELETE FROM monitoring_health 
WHERE service_name LIKE '%invalid_wallet_address%';