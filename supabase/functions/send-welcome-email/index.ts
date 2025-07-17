import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface WelcomeEmailRequest {
  email: string;
  userId?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, userId } = await req.json() as WelcomeEmailRequest;

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Send welcome email
    const emailResult = await resend.emails.send({
      from: "Sugar Whale <hello@sugartrades.io>",
      to: [email],
      subject: "Welcome to Sugar Whale - Your Whale Alert Dashboard",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Welcome to Sugar Whale</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
              }
              .container { padding: 20px; }
              .header { 
                background-color: #2754C5;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 5px 5px 0 0;
              }
              .content { 
                padding: 20px;
                background: #f9f9f9;
                border: 1px solid #ddd;
              }
              .footer {
                text-align: center;
                padding: 10px;
                font-size: 12px;
                color: #666;
              }
              .button {
                display: inline-block;
                background-color: #2754C5;
                color: white;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
              }
              .telegram-section {
                background: #f0f7ff;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
                border: 1px solid #cce5ff;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to Sugar Whale! 🐋</h1>
              </div>
              <div class="content">
                <p>Hello,</p>
                <p>Thank you for signing up for Sugar Whale - your premier whale monitoring dashboard.</p>
                <p>With Sugar Whale, you'll be able to:</p>
                <ul>
                  <li>Monitor large XRP transactions in real-time</li>
                  <li>Track whale movements across exchanges</li>
                  <li>Get instant alerts when significant market activity happens</li>
                  <li>Stay ahead of market trends with our comprehensive dashboard</li>
                </ul>

                <div class="telegram-section">
                  <h3>📱 Join Our Telegram Channel</h3>
                  <p>For the best experience, join our Telegram channel to receive instant whale alerts and market updates:</p>
                  <p><a href="https://t.me/your_whale_alerts_channel" class="button" style="background-color: #0088cc;">Join Telegram Channel</a></p>
                  <p>You'll receive real-time notifications about:</p>
                  <ul>
                    <li>Large XRP movements</li>
                    <li>Exchange deposits and withdrawals</li>
                    <li>Market trend analysis</li>
                    <li>Important whale activity</li>
                  </ul>
                </div>

                <p>Ready to dive in?</p>
                <a href="${supabaseUrl.replace('.supabase.co', '')}" class="button">Access Your Dashboard</a>
                <p>If you have any questions or need assistance, feel free to reply to this email.</p>
                <p>Happy monitoring!</p>
                <p>Best regards,<br>The Sugar Whale Team</p>
              </div>
              <div class="footer">
                <p>© 2025 Sugar Whale. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Welcome email sent:", emailResult);

    if (userId) {
      // Record that welcome email was sent
      await supabase
        .from("user_welcome_emails")
        .insert({
          user_id: userId,
          email: email,
          sent_at: new Date().toISOString()
        })
        .select()
        .single();
    }

    return new Response(
      JSON.stringify({ success: true, message: "Welcome email sent successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-welcome-email function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to send welcome email",
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});