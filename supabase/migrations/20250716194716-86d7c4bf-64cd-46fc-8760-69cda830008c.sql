-- Enable pg_net extension and fix the function call
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Update the whale alert trigger function with correct net.http_post syntax
CREATE OR REPLACE FUNCTION send_whale_alert_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only send notification for new whale alerts that haven't been sent yet
  IF NEW.is_sent = false THEN
    -- Call the edge function to send the Telegram notification
    PERFORM net.http_post(
      url => 'https://fyxfbbkgginrbphtrhdi.supabase.co/functions/v1/send-whale-alert',
      headers => '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5eGZiYmtnZ2lucmJwaHRyaGRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODQ4NjE3MywiZXhwIjoyMDY0MDYyMTczfQ.JoTun6WaA9Cg3YS_GfwfRaJmQ2yO9LPQ8RFRVcJTMFs"}'::jsonb,
      body => json_build_object('whale_alert_id', NEW.id)::jsonb
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;