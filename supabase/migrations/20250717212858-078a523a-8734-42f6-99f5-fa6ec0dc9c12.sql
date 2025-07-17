-- Create user welcome emails tracking table
CREATE TABLE public.user_welcome_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_welcome_emails ENABLE ROW LEVEL SECURITY;

-- Create policy for super admins
CREATE POLICY "Super admins can manage welcome emails" 
ON public.user_welcome_emails 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Create trigger function to send welcome email after user signup
CREATE OR REPLACE FUNCTION public.send_welcome_email_on_signup()
 RETURNS TRIGGER
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Call edge function to send welcome email
  PERFORM net.http_post(
    url => 'https://fyxfbbkgginrbphtrhdi.supabase.co/functions/v1/send-welcome-email',
    headers => '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5eGZiYmtnZ2lucmJwaHRyaGRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODQ4NjE3MywiZXhwIjoyMDY0MDYyMTczfQ.JoTun6WaA9Cg3YS_GfwfRaJmQ2yO9LPQ8RFRVcJTMFs"}'::jsonb,
    body => json_build_object(
      'email', NEW.email,
      'userId', NEW.id
    )::jsonb
  );
  
  RETURN NEW;
END;
$function$;

-- Create trigger to send welcome email after user creation
CREATE TRIGGER send_welcome_email_after_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.send_welcome_email_on_signup();