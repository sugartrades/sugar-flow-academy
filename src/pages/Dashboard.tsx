import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MarketUpdate } from '@/components/MarketUpdate';
import { Bell, Activity, TrendingUp, Clock, ExternalLink, RefreshCw, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface WhaleAlert {
  id: string;
  owner_name: string;
  amount: number;
  transaction_hash: string;
  transaction_type: string;
  alert_category: string;
  alert_severity: string;
  exchange_name?: string;
  destination_tag?: string;
  created_at: string;
  metadata?: any;
  explorer_links?: any;
}

interface DashboardStats {
  totalWallets: number;
  alertsToday: number;
  topWallets: { owner_name: string; alert_count: number }[];
}

export default function Dashboard() {
  const [recentAlerts, setRecentAlerts] = useState<WhaleAlert[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalWallets: 0,
    alertsToday: 0,
    topWallets: []
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Track initial load vs refresh
  const [initialLoad, setInitialLoad] = useState(true);

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      // Only show loading indicator on initial load, not during refreshes
      if (!isRefresh) {
        setLoading(true);
      }

      // Fetch recent alerts
      const { data: alerts, error: alertsError } = await supabase
        .from('whale_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (alertsError) throw alertsError;

      // Fetch today's alert count
      const { data: todayCount, error: countError } = await supabase
        .from('whale_alerts')
        .select('id', { count: 'exact' })
        .gte('created_at', new Date().toISOString().split('T')[0]);

      if (countError) throw countError;

      // Fetch active wallets count
      const { data: walletsCount, error: walletsError } = await supabase
        .from('wallet_monitoring')
        .select('id', { count: 'exact' })
        .eq('is_active', true);

      if (walletsError) throw walletsError;

      // Fetch top wallets by alert count
      const { data: topWallets, error: topWalletsError } = await supabase
        .from('whale_alerts')
        .select('owner_name')
        .not('owner_name', 'like', 'Test%') // Exclude test data
        .order('created_at', { ascending: false });

      if (topWalletsError) throw topWalletsError;

      // Process top wallets
      const walletCounts = topWallets?.reduce((acc, alert) => {
        acc[alert.owner_name] = (acc[alert.owner_name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const topWalletsArray = Object.entries(walletCounts)
        .map(([owner_name, alert_count]) => ({ owner_name, alert_count }))
        .sort((a, b) => b.alert_count - a.alert_count)
        .slice(0, 5);

      setRecentAlerts(alerts || []);
      setStats({
        totalWallets: walletsCount?.length || 0,
        alertsToday: todayCount?.length || 0,
        topWallets: topWalletsArray
      });
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load
    fetchDashboardData(false);
    
    // Auto-refresh every 30 seconds - use isRefresh=true to prevent loading state
    const interval = setInterval(() => fetchDashboardData(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toString();
  };

  const getBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getBadgeText = (severity: string, amount: number) => {
    if (amount >= 50000000) return 'LARGE MOVEMENT';
    if (amount >= 10000000) return 'MEDIUM MOVEMENT';
    return 'SMALL MOVEMENT';
  };

  const getAmountColor = (amount: number) => {
    if (amount >= 50000000) return 'text-red-500';
    if (amount >= 10000000) return 'text-orange-500';
    return 'text-blue-500';
  };

  const openExplorer = (alert: WhaleAlert) => {
    if (alert.explorer_links?.xrpscan) {
      window.open(alert.explorer_links.xrpscan, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showAuth={false} isAuthenticated={true} />
      
      <div className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Whale Alert Dashboard 🐋
            </h1>
            <p className="text-muted-foreground">Monitor whale movements and stay ahead of the market</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Last updated: {formatDistanceToNow(lastUpdate, { addSuffix: true })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchDashboardData(false)}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Alerts */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Recent Whale Alerts
                </CardTitle>
                <CardDescription>Latest whale movement notifications from your monitoring system</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading alerts...</div>
                ) : recentAlerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent alerts found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentAlerts.map((alert) => (
                      <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={getBadgeVariant(alert.alert_severity)}>
                              {getBadgeText(alert.alert_severity, alert.amount)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                            </span>
                            {alert.owner_name?.startsWith('Test') && (
                              <Badge variant="outline" className="text-xs">TEST DATA</Badge>
                            )}
                          </div>
                          <h3 className="font-semibold">
                            {alert.owner_name} moved {formatAmount(alert.amount)} XRP
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            <span 
                              className="font-mono cursor-pointer hover:bg-muted px-1 py-0.5 rounded select-all break-all"
                              title="Click to select full transaction hash"
                              onClick={(e) => {
                                const selection = window.getSelection();
                                const range = document.createRange();
                                range.selectNodeContents(e.currentTarget);
                                selection?.removeAllRanges();
                                selection?.addRange(range);
                              }}
                            >
                              {alert.transaction_hash}
                            </span>
                            {alert.exchange_name && (
                              <span className="block mt-1">→ {alert.exchange_name} detected</span>
                            )}
                            {alert.destination_tag && (
                              <span className="block">Tag: {alert.destination_tag}</span>
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getAmountColor(alert.amount)}`}>
                            {formatAmount(alert.amount)}
                          </div>
                          <div className="text-sm text-muted-foreground">XRP</div>
                          {alert.explorer_links?.xrpscan && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openExplorer(alert)}
                              className="mt-1 h-6 px-2"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <Activity className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stats.totalWallets}</div>
                  <p className="text-sm text-muted-foreground">Wallets Monitored</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stats.alertsToday}</div>
                  <p className="text-sm text-muted-foreground">Alerts Today</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">~30s</div>
                  <p className="text-sm text-muted-foreground">Check Interval</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Real-time Market Update */}
            <MarketUpdate />

            {/* Monitoring Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">🔄 Monitoring Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">System Status</span>
                    <Badge variant="default" className="bg-green-500">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Check Interval</span>
                    <span className="text-sm text-muted-foreground">30s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Update</span>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(lastUpdate, { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Telegram Channel */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  📢 Telegram Channel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Join our Telegram channel to receive real-time whale alerts and market updates
                  </p>
                  <a 
                    href="#"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
                    onClick={(e) => {
                      e.preventDefault();
                      window.open("https://t.me/xrpwhalealerts", "_blank", "noopener,noreferrer");
                    }}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Join Telegram Channel
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Top Wallets */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">📊 Top Wallets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.topWallets.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No wallet data available</p>
                  ) : (
                    stats.topWallets.map((wallet, index) => (
                      <div key={wallet.owner_name} className="flex items-center justify-between">
                        <span className="text-sm">{wallet.owner_name}</span>
                        <span className="text-sm font-semibold">{wallet.alert_count} alerts</span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}