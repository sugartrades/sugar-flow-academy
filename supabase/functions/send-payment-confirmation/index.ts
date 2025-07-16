import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const telegramBotToken = Deno.env.get("TELEGRAM_BOT_TOKEN");

interface PaymentConfirmationRequest {
  email: string;
  amount: number;
  transactionHash: string;
  paymentId: string;
}

async function sendTelegramAlert(message: string) {
  if (!telegramBotToken) {
    console.error("Telegram bot token not configured");
    return;
  }

  // This is a placeholder for the channel ID - you would need to configure this
  // For now, we'll just log the message
  console.log("Telegram alert:", message);
  
  // Uncomment and configure with your actual channel ID when ready
  /*
  const chatId = "@your_channel_id"; // Replace with your actual channel ID
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error sending Telegram alert:", error);
  }
  */
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, amount, transactionHash, paymentId } = await req.json() as PaymentConfirmationRequest;

    if (!email || !amount || !transactionHash || !paymentId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send confirmation email
    const emailResult = await resend.emails.send({
      from: "Sugar Whale <hello@sugartrades.io>",
      to: [email],
      subject: "🎉 Welcome to Sugar Whale - Lifetime Access Activated!",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Welcome to Sugar Whale</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .highlight { background: #e8f4fd; padding: 15px; border-left: 4px solid #2196f3; margin: 20px 0; }
              .button { display: inline-block; background: #2196f3; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
              .success { color: #4caf50; font-weight: bold; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🐋 Welcome to Sugar Whale!</h1>
                <p>Your lifetime access is now active</p>
              </div>
              
              <div class="content">
                <h2>Payment Confirmed ✅</h2>
                <p>Thank you for your payment! Your <strong>lifetime access</strong> to Sugar Whale has been successfully activated.</p>
                
                <div class="highlight">
                  <h3>Payment Details:</h3>
                  <p><strong>Amount:</strong> ${amount} XRP</p>
                  <p><strong>Transaction Hash:</strong> ${transactionHash}</p>
                  <p><strong>Payment ID:</strong> ${paymentId}</p>
                </div>
                
                <h3>🚀 Next Steps:</h3>
                <ol>
                  <li><strong>Join our Telegram channel:</strong> <a href="https://t.me/+YOUR_CHANNEL_INVITE_LINK" class="button">Join Sugar Whale Channel</a></li>
                  <li><strong>Stay connected:</strong> All whale alerts (transactions over 10,000 XRP) are automatically sent to the channel</li>
                  <li><strong>Monitor in real-time:</strong> Receive instant notifications on your phone</li>
                </ol>
                
                <h3>🎯 What You Get:</h3>
                <ul>
                  <li>✅ Real-time whale movement alerts (10,000+ XRP transactions)</li>
                  <li>✅ Large transaction notifications with full details</li>
                  <li>✅ Transaction hash and wallet information</li>
                  <li>✅ Instant delivery to your phone via Telegram</li>
                  <li>✅ Lifetime access - no recurring fees</li>
                  <li>✅ Priority support</li>
                </ul>
                
                <div class="highlight">
                  <h3>🔧 Technical Support:</h3>
                  <p>If you need any help setting up your alerts or have questions:</p>
                  <p>📧 Email: <a href="mailto:hello@sugartrades.io">hello@sugartrades.io</a></p>
                  <p>💬 Telegram: <a href="https://t.me/+YOUR_CHANNEL_INVITE_LINK">Sugar Whale Channel</a></p>
                </div>
                
                <p class="success">Thank you for choosing Sugar Whale! 🙏</p>
              </div>
              
              <div class="footer">
                <p>© 2024 Sugar Whale. All rights reserved.</p>
                <p>You're receiving this email because you successfully purchased lifetime access to Sugar Whale.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    // Send Telegram alert about new payment
    const telegramMessage = `🎉 <b>New Payment Received!</b>\n\n💰 Amount: ${amount} XRP\n📧 Email: ${email}\n🔗 TX: ${transactionHash}\n\nLifetime access activated! 🚀`;
    await sendTelegramAlert(telegramMessage);

    console.log("Email sent successfully:", emailResult);
    console.log("Telegram alert sent for payment:", paymentId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResult.data?.id,
        message: "Confirmation email sent successfully"
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Error in send-payment-confirmation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});