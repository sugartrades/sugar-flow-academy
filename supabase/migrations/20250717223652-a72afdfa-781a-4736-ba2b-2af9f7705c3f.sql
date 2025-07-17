-- Update the send_welcome_email_on_signup function to add more logging
CREATE OR REPLACE FUNCTION public.send_welcome_email_on_signup()
 RETURNS TRIGGER
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  response_text TEXT;
  status_code INT;
BEGIN
  -- Log the attempt
  RAISE LOG 'Attempting to send welcome email to %', NEW.email;
  
  -- Call edge function to send welcome email
  SELECT 
    response.status_code,
    response.content::TEXT
  INTO
    status_code,
    response_text
  FROM 
    net.http_post(
      url => 'https://fyxfbbkgginrbphtrhdi.supabase.co/functions/v1/send-welcome-email',
      headers => '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5eGZiYmtnZ2lucmJwaHRyaGRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODQ4NjE3MywiZXhwIjoyMDY0MDYyMTczfQ.JoTun6WaA9Cg3YS_GfwfRaJmQ2yO9LPQ8RFRVcJTMFs"}'::jsonb,
      body => json_build_object(
        'email', NEW.email,
        'userId', NEW.id
      )::jsonb
    ) AS response;
  
  -- Log the response
  RAISE LOG 'Welcome email function response: status=%, body=%', status_code, response_text;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log any errors
  RAISE LOG 'Error sending welcome email: %', SQLERRM;
  RETURN NEW; -- Still return NEW to not block the user creation
END;
$function$;

-- Make sure the trigger is properly set up
DROP TRIGGER IF EXISTS send_welcome_email_after_signup ON auth.users;

CREATE TRIGGER send_welcome_email_after_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.send_welcome_email_on_signup();