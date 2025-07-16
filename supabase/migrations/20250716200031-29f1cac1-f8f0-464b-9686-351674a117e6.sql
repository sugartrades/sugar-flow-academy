-- Add a temporary policy to allow authenticated users to insert whale alerts for testing
CREATE POLICY "Allow authenticated users to insert whale alerts for testing" 
ON whale_alerts 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Also allow authenticated users to update whale alerts for testing
CREATE POLICY "Allow authenticated users to update whale alerts for testing" 
ON whale_alerts 
FOR UPDATE 
TO authenticated
USING (true);