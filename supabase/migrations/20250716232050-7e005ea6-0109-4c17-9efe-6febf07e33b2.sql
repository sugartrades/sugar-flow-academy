-- Add the new Chris Larsen wallet addresses to monitoring
INSERT INTO wallet_monitoring (wallet_address, owner_name, alert_threshold, is_active) VALUES
('rNLrQvgfLZNLqcqjAAQYBUNBSC5dVkiDXw', 'Chris Larsen', 10000, true),
('rhmkfhYZY3XJgGTcGxLAKuEoph49bmMqbb', 'Chris Larsen', 10000, true)
ON CONFLICT (wallet_address) DO NOTHING;