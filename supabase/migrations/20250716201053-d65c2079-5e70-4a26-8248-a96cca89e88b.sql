-- Temporarily disable RLS on whale_alerts table for testing
ALTER TABLE whale_alerts DISABLE ROW LEVEL SECURITY;

-- Also disable RLS on wallet_transactions to ensure no foreign key issues
ALTER TABLE wallet_transactions DISABLE ROW LEVEL SECURITY;