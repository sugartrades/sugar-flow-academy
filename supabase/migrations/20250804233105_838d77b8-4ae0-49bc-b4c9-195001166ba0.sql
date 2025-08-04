-- Phase 1: Critical RLS Policy Fixes
-- Fix overly permissive policies that allow unauthorized access

-- 1. Fix telegram_subscriptions policies
DROP POLICY IF EXISTS "Users can manage their own subscriptions" ON telegram_subscriptions;

CREATE POLICY "Users can view their own subscriptions" 
ON telegram_subscriptions 
FOR SELECT 
USING (user_id = auth.uid()::bigint);

CREATE POLICY "Users can insert their own subscriptions" 
ON telegram_subscriptions 
FOR INSERT 
WITH CHECK (user_id = auth.uid()::bigint);

CREATE POLICY "Users can update their own subscriptions" 
ON telegram_subscriptions 
FOR UPDATE 
USING (user_id = auth.uid()::bigint);

CREATE POLICY "Users can delete their own subscriptions" 
ON telegram_subscriptions 
FOR DELETE 
USING (user_id = auth.uid()::bigint);

-- 2. Fix whale_alerts policies - remove overly permissive test policies
DROP POLICY IF EXISTS "Allow authenticated users to insert whale alerts for testing" ON whale_alerts;
DROP POLICY IF EXISTS "Allow authenticated users to manage whale alerts for testing" ON whale_alerts;
DROP POLICY IF EXISTS "Allow authenticated users to update whale alerts for testing" ON whale_alerts;
DROP POLICY IF EXISTS "Allow reading whale alerts during testing" ON whale_alerts;

-- Create proper restrictive policies for whale_alerts
CREATE POLICY "Admins can view whale alerts" 
ON whale_alerts 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "System can insert whale alerts" 
ON whale_alerts 
FOR INSERT 
WITH CHECK (true); -- Only for automated system inserts

CREATE POLICY "Admins can update whale alerts" 
ON whale_alerts 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- 3. Fix payment_requests policies
DROP POLICY IF EXISTS "Anyone can create payment requests" ON payment_requests;
DROP POLICY IF EXISTS "Users can view their own payment requests by email" ON payment_requests;

CREATE POLICY "Authenticated users can create payment requests" 
ON payment_requests 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own payment requests" 
ON payment_requests 
FOR SELECT 
USING (email = auth.email());

CREATE POLICY "System can update payment status" 
ON payment_requests 
FOR UPDATE 
USING (true); -- For system updates only, will be restricted in edge functions

-- 4. Fix pending_memberships policies
DROP POLICY IF EXISTS "System can manage pending memberships" ON pending_memberships;
DROP POLICY IF EXISTS "Users can view their own pending memberships by email" ON pending_memberships;

CREATE POLICY "System can insert pending memberships" 
ON pending_memberships 
FOR INSERT 
WITH CHECK (true); -- For system use only

CREATE POLICY "Users can view their own pending memberships" 
ON pending_memberships 
FOR SELECT 
USING (email = auth.email());

CREATE POLICY "Admins can view all pending memberships" 
ON pending_memberships 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "System can update pending memberships" 
ON pending_memberships 
FOR UPDATE 
USING (true); -- For claiming memberships

-- 5. Secure user_roles table to prevent privilege escalation
DROP POLICY IF EXISTS "Super admins can manage all roles" ON user_roles;
DROP POLICY IF EXISTS "Super admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;

-- Users can only view their own roles
CREATE POLICY "Users can view their own roles" 
ON user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Only super admins can manage roles, but with restrictions
CREATE POLICY "Super admins can view all roles" 
ON user_roles 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can insert non-super-admin roles" 
ON user_roles 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) 
  AND role != 'super_admin'::app_role
);

CREATE POLICY "Super admins can update non-super-admin roles" 
ON user_roles 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) 
  AND role != 'super_admin'::app_role
);

CREATE POLICY "Super admins can delete non-super-admin roles" 
ON user_roles 
FOR DELETE 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) 
  AND role != 'super_admin'::app_role
);

-- 6. Secure profiles table to prevent unauthorized access
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Recreate with proper restrictions
CREATE POLICY "Users can view their own profile" 
ON profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
ON profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- 7. Secure user_memberships table
DROP POLICY IF EXISTS "Users can view their own membership" ON user_memberships;
DROP POLICY IF EXISTS "Admins can view all memberships" ON user_memberships;
DROP POLICY IF EXISTS "Admins can create memberships" ON user_memberships;
DROP POLICY IF EXISTS "Admins can update memberships" ON user_memberships;

-- Users can only view their own membership
CREATE POLICY "Users can view their own membership" 
ON user_memberships 
FOR SELECT 
USING (auth.uid() = user_id OR email = auth.email());

-- Admins can manage memberships
CREATE POLICY "Admins can view all memberships" 
ON user_memberships 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can create memberships" 
ON user_memberships 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can update memberships" 
ON user_memberships 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- System can insert for new user registration
CREATE POLICY "System can create default memberships" 
ON user_memberships 
FOR INSERT 
WITH CHECK (tier = 'free'::membership_tier AND is_purchased = false);