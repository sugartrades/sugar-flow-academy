-- Create payment requests table to track payment attempts
CREATE TABLE public.payment_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'XRP',
  destination_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  xaman_request_id TEXT,
  transaction_hash TEXT,
  ledger_index BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '1 hour')
);

-- Enable RLS
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can create payment requests" 
ON public.payment_requests 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their own payment requests by email" 
ON public.payment_requests 
FOR SELECT 
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_payment_requests_email ON public.payment_requests(email);
CREATE INDEX idx_payment_requests_status ON public.payment_requests(status);
CREATE INDEX idx_payment_requests_xaman_id ON public.payment_requests(xaman_request_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_payment_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payment_requests_updated_at
BEFORE UPDATE ON public.payment_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_payment_requests_updated_at();