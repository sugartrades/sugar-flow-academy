-- Fix RLS policy to allow users to view whale alerts they create during testing
-- Add a policy for testing purposes
CREATE POLICY "Allow reading whale alerts during testing" 
ON whale_alerts 
FOR SELECT 
USING (true);

-- Check if pg_net extension exists and create a test
DO $$ 
BEGIN
    -- Try to call net.http_post to test if it exists
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
        RAISE EXCEPTION 'pg_net extension is not installed';
    END IF;
END $$;

-- Create a simple test function to verify net.http_post works
CREATE OR REPLACE FUNCTION test_net_http_post()
RETURNS text AS $$
DECLARE
    result text;
BEGIN
    -- Test the net.http_post function
    SELECT net.http_post(
        url => 'https://httpbin.org/post',
        headers => '{"Content-Type": "application/json"}'::jsonb,
        body => '{"test": "data"}'::jsonb
    ) INTO result;
    
    RETURN 'net.http_post test successful: ' || result;
EXCEPTION WHEN OTHERS THEN
    RETURN 'net.http_post test failed: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;