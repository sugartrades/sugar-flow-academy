-- Add the missing Chris Larsen wallet to monitoring
INSERT INTO wallet_monitoring (wallet_address, owner_name, alert_threshold, is_active) VALUES
('rHnx565xVcKadSuxJbAHXv9QSj6ANVRMUB', 'Chris Larsen', 50000, true)
ON CONFLICT (wallet_address) DO NOTHING;