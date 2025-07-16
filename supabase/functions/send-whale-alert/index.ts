import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🚀 Whale alert function called, method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling CORS preflight request');
    return new Response(null, { 
      headers: corsHeaders,
      status: 200 
    });
  }

  // Health check endpoint
  if (req.method === 'GET') {
    console.log('🏥 Health check requested');
    
    // Check if we have the bot token
    const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const hasToken = !!telegramBotToken;
    const tokenLength = telegramBotToken ? telegramBotToken.length : 0;
    
    return new Response(JSON.stringify({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      message: 'send-whale-alert function is running',
      telegram_config: {
        has_token: hasToken,
        token_length: tokenLength,
        token_preview: telegramBotToken ? `${telegramBotToken.substring(0, 10)}...` : 'NOT SET'
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Add timeout to prevent hanging
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Function timeout after 30 seconds')), 30000);
  });

  const mainPromise = async () => {
    try {
      console.log('📋 Initializing Supabase client...');
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      console.log('📝 Parsing request body...');
      let requestBody;
      try {
        const requestText = await req.text();
        console.log('📄 Raw request body:', requestText);
        
        if (!requestText || requestText.trim() === '') {
          console.error('❌ Empty request body received');
          return new Response(JSON.stringify({ 
            error: 'Empty request body',
            details: 'No data was sent in the request body'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        requestBody = JSON.parse(requestText);
        console.log('✅ Request body parsed successfully:', requestBody);
      } catch (parseError) {
        console.error('❌ Failed to parse request body:', parseError);
        return new Response(JSON.stringify({ 
          error: 'Failed to parse request body',
          details: parseError.message,
          received_data: 'Unable to show raw data due to parsing error'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      const { whale_alert_id, test_mode } = requestBody;
      
      console.log('🔍 Request details:', { whale_alert_id, test_mode, body: requestBody });
    
    if (!whale_alert_id) {
      console.error('❌ No whale_alert_id provided');
      return new Response(JSON.stringify({ 
        error: 'whale_alert_id is required',
        received: requestBody
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`🔍 Processing whale alert notification: ${whale_alert_id}`);

    // Fetch the whale alert details
    const { data: whaleAlert, error: fetchError } = await supabase
      .from('whale_alerts')
      .select('*')
      .eq('id', whale_alert_id)
      .eq('is_sent', false)
      .single();

    if (fetchError) {
      console.error('❌ Failed to fetch whale alert:', fetchError);
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch whale alert',
        details: fetchError.message,
        whale_alert_id
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!whaleAlert) {
      console.error('❌ Whale alert not found or already sent');
      return new Response(JSON.stringify({ 
        error: 'Whale alert not found or already sent',
        whale_alert_id
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Whale alert found:', whaleAlert);

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
    
    if (!telegramBotToken) {
      console.error('❌ TELEGRAM_BOT_TOKEN not configured');
      return new Response(JSON.stringify({ 
        error: 'Telegram bot token not configured',
        details: 'TELEGRAM_BOT_TOKEN environment variable is missing'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('📱 Telegram bot token found, preparing message...');
    
    // Check if we're in test mode (skip Telegram sending)
    const isTestMode = requestBody.test_mode === true;
    
    let telegramResult = { message_id: 'test-mode' };
    
    if (!isTestMode) {
      // Using the provided Telegram channel chat ID
      const telegramChatId = '-1002780142050'; // Your private Telegram channel ID
      
      const telegramUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
      const telegramPayload = {
        chat_id: telegramChatId,
        text: telegramMessage,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      };

      console.log('📤 Sending to Telegram:', { 
        chatId: telegramChatId, 
        url: telegramUrl.replace(telegramBotToken, '[TOKEN]'),
        messageLength: telegramMessage.length 
      });
      
      const telegramResponse = await fetch(telegramUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(telegramPayload)
      });

      telegramResult = await telegramResponse.json();
      
      if (!telegramResponse.ok) {
        console.error('❌ Telegram API error:', telegramResult);
        return new Response(JSON.stringify({ 
          error: 'Failed to send Telegram message',
          details: telegramResult,
          status: telegramResponse.status,
          chatId: telegramChatId,
          message: 'Make sure the Telegram channel exists and the bot has access'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('✅ Telegram message sent successfully:', telegramResult);
    } else {
      console.log('🧪 Test mode: Skipping Telegram send');
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
      console.error('❌ Failed to update whale alert status:', updateError);
      return new Response(JSON.stringify({ 
        error: 'Failed to update whale alert status',
        details: updateError.message,
        whale_alert_id
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`✅ Whale alert sent successfully: ${whale_alert_id}`);
    
    const responseData = { 
      success: true, 
      message: 'Whale alert sent successfully',
      whale_alert_id,
      telegram_result: telegramResult,
      test_mode: isTestMode
    };
    
    console.log('📤 Sending response:', responseData);
    
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

    } catch (error) {
      console.error('💥 Error in send-whale-alert function:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
        stack: error.stack
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  };

  try {
    // Race between main function and timeout
    const result = await Promise.race([mainPromise(), timeoutPromise]);
    return result;
  } catch (error) {
    console.error('💥 Function timeout or error:', error);
    return new Response(JSON.stringify({ 
      error: 'Function timeout or error',
      details: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});