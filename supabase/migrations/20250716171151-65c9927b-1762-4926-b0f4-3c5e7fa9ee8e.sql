-- Create tables for XRPL monitoring and testing

-- Table to store wallet transaction history
CREATE TABLE public.wallet_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  transaction_hash TEXT NOT NULL UNIQUE,
  amount DECIMAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'XRP',
  transaction_type TEXT NOT NULL, -- 'sent' or 'received'
  destination_address TEXT,
  source_address TEXT,
  ledger_index BIGINT NOT NULL,
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table to store wallet monitoring status
CREATE TABLE public.wallet_monitoring (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL UNIQUE,
  owner_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_checked_at TIMESTAMP WITH TIME ZONE,
  last_ledger_index BIGINT,
  alert_threshold DECIMAL NOT NULL DEFAULT 50000,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table to store alerts generated
CREATE TABLE public.whale_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  transaction_hash TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  transaction_type TEXT NOT NULL,
  alert_type TEXT NOT NULL DEFAULT 'whale_movement',
  is_sent BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (transaction_hash) REFERENCES public.wallet_transactions(transaction_hash)
);

-- Table for testing and monitoring system health
CREATE TABLE public.monitoring_health (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL,
  status TEXT NOT NULL, -- 'healthy', 'warning', 'error'
  last_check_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  error_message TEXT,
  response_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whale_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring_health ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - Only admins can access monitoring data
CREATE POLICY "Admins can view all wallet transactions" 
ON public.wallet_transactions 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can insert wallet transactions" 
ON public.wallet_transactions 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can view wallet monitoring" 
ON public.wallet_monitoring 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can manage wallet monitoring" 
ON public.wallet_monitoring 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can view whale alerts" 
ON public.whale_alerts 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can manage whale alerts" 
ON public.whale_alerts 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can view monitoring health" 
ON public.monitoring_health 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can insert monitoring health" 
ON public.monitoring_health 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Create indexes for better performance
CREATE INDEX idx_wallet_transactions_address ON public.wallet_transactions(wallet_address);
CREATE INDEX idx_wallet_transactions_date ON public.wallet_transactions(transaction_date);
CREATE INDEX idx_wallet_transactions_amount ON public.wallet_transactions(amount);
CREATE INDEX idx_wallet_monitoring_address ON public.wallet_monitoring(wallet_address);
CREATE INDEX idx_whale_alerts_created_at ON public.whale_alerts(created_at);
CREATE INDEX idx_monitoring_health_service ON public.monitoring_health(service_name);

-- Create function to update wallet monitoring timestamp
CREATE OR REPLACE FUNCTION public.update_wallet_monitoring_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for wallet monitoring updates
CREATE TRIGGER update_wallet_monitoring_updated_at
  BEFORE UPDATE ON public.wallet_monitoring
  FOR EACH ROW
  EXECUTE FUNCTION public.update_wallet_monitoring_timestamp();

-- Insert initial wallet monitoring data
INSERT INTO public.wallet_monitoring (wallet_address, owner_name, alert_threshold) VALUES
('rUzSNPtxrmeSTpnjsvaTuQvF2SQFPFSvLn', 'Arthur Britto', 50000),
('rQKZSMgmBJvv3FvWj1vuGjUXnegTqJc25z', 'Arthur Britto', 50000),
('rsXNUCJkXeyFuGHyfRnuWPita2ns32upBD', 'Arthur Britto', 50000),
('ragKXjY7cBTXUus32sYHZVfkY46Nt2Q829', 'Arthur Britto', 50000),
('rsF9cc6gniHLTR2Jng29ng21ez7L9PpmPt', 'Arthur Britto', 50000),
('rJ5EJYsW6Vkeruj1LAmQYq3VP7QUQKBH1W', 'Arthur Britto', 50000),
('rGRGYWLmSvPuhKm4rQV287PpJUgTB1VeD7', 'Arthur Britto', 50000),
('rLHVsKqC72M8FXPfEwSyYkufezZJvNZuDY', 'Arthur Britto', 50000),
('rEbKBkgKSQgm5x8PycZc5VjdCVTmqYfcY1', 'Arthur Britto', 50000),
('rG2eEaeiJou6cVQ3KtX7XMNwGhuW99xmHP', 'Arthur Britto', 50000),
('r476293LUcDqtjiSGJ5Dh44J1xBCDWeX3', 'Chris Larsen', 50000),
('r44CNwMWyJf4MEA1eHVMLPTkZ1LSv4Bzrv', 'Chris Larsen', 50000),
('rD6tdgGHG7hwGTA6P39aE7W89fbqxXRjzk', 'Chris Larsen', 50000),
('rDfrrrBJZshSQDvfT2kmL9oUBdish52unH', 'Chris Larsen', 50000),
('rhREXVHV938ToGkdJQ9NCYEY4x8kSEtjna', 'Chris Larsen', 50000),
('rPoJNiCk7XSFLR28nH2hAbkYqjtMC3hK2k', 'Chris Larsen', 50000),
('raorBmbzraA6TooLQ6kGWRSx1HQq7d4gzS', 'Chris Larsen', 50000),
('rJNLz3A1qPKfWCtJLPhmMZAfBkutC2Qojm', 'Chris Larsen', 50000);