import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { whale_alert_id } = await req.json();
    
    console.log(`Processing whale alert notification: ${whale_alert_id}`);

    // Fetch the whale alert details
    const { data: whaleAlert, error: fetchError } = await supabase
      .from('whale_alerts')
      .select('*')
      .eq('id', whale_alert_id)
      .eq('is_sent', false)
      .single();

    if (fetchError || !whaleAlert) {
      console.error('Failed to fetch whale alert:', fetchError);
      return new Response(JSON.stringify({ error: 'Whale alert not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Format the amount with proper number formatting
    const formattedAmount = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0
    }).format(Number(whaleAlert.amount));

    // Create the Telegram message
    const telegramMessage = `🐋 <b>WHALE ALERT!</b>

💰 <b>Amount:</b> ${formattedAmount} XRP
👤 <b>Wallet Owner:</b> ${whaleAlert.owner_name}
📱 <b>Wallet:</b> <code>${whaleAlert.wallet_address}</code>
🔄 <b>Type:</b> ${whaleAlert.transaction_type}
🔗 <b>TX Hash:</b> <code>${whaleAlert.transaction_hash}</code>

⏰ <b>Detected:</b> ${new Date(whaleAlert.created_at).toLocaleString('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })} UTC

🌊 Large XRP movements detected by Sugar Whale Pro`;

    // Send to Telegram
    const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const telegramChatId = '@SugarWhaleBot'; // Channel username
    
    if (!telegramBotToken) {
      console.error('TELEGRAM_BOT_TOKEN not configured');
      return new Response(JSON.stringify({ error: 'Telegram bot token not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const telegramUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
    const telegramPayload = {
      chat_id: telegramChatId,
      text: telegramMessage,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    };

    console.log('Sending Telegram message for whale alert:', whale_alert_id);
    
    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(telegramPayload)
    });

    if (!telegramResponse.ok) {
      const errorText = await telegramResponse.text();
      console.error('Failed to send Telegram message:', errorText);
      return new Response(JSON.stringify({ error: 'Failed to send Telegram message' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Mark the whale alert as sent
    const { error: updateError } = await supabase
      .from('whale_alerts')
      .update({ 
        is_sent: true, 
        sent_at: new Date().toISOString() 
      })
      .eq('id', whale_alert_id);

    if (updateError) {
      console.error('Failed to update whale alert status:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to update whale alert status' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`✅ Whale alert sent successfully: ${whale_alert_id}`);
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Whale alert sent successfully',
      whale_alert_id
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in send-whale-alert function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});