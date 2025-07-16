-- Create function to send whale alert to Telegram
CREATE OR REPLACE FUNCTION send_whale_alert_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only send notification for new whale alerts that haven't been sent yet
  IF NEW.is_sent = false THEN
    -- Call the edge function to send the Telegram notification
    PERFORM net.http_post(
      url := 'https://fyxfbbkgginrbphtrhdi.supabase.co/functions/v1/send-whale-alert',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key', true) || '"}',
      body := json_build_object('whale_alert_id', NEW.id)::text
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires after insert on whale_alerts table
CREATE TRIGGER trigger_send_whale_alert_notification
  AFTER INSERT ON whale_alerts
  FOR EACH ROW
  EXECUTE FUNCTION send_whale_alert_notification();

-- Enable pg_net extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net;