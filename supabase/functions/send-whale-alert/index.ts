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
        requestBody = await req.json();
        console.log('✅ Request body parsed successfully:', requestBody);
      } catch (parseError) {
        console.error('❌ Failed to parse request body:', parseError);
        return new Response(JSON.stringify({ 
          error: 'Failed to parse request body',
          details: parseError.message
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

    // Fetch the whale alert details with trend analysis
    const { data: whaleAlert, error: fetchError } = await supabase
      .from('whale_alerts')
      .select('*')
      .eq('id', whale_alert_id)
      .eq('is_sent', false)
      .single();
    
    // Get trend analysis for this wallet
    let trendData = null;
    if (whaleAlert) {
      const { data: trends } = await supabase.rpc('analyze_whale_trends', {
        p_wallet_address: whaleAlert.wallet_address,
        p_time_window: 'hour'
      });
      trendData = trends;
    }

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

    // Determine alert severity and emoji
    const amount = Number(whaleAlert.amount);
    let alertEmoji = '🐋';
    let severity = 'medium';
    
    if (amount >= 1000000) {
      alertEmoji = '🚨🐋'; // Critical whale
      severity = 'critical';
    } else if (amount >= 500000) {
      alertEmoji = '⚠️🐋'; // High whale  
      severity = 'high';
    } else if (amount >= 100000) {
      alertEmoji = '🔥🐋'; // Medium whale
      severity = 'medium';
    }

    // Create explorer links
    const explorerLinks = {
      xrpscan: `https://xrpscan.com/tx/${whaleAlert.transaction_hash}`,
      xrplorer: `https://xrplorer.com/transaction/${whaleAlert.transaction_hash}`,
      bithomp: `https://bithomp.com/explorer/${whaleAlert.transaction_hash}`
    };

    // Determine alert category specific formatting
    let categoryInfo = '';
    let alertTitle = `${alertEmoji} <b>WHALE ALERT!</b>`;
    
    if (whaleAlert.alert_category === 'exchange_deposit' && whaleAlert.exchange_name) {
      categoryInfo = `\n🏦 <b>Exchange:</b> ${whaleAlert.exchange_name}`;
      if (whaleAlert.destination_tag) {
        categoryInfo += `\n🏷️ <b>Destination Tag:</b> <code>${whaleAlert.destination_tag}</code>`;
      }
      alertTitle = `${alertEmoji} <b>EXCHANGE DEPOSIT ALERT!</b>`;
    }

    // Add trend analysis if available
    let trendInfo = '';
    if (trendData && trendData.recent_transactions > 1) {
      const recentVol = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number(trendData.recent_volume));
      trendInfo = `\n📊 <b>Trend:</b> ${trendData.recent_transactions} transactions (${recentVol} XRP) this hour`;
    }

    // Create the enhanced Telegram message
    const telegramMessage = `${alertTitle}

💰 <b>Amount:</b> ${formattedAmount} XRP
👤 <b>Wallet Owner:</b> ${whaleAlert.owner_name}
📱 <b>Wallet:</b> <code>${whaleAlert.wallet_address}</code>
🔄 <b>Type:</b> ${whaleAlert.transaction_type}${categoryInfo}
🔗 <b>TX Hash:</b> <code>${whaleAlert.transaction_hash}</code>${trendInfo}

⏰ <b>Detected:</b> ${new Date(whaleAlert.created_at).toLocaleString('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })} UTC

🔍 <b>Explorer Links:</b>
• <a href="${explorerLinks.xrpscan}">XRPScan</a>
• <a href="${explorerLinks.xrplorer}">XRPlorer</a>  
• <a href="${explorerLinks.bithomp}">Bithomp</a>

🌊 Powered by Sugar Whale Pro - Real-time XRP monitoring`;

    // Update whale alert with additional metadata
    await supabase
      .from('whale_alerts')  
      .update({
        alert_severity: severity,
        explorer_links: explorerLinks,
        metadata: {
          trend_analysis: trendData,
          formatted_amount: formattedAmount,
          category_details: whaleAlert.alert_category === 'exchange_deposit' ? {
            exchange: whaleAlert.exchange_name,
            destination_tag: whaleAlert.destination_tag
          } : null
        }
      })
      .eq('id', whale_alert_id);

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