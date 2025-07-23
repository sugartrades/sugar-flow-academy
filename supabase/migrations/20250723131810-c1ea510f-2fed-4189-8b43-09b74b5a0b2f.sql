-- Add the new Ripple wallet addresses to monitoring
INSERT INTO wallet_monitoring (wallet_address, owner_name, alert_threshold, is_active) VALUES
('rLBHKfeHUf6RK3y3ij3y6Ea3b7MxqaLgK3', 'Ripple', 10000, true),
('rB5AptBVH8nzavopD9PCbkPgj1DHSkau1w', 'Ripple', 10000, true)
ON CONFLICT (wallet_address) DO NOTHING;