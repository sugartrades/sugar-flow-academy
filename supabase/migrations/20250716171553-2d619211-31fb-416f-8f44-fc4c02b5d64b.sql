-- Enable the required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a cron job to run XRPL monitoring every 5 minutes
SELECT cron.schedule(
  'xrpl-whale-monitoring',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT
    net.http_post(
        url:='https://fyxfbbkgginrbphtrhdi.supabase.co/functions/v1/xrpl-monitor-cron',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5eGZiYmtnZ2lucmJwaHRyaGRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0ODYxNzMsImV4cCI6MjA2NDA2MjE3M30.oW7Cw9w41qWAKpWV1yigsJyxq2t-voTMCdkZg_5hw6s"}'::jsonb,
        body:='{"cron": true}'::jsonb
    ) as request_id;
  $$
);