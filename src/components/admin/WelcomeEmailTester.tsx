import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

export function WelcomeEmailTester() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | { success: boolean; message: string }>(null);

  const sendTestEmail = async () => {
    if (!email || !email.includes("@")) {
      setResult({ success: false, message: "Please enter a valid email address" });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Call the test-welcome-email function
      const { data, error } = await supabase.functions.invoke("test-welcome-email", {
        body: { email }
      });

      if (error) throw error;

      console.log("Welcome email test result:", data);
      setResult({ 
        success: true, 
        message: `Welcome email sent to ${email}. Check your inbox!` 
      });
    } catch (error) {
      console.error("Error sending test welcome email:", error);
      setResult({ 
        success: false, 
        message: `Failed to send welcome email: ${error.message || error}` 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>Test Welcome Email</CardTitle>
        <CardDescription>
          Send a test welcome email without creating a new user
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Input 
            type="email" 
            placeholder="Email address" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            disabled={loading}
          />
          <Button 
            onClick={sendTestEmail} 
            disabled={loading || !email}
          >
            {loading ? "Sending..." : "Send Email"}
          </Button>
        </div>

        {result && (
          <Alert className="mt-4" variant={result.success ? "default" : "destructive"}>
            <AlertTitle>{result.success ? "Success!" : "Error"}</AlertTitle>
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        This tool sends a real welcome email to the specified address. Use it for testing purposes only.
      </CardFooter>
    </Card>
  );
}