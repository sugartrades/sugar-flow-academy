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

const SYSTEM_ALERTS_CHANNEL = '-1002780142053';

interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  response_time?: number;
  error_message?: string;
  last_success?: string;
}

async function sendSystemAlert(message: string, severity: 'info' | 'warning' | 'critical' = 'info') {
  const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  
  if (!telegramBotToken) {
    console.error('TELEGRAM_BOT_TOKEN not configured for system alerts');
    return;
  }

  const emoji = severity === 'critical' ? '🚨' : severity === 'warning' ? '⚠️' : 'ℹ️';
  const formattedMessage = `${emoji} <b>SYSTEM ALERT</b>\n\n${message}\n\n⏰ ${new Date().toLocaleString('en-US', { timeZone: 'UTC' })} UTC`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: SYSTEM_ALERTS_CHANNEL,
        text: formattedMessage,
        parse_mode: 'HTML'
      })
    });

    if (!response.ok) {
      console.error('Failed to send system alert:', await response.text());
    }
  } catch (error) {
    console.error('Error sending system alert:', error);
  }
}

async function checkXRPLMonitorHealth(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    const response = await supabase.functions.invoke('xrpl-monitor', {
      body: { action: 'health_check' }
    });

    const responseTime = Date.now() - startTime;

    if (response.error) {
      return {
        service: 'xrpl-monitor',
        status: 'down',
        response_time: responseTime,
        error_message: response.error.message
      };
    }

    // Check if response time is reasonable (< 30 seconds)
    const status = responseTime > 30000 ? 'degraded' : 'healthy';

    return {
      service: 'xrpl-monitor',
      status,
      response_time: responseTime,
      last_success: new Date().toISOString()
    };

  } catch (error) {
    return {
      service: 'xrpl-monitor',
      status: 'down',
      response_time: Date.now() - startTime,
      error_message: error.message
    };
  }
}

async function checkWhaleAlertHealth(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    const response = await supabase.functions.invoke('send-whale-alert', {
      body: {}
    });

    const responseTime = Date.now() - startTime;

    // For GET request (health check), we expect it to work
    if (response.status === 200) {
      return {
        service: 'send-whale-alert',
        status: 'healthy',
        response_time: responseTime,
        last_success: new Date().toISOString()
      };
    }

    return {
      service: 'send-whale-alert',
      status: 'degraded',
      response_time: responseTime,
      error_message: 'Unexpected response status'
    };

  } catch (error) {
    return {
      service: 'send-whale-alert',
      status: 'down',
      response_time: Date.now() - startTime,
      error_message: error.message
    };
  }
}

async function checkDatabaseHealth(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    // Simple database connectivity test
    const { data, error } = await supabase
      .from('monitoring_health')
      .select('count')
      .limit(1);

    const responseTime = Date.now() - startTime;

    if (error) {
      return {
        service: 'database',
        status: 'down',
        response_time: responseTime,
        error_message: error.message
      };
    }

    return {
      service: 'database',
      status: 'healthy',
      response_time: responseTime,
      last_success: new Date().toISOString()
    };

  } catch (error) {
    return {
      service: 'database',
      status: 'down',
      response_time: Date.now() - startTime,
      error_message: error.message
    };
  }
}

async function checkRecentWhaleActivity(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    // Check if we've had any whale alerts in the last 24 hours
    const { data: recentAlerts, error } = await supabase
      .from('whale_alerts')
      .select('count')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .limit(1);

    const responseTime = Date.now() - startTime;

    if (error) {
      return {
        service: 'whale-activity',
        status: 'down',
        response_time: responseTime,
        error_message: error.message
      };
    }

    // Check if monitoring is working (should have some activity)
    const { data: monitoringRecords } = await supabase
      .from('monitoring_health')
      .select('count')
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
      .limit(1);

    const hasRecentMonitoring = monitoringRecords && monitoringRecords.length > 0;

    return {
      service: 'whale-activity',
      status: hasRecentMonitoring ? 'healthy' : 'degraded',
      response_time: responseTime,
      last_success: new Date().toISOString()
    };

  } catch (error) {
    return {
      service: 'whale-activity',
      status: 'down',
      response_time: Date.now() - startTime,
      error_message: error.message
    };
  }
}

async function storeHealthResults(healthChecks: HealthCheck[]) {
  for (const check of healthChecks) {
    await supabase
      .from('monitoring_health')
      .insert({
        service_name: check.service,
        status: check.status,
        response_time_ms: check.response_time,
        error_message: check.error_message
      });
  }
}

async function analyzeHealthTrends(): Promise<string[]> {
  const issues: string[] = [];
  
  // Check for services that have been down for more than 15 minutes
  const { data: persistentIssues } = await supabase
    .from('monitoring_health')
    .select('service_name, status, created_at')
    .eq('status', 'down')
    .gte('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false });

  if (persistentIssues && persistentIssues.length > 0) {
    const groupedIssues = {};
    persistentIssues.forEach(issue => {
      if (!groupedIssues[issue.service_name]) {
        groupedIssues[issue.service_name] = 0;
      }
      groupedIssues[issue.service_name]++;
    });

    Object.entries(groupedIssues).forEach(([service, count]) => {
      if (count >= 3) { // 3 consecutive failures
        issues.push(`🔴 ${service} has been down for 15+ minutes (${count} failures)`);
      }
    });
  }

  // Check for degraded performance
  const { data: slowServices } = await supabase
    .from('monitoring_health')
    .select('service_name, response_time_ms')
    .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
    .gt('response_time_ms', 15000); // Slower than 15 seconds

  if (slowServices && slowServices.length > 5) {
    issues.push(`🟡 System performance degraded - ${slowServices.length} slow responses in the last hour`);
  }

  return issues;
}

serve(async (req) => {
  console.log('🏥 System health monitor called, method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Health check endpoint
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      message: 'system-health-monitor is running'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    console.log('🔍 Starting comprehensive system health check...');

    // Run all health checks in parallel
    const [
      xrplHealth,
      whaleAlertHealth,
      databaseHealth,
      activityHealth
    ] = await Promise.all([
      checkXRPLMonitorHealth(),
      checkWhaleAlertHealth(),
      checkDatabaseHealth(),
      checkRecentWhaleActivity()
    ]);

    const allHealthChecks = [xrplHealth, whaleAlertHealth, databaseHealth, activityHealth];

    // Store results in database
    await storeHealthResults(allHealthChecks);

    // Check for any critical issues
    const criticalIssues = allHealthChecks.filter(check => check.status === 'down');
    const degradedServices = allHealthChecks.filter(check => check.status === 'degraded');

    // Analyze trends for persistent issues
    const trendIssues = await analyzeHealthTrends();

    // Send alerts if needed
    if (criticalIssues.length > 0) {
      const criticalMessage = `<b>CRITICAL SYSTEM ISSUES DETECTED:</b>\n\n${
        criticalIssues.map(issue => 
          `🚨 <b>${issue.service}</b>: ${issue.error_message || 'Service down'}`
        ).join('\n')
      }`;
      
      await sendSystemAlert(criticalMessage, 'critical');
    }

    if (degradedServices.length > 0 && criticalIssues.length === 0) {
      const degradedMessage = `<b>PERFORMANCE DEGRADATION DETECTED:</b>\n\n${
        degradedServices.map(service => 
          `⚠️ <b>${service.service}</b>: Slow response (${service.response_time}ms)`
        ).join('\n')
      }`;
      
      await sendSystemAlert(degradedMessage, 'warning');
    }

    if (trendIssues.length > 0) {
      const trendMessage = `<b>PERSISTENT ISSUES DETECTED:</b>\n\n${trendIssues.join('\n')}`;
      await sendSystemAlert(trendMessage, 'critical');
    }

    // Summary report
    const healthySystems = allHealthChecks.filter(check => check.status === 'healthy');
    let summaryMessage = '';

    if (criticalIssues.length === 0 && degradedServices.length === 0 && trendIssues.length === 0) {
      summaryMessage = `✅ <b>ALL SYSTEMS HEALTHY</b>\n\n${healthySystems.length}/4 services operational\n\nLast check: ${new Date().toLocaleString('en-US', { timeZone: 'UTC' })} UTC`;
      
      // Send periodic health summary (every 6 hours)
      const lastSummary = await supabase
        .from('monitoring_health')
        .select('created_at')
        .eq('service_name', 'health-summary')
        .order('created_at', { ascending: false })
        .limit(1);

      const shouldSendSummary = !lastSummary.data?.[0] || 
        new Date().getTime() - new Date(lastSummary.data[0].created_at).getTime() > 6 * 60 * 60 * 1000;

      if (shouldSendSummary) {
        await sendSystemAlert(summaryMessage, 'info');
        await supabase.from('monitoring_health').insert({
          service_name: 'health-summary',
          status: 'healthy',
          response_time_ms: 0
        });
      }
    }

    console.log('✅ System health check completed');

    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        healthy: healthySystems.length,
        degraded: degradedServices.length,
        critical: criticalIssues.length,
        trend_issues: trendIssues.length
      },
      health_checks: allHealthChecks,
      issues: [...criticalIssues.map(i => i.error_message), ...trendIssues]
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💥 Error in system health monitor:', error);
    
    // Send critical alert about monitoring system failure
    await sendSystemAlert(
      `<b>MONITORING SYSTEM FAILURE</b>\n\nHealth monitor itself has failed: ${error.message}`,
      'critical'
    );

    return new Response(JSON.stringify({ 
      error: 'Health monitor failure',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});