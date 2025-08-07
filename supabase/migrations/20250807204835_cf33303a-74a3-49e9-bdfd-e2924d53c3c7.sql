-- Security hardening migration

-- 1) Enable RLS on latest_derivatives_data and add safe read policy
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'latest_derivatives_data'
  ) THEN
    RAISE NOTICE 'Table latest_derivatives_data does not exist, skipping RLS enable.';
  ELSE
    EXECUTE 'ALTER TABLE public.latest_derivatives_data ENABLE ROW LEVEL SECURITY';
    -- Create policy if it does not exist
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
        AND tablename = 'latest_derivatives_data'
        AND policyname = 'Anyone can view latest derivatives data'
    ) THEN
      EXECUTE $$CREATE POLICY "Anyone can view latest derivatives data"
        ON public.latest_derivatives_data
        FOR SELECT
        USING (true)$$;
    END IF;
  END IF;
END $$;

-- 2) Remove hardcoded service tokens from DB-triggered HTTP calls by disabling outbound calls
--    Replace bodies of functions to only log for now
CREATE OR REPLACE FUNCTION public.send_welcome_email_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  RAISE LOG 'send_welcome_email_on_signup: outbound call disabled for security; email=%', NEW.email;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.send_whale_alert_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  RAISE LOG 'send_whale_alert_notification: outbound call disabled for security; alert id=%', NEW.id;
  RETURN NEW;
END;
$$;

-- 3) Harden SECURITY DEFINER functions with explicit search_path (no dependency on public search_path)
-- Use ALTER FUNCTION to set search_path safely
DO $$ BEGIN
  PERFORM 1;
  EXCEPTION WHEN undefined_function THEN
    -- ignore
END $$;

-- Apply function-level search_path settings
DO $$ BEGIN
  -- Helper to conditionally alter function settings
  PERFORM 1;
END $$;

ALTER FUNCTION public.test_net_http_post() SET search_path = '';
ALTER FUNCTION public.get_aggregated_derivatives_metrics() SET search_path = '';
ALTER FUNCTION public.generate_destination_tag_test_data(integer) SET search_path = '';
ALTER FUNCTION public.analyze_market_sentiment() SET search_path = '';
ALTER FUNCTION public.handle_new_user_membership() SET search_path = '';
ALTER FUNCTION public.has_role(uuid, app_role) SET search_path = '';
ALTER FUNCTION public.test_destination_tag_categorization(text, text) SET search_path = '';
ALTER FUNCTION public.get_weighted_calibration_metrics(numeric, text, numeric) SET search_path = '';
ALTER FUNCTION public.cleanup_destination_tag_test_data() SET search_path = '';
ALTER FUNCTION public.analyze_whale_trends(text, text) SET search_path = '';
ALTER FUNCTION public.get_current_user_role() SET search_path = '';
ALTER FUNCTION public.get_user_membership_tier(uuid) SET search_path = '';
ALTER FUNCTION public.handle_new_user() SET search_path = '';
ALTER FUNCTION public.make_first_user_super_admin() SET search_path = '';
ALTER FUNCTION public.update_wallet_last_ledger_index(text, bigint) SET search_path = '';
ALTER FUNCTION public.get_current_ledger_index() SET search_path = '';
ALTER FUNCTION public.test_whale_alert_trigger(text, text, text, numeric, text) SET search_path = '';
ALTER FUNCTION public.ensure_wallet_transaction_exists(text, text, numeric, text) SET search_path = '';
