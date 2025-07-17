import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get email from request body or query params
    let email;
    let userId;
    
    // Try to parse request body first
    try {
      const body = await req.json();
      email = body.email;
      userId = body.userId;
    } catch (e) {
      // If body parsing fails, check URL params
      const url = new URL(req.url);
      email = url.searchParams.get("email") || "test@example.com";
      userId = url.searchParams.get("userId") || undefined;
    }
    
    console.log(`Attempting to send welcome email to ${email}`);
    
    // Call the welcome email function
    const response = await fetch(
      "https://fyxfbbkgginrbphtrhdi.supabase.co/functions/v1/send-welcome-email", 
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5eGZiYmtnZ2lucmJwaHRyaGRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODQ4NjE3MywiZXhwIjoyMDY0MDYyMTczfQ.JoTun6WaA9Cg3YS_GfwfRaJmQ2yO9LPQ8RFRVcJTMFs`
        },
        body: JSON.stringify({
          email: email,
          userId: userId || "test-user-id"
        })
      }
    );
    
    const result = await response.json();
    console.log("Response:", result);
    
    return new Response(
      JSON.stringify({ success: true, result }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in test function:", error);
    
    return new Response(
      JSON.stringify({ error: "Failed to send test welcome email", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});