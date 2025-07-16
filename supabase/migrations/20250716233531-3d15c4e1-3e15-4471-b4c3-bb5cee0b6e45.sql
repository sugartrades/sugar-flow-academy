-- Add the new Chris Larsen wallet address to monitoring
INSERT INTO wallet_monitoring (wallet_address, owner_name, alert_threshold, is_active) VALUES
('rB5TihdPbKgMrkFqrqUC3yLdE8hhv4BdeY', 'Chris Larsen', 10000, true)
ON CONFLICT (wallet_address) DO NOTHING;