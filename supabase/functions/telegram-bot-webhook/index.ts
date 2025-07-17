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

// Telegram channel configurations for different alert types
const TELEGRAM_CHANNELS = {
  critical_whales: '-1002780142050', // Your main channel (1M+ XRP)
  exchange_deposits: '-1002780142051', // Exchange deposits (100k+ XRP)
  whale_movements: '-1002780142052', // Regular whale movements (50k+ XRP)
  system_alerts: '-1002780142053', // System health and monitoring alerts
};

interface TelegramMessage {
  message_id: number;
  from: {
    id: number;
    is_bot: boolean;
    first_name: string;
    username?: string;
  };
  chat: {
    id: number;
    type: string;
  };
  date: number;
  text?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
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

async function handleBotCommand(message: TelegramMessage) {
  const userId = message.from.id;
  const chatId = message.chat.id;
  const text = message.text || '';

  console.log(`📱 Bot command from user ${userId}: ${text}`);

  // Basic commands for whale alert subscriptions
  if (text.startsWith('/start')) {
    const welcomeMessage = `🐋 <b>Welcome to Sugar Whale Pro!</b>

I monitor large XRP transactions and can send you real-time alerts.

<b>Available Commands:</b>
/subscribe_whales - Subscribe to whale movement alerts (50k+ XRP)
/subscribe_exchanges - Subscribe to exchange deposit alerts (100k+ XRP)
/subscribe_critical - Subscribe to critical whale alerts (1M+ XRP)
/unsubscribe_all - Unsubscribe from all alerts
/status - Check your subscription status
/help - Show this help message

<b>Alert Types:</b>
🐋 Whale Movements: Regular large XRP transfers
🏦 Exchange Deposits: Large deposits to major exchanges
🚨 Critical Whales: Massive movements (1M+ XRP)

Get started by choosing a subscription level!`;

    await sendTelegramMessage(chatId.toString(), welcomeMessage);
    return;
  }

  if (text.startsWith('/subscribe_whales')) {
    // Subscribe user to whale alerts
    await supabase.from('telegram_subscriptions').upsert({
      user_id: userId,
      chat_id: chatId,
      subscription_type: 'whale_movements',
      is_active: true
    });

    await sendTelegramMessage(chatId.toString(), 
      '✅ <b>Subscribed to Whale Movement Alerts!</b>\n\nYou\'ll now receive notifications for XRP transfers of 50,000+ XRP.');
    return;
  }

  if (text.startsWith('/subscribe_exchanges')) {
    await supabase.from('telegram_subscriptions').upsert({
      user_id: userId,
      chat_id: chatId,
      subscription_type: 'exchange_deposits',
      is_active: true
    });

    await sendTelegramMessage(chatId.toString(), 
      '✅ <b>Subscribed to Exchange Deposit Alerts!</b>\n\nYou\'ll now receive notifications for large deposits to major exchanges (100,000+ XRP).');
    return;
  }

  if (text.startsWith('/subscribe_critical')) {
    await supabase.from('telegram_subscriptions').upsert({
      user_id: userId,
      chat_id: chatId,
      subscription_type: 'critical_whales',
      is_active: true
    });

    await sendTelegramMessage(chatId.toString(), 
      '✅ <b>Subscribed to Critical Whale Alerts!</b>\n\nYou\'ll now receive notifications for massive XRP movements (1,000,000+ XRP).');
    return;
  }

  if (text.startsWith('/unsubscribe_all')) {
    await supabase.from('telegram_subscriptions')
      .update({ is_active: false })
      .eq('user_id', userId);

    await sendTelegramMessage(chatId.toString(), 
      '❌ <b>Unsubscribed from all alerts.</b>\n\nYou can re-subscribe anytime using the /start command.');
    return;
  }

  if (text.startsWith('/status')) {
    const { data: subscriptions } = await supabase
      .from('telegram_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    let statusMessage = '<b>📊 Your Subscription Status:</b>\n\n';
    
    if (!subscriptions || subscriptions.length === 0) {
      statusMessage += '❌ No active subscriptions\n\nUse /start to subscribe to whale alerts!';
    } else {
      subscriptions.forEach(sub => {
        const emoji = sub.subscription_type === 'critical_whales' ? '🚨' : 
                     sub.subscription_type === 'exchange_deposits' ? '🏦' : '🐋';
        statusMessage += `${emoji} ${sub.subscription_type.replace('_', ' ').toUpperCase()}\n`;
      });
      statusMessage += '\nUse /unsubscribe_all to stop all notifications.';
    }

    await sendTelegramMessage(chatId.toString(), statusMessage);
    return;
  }

  if (text.startsWith('/help')) {
    await handleBotCommand({ ...message, text: '/start' });
    return;
  }

  // Unknown command
  await sendTelegramMessage(chatId.toString(), 
    '❓ Unknown command. Use /help to see available commands.');
}

serve(async (req) => {
  console.log('🤖 Telegram bot webhook called, method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Health check endpoint
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      message: 'telegram-bot-webhook is running',
      channels: Object.keys(TELEGRAM_CHANNELS)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const update: TelegramUpdate = await req.json();
    console.log('📥 Received Telegram update:', update);

    if (update.message) {
      await handleBotCommand(update.message);
    }

    return new Response(JSON.stringify({ status: 'ok' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error processing Telegram webhook:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});