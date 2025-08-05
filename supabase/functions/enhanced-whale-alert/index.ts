import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Multiple Telegram channels for different alert types
const TELEGRAM_CHANNELS = {
  critical_whales: '-1002780142050', // Main channel for critical alerts (1M+ XRP)
  exchange_deposits: '-1002780142051', // Exchange deposits (100k+ XRP)
  whale_movements: '-1002780142052', // Regular whale movements (50k+ XRP)
  system_alerts: '-1002780142053', // System health and monitoring alerts
};

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
};

interface NotificationAttempt {
  id: string;
  whale_alert_id: string;
  channel_type: string;
  channel_id: string;
  attempt_number: number;
  status: 'pending' | 'success' | 'failed';
  error_message?: string;
  sent_at?: string;
  created_at: string;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendWithRetry(
  sendFunction: () => Promise<any>,
  maxRetries: number = RETRY_CONFIG.maxRetries
): Promise<{ success: boolean; result?: any; error?: string; attempts: number }> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📤 Attempt ${attempt}/${maxRetries}`);
      const result = await sendFunction();
      console.log(`✅ Success on attempt ${attempt}`);
      return { success: true, result, attempts: attempt };
    } catch (error) {
      lastError = error;
      console.error(`❌ Attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        const delay = Math.min(
          RETRY_CONFIG.baseDelay * Math.pow(2, attempt - 1),
          RETRY_CONFIG.maxDelay
        );
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await sleep(delay);
      }
    }
  }
  
  return { 
    success: false, 
    error: lastError?.message || 'Unknown error', 
    attempts: maxRetries 
  };
}

async function sendTelegramMessage(chatId: string, text: string, options: any = {}) {
  const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  
  if (!telegramBotToken) {
    throw new Error('TELEGRAM_BOT_TOKEN not configured');
  }

  const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    ...options
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Telegram API error: ${JSON.stringify(error)}`);
  }

  return await response.json();
}

async function sendEmailNotification(to: string, subject: string, content: string) {
  // Using Resend API for email notifications
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY not configured');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Sugar Whale Pro <alerts@sugarwhalepro.com>',
      to: [to],
      subject: subject,
      html: content,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Email API error: ${JSON.stringify(error)}`);
  }

  return await response.json();
}

function determineAlertChannel(whaleAlert: any): string {
  const amount = Number(whaleAlert.amount);
  
  // Critical whale alerts (1M+ XRP)
  if (amount >= 1000000) {
    return TELEGRAM_CHANNELS.critical_whales;
  }
  
  // Exchange deposits (100k+ XRP)
  if (whaleAlert.alert_category === 'exchange_deposit' && amount >= 100000) {
    return TELEGRAM_CHANNELS.exchange_deposits;
  }
  
  // Regular whale movements (50k+ XRP)
  if (amount >= 50000) {
    return TELEGRAM_CHANNELS.whale_movements;
  }
  
  // Default to whale movements
  return TELEGRAM_CHANNELS.whale_movements;
}

function formatWhaleMessage(whaleAlert: any, trendData: any = null): string {
  const amount = Number(whaleAlert.amount);
  const formattedAmount = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  }).format(amount);

  // Determine alert emoji and severity
  let alertEmoji = '🐋';
  if (amount >= 1000000) alertEmoji = '🚨🐋';
  else if (amount >= 500000) alertEmoji = '⚠️🐋';
  else if (amount >= 100000) alertEmoji = '🔥🐋';

  // Create explorer links
  const explorerLinks = {
    xrpscan: `https://xrpscan.com/tx/${whaleAlert.transaction_hash}`,
    xrplorer: `https://xrplorer.com/transaction/${whaleAlert.transaction_hash}`,
    bithomp: `https://bithomp.com/explorer/${whaleAlert.transaction_hash}`,
    xpmarket: `https://xpmarket.com/tx/${whaleAlert.transaction_hash}`
  };

  // Category specific formatting
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

  return `${alertTitle}

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
• <a href="${explorerLinks.xpmarket}">XPMarket</a>

🌊 Powered by Sugar Whale Pro - Real-time XRP monitoring`;
}

async function logNotificationAttempt(
  whaleAlertId: string,
  channelType: string,
  channelId: string,
  attemptNumber: number,
  status: 'pending' | 'success' | 'failed',
  errorMessage?: string
) {
  const { error } = await supabase
    .from('notification_attempts')
    .insert({
      whale_alert_id: whaleAlertId,
      channel_type: channelType,
      channel_id: channelId,
      attempt_number: attemptNumber,
      status: status,
      error_message: errorMessage,
      sent_at: status === 'success' ? new Date().toISOString() : null
    });

  if (error) {
    console.error('Error logging notification attempt:', error);
  }
}

serve(async (req) => {
  console.log('🚀 Enhanced whale alert function called, method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Health check endpoint
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      message: 'enhanced-whale-alert function is running',
      channels: TELEGRAM_CHANNELS,
      retry_config: RETRY_CONFIG
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const { whale_alert_id, test_mode } = await req.json();
    
    if (!whale_alert_id) {
      return new Response(JSON.stringify({ 
        error: 'whale_alert_id is required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`🔍 Processing enhanced whale alert: ${whale_alert_id}`);

    // Fetch the whale alert details
    const { data: whaleAlert, error: fetchError } = await supabase
      .from('whale_alerts')
      .select('*')
      .eq('id', whale_alert_id)
      .eq('is_sent', false)
      .single();

    if (fetchError || !whaleAlert) {
      return new Response(JSON.stringify({ 
        error: 'Whale alert not found or already sent',
        details: fetchError?.message 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get trend analysis
    const { data: trendData } = await supabase.rpc('analyze_whale_trends', {
      p_wallet_address: whaleAlert.wallet_address,
      p_time_window: 'hour'
    });

    // Determine appropriate channel
    const targetChannel = determineAlertChannel(whaleAlert);
    const channelName = Object.keys(TELEGRAM_CHANNELS).find(
      key => TELEGRAM_CHANNELS[key] === targetChannel
    ) || 'unknown';

    // Format the message
    const message = formatWhaleMessage(whaleAlert, trendData);

    // Send to Telegram with retry logic
    let telegramResult = { message_id: 'test-mode' };
    
    if (!test_mode) {
      const sendResult = await sendWithRetry(async () => {
        return await sendTelegramMessage(targetChannel, message);
      });

      // Log the attempt
      await logNotificationAttempt(
        whale_alert_id,
        'telegram',
        targetChannel,
        sendResult.attempts,
        sendResult.success ? 'success' : 'failed',
        sendResult.error
      );

      if (!sendResult.success) {
        // Try backup notification methods
        console.log('🔄 Telegram failed, trying backup methods...');
        
        // Try sending to system alerts channel as backup
        const backupResult = await sendWithRetry(async () => {
          return await sendTelegramMessage(
            TELEGRAM_CHANNELS.system_alerts, 
            `🚨 <b>BACKUP ALERT</b>\n\nOriginal channel failed: ${channelName}\n\n${message}`
          );
        });

        if (backupResult.success) {
          telegramResult = backupResult.result;
          console.log('✅ Backup notification sent successfully');
        } else {
          return new Response(JSON.stringify({ 
            error: 'All notification methods failed',
            details: sendResult.error 
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      } else {
        telegramResult = sendResult.result;
      }
    }

    // Update whale alert with enhanced metadata
    const { error: updateError } = await supabase
      .from('whale_alerts')
      .update({ 
        is_sent: true, 
        sent_at: new Date().toISOString(),
        alert_severity: whaleAlert.amount >= 1000000 ? 'critical' : 
                       whaleAlert.amount >= 500000 ? 'high' : 'medium',
        metadata: {
          trend_analysis: trendData,
          channel_used: channelName,
          notification_attempts: 1
        }
      })
      .eq('id', whale_alert_id);

    if (updateError) {
      console.error('❌ Failed to update whale alert status:', updateError);
    }

    console.log(`✅ Enhanced whale alert sent successfully: ${whale_alert_id}`);
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Enhanced whale alert sent successfully',
      whale_alert_id,
      channel_used: channelName,
      telegram_result: telegramResult,
      test_mode: !!test_mode
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💥 Error in enhanced-whale-alert function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});