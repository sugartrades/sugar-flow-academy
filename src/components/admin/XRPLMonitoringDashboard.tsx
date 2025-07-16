import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useXRPLMonitoring } from '@/hooks/useXRPLMonitoring';
import { Activity, AlertTriangle, CheckCircle, Play, Settings, Wallet, XCircle } from 'lucide-react';

export const XRPLMonitoringDashboard = () => {
  const {
    transactions,
    alerts,
    healthStatus,
    walletMonitoring,
    loading,
    runMonitoring,
    updateWalletThreshold,
    toggleWalletMonitoring,
  } = useXRPLMonitoring();

  const [thresholdInputs, setThresholdInputs] = useState<Record<string, string>>({});

  const handleThresholdUpdate = async (walletAddress: string) => {
    const threshold = parseFloat(thresholdInputs[walletAddress] || '0');
    if (threshold > 0) {
      await updateWalletThreshold(walletAddress, threshold);
      setThresholdInputs(prev => ({ ...prev, [walletAddress]: '' }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">XRPL Monitoring Dashboard</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => runMonitoring('all')}
            disabled={loading}
            size="sm"
          >
            <Play className="w-4 h-4 mr-2" />
            Run Full Monitoring
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="wallets">Wallets</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Wallets</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {walletMonitoring.filter(w => w.is_active).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  of {walletMonitoring.length} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Transactions</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{transactions.length}</div>
                <p className="text-xs text-muted-foreground">
                  Last 24 hours
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Whale Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{alerts.length}</div>
                <p className="text-xs text-muted-foreground">
                  Total alerts generated
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {healthStatus.filter(h => h.status === 'healthy').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Healthy services
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="wallets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Wallet Monitoring Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {walletMonitoring.map((wallet) => (
                  <div key={wallet.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {wallet.wallet_address}
                        </code>
                        <Badge variant="outline">{wallet.owner_name}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Last checked: {wallet.last_checked_at ? formatDate(wallet.last_checked_at) : 'Never'}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`threshold-${wallet.wallet_address}`} className="text-sm">
                          Threshold:
                        </Label>
                        <Input
                          id={`threshold-${wallet.wallet_address}`}
                          type="number"
                          placeholder={wallet.alert_threshold.toString()}
                          value={thresholdInputs[wallet.wallet_address] || ''}
                          onChange={(e) => setThresholdInputs(prev => ({
                            ...prev,
                            [wallet.wallet_address]: e.target.value
                          }))}
                          className="w-20"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleThresholdUpdate(wallet.wallet_address)}
                          disabled={!thresholdInputs[wallet.wallet_address]}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`active-${wallet.wallet_address}`} className="text-sm">
                          Active:
                        </Label>
                        <Switch
                          id={`active-${wallet.wallet_address}`}
                          checked={wallet.is_active}
                          onCheckedChange={(checked) => 
                            toggleWalletMonitoring(wallet.wallet_address, checked)
                          }
                        />
                      </div>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => runMonitoring('single', wallet.wallet_address, wallet.owner_name)}
                        disabled={loading}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Test
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {transactions.slice(0, 20).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {tx.transaction_hash.substring(0, 16)}...
                        </code>
                        <Badge variant={tx.transaction_type === 'sent' ? 'destructive' : 'default'}>
                          {tx.transaction_type}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {formatDate(tx.transaction_date)}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-mono text-sm">
                        {formatAmount(tx.amount)} {tx.currency}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {tx.wallet_address.substring(0, 10)}...
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Whale Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg bg-orange-50 dark:bg-orange-900/20">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        <Badge variant="outline">{alert.owner_name}</Badge>
                        <Badge variant={alert.is_sent ? 'default' : 'secondary'}>
                          {alert.is_sent ? 'Sent' : 'Pending'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {formatDate(alert.created_at)}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-mono text-sm font-bold text-orange-600">
                        {formatAmount(alert.amount)} XRP
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {alert.transaction_type}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Health Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {healthStatus.map((health) => (
                  <div key={health.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(health.status)}`} />
                      <span className="font-medium">{health.service_name}</span>
                      <Badge variant={health.status === 'healthy' ? 'default' : 'destructive'}>
                        {health.status}
                      </Badge>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm">
                        {health.response_time_ms && `${health.response_time_ms}ms`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(health.last_check_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};