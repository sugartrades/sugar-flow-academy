-- Remove the foreign key constraint from user_memberships to auth.users
-- and create a more flexible system for handling pending memberships

-- First, let's remove the existing foreign key constraint
ALTER TABLE public.user_memberships 
DROP CONSTRAINT IF EXISTS user_memberships_user_id_fkey;

-- Create a new table to store pending memberships that don't require a user account yet
CREATE TABLE public.pending_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  payment_id TEXT NOT NULL,
  tier membership_tier NOT NULL DEFAULT 'pro',
  is_purchased BOOLEAN NOT NULL DEFAULT true,
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  claimed_at TIMESTAMP WITH TIME ZONE,
  claimed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on pending_memberships
ALTER TABLE public.pending_memberships ENABLE ROW LEVEL SECURITY;

-- Create policies for pending_memberships
CREATE POLICY "Users can view their own pending memberships by email" 
ON public.pending_memberships 
FOR SELECT 
USING (email = auth.email());

CREATE POLICY "System can manage pending memberships" 
ON public.pending_memberships 
FOR ALL 
USING (true);

-- Create an index for faster lookups
CREATE INDEX idx_pending_memberships_email ON public.pending_memberships(email);
CREATE INDEX idx_pending_memberships_payment_id ON public.pending_memberships(payment_id);

-- Update the user_memberships table to allow NULL user_id temporarily
ALTER TABLE public.user_memberships 
ALTER COLUMN user_id DROP NOT NULL;

-- Add a temporary email field to user_memberships for tracking
ALTER TABLE public.user_memberships 
ADD COLUMN IF NOT EXISTS email TEXT;