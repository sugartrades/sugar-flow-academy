import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  try {
    console.log("🔄 Starting scheduled XRPL monitoring...");
    
    // Call the main monitoring function
    const response = await supabase.functions.invoke('xrpl-monitor', {
      body: {
        action: 'monitor_all'
      }
    });

    if (response.error) {
      console.error("❌ Monitoring failed:", response.error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: response.error.message 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const result = response.data;
    console.log("✅ Monitoring completed successfully");
    console.log(`📊 Processed ${result.results?.length || 0} wallets`);
    
    // Log summary
    const successful = result.results?.filter(r => !r.error).length || 0;
    const failed = result.results?.filter(r => r.error).length || 0;
    
    console.log(`✅ Successful: ${successful}, ❌ Failed: ${failed}`);
    
    return new Response(JSON.stringify({
      success: true,
      processed: result.results?.length || 0,
      successful,
      failed,
      timestamp: new Date().toISOString()
    }), {
      headers: { "Content-Type": "application/json" }
    });
    
  } catch (error) {
    console.error("💥 Cron job failed:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});