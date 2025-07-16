
import React from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MarketUpdate } from '@/components/MarketUpdate';
import { Bell, Activity, TrendingUp, Clock } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Header showAuth={false} />
      
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Whale Alert Dashboard 🐋
          </h1>
          <p className="text-muted-foreground">Monitor whale movements and stay ahead of the market</p>
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
                <CardDescription>Latest whale movement notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">LARGE MOVEMENT</Badge>
                        <span className="text-sm text-muted-foreground">2 minutes ago</span>
                      </div>
                      <h3 className="font-semibold">Chris Larsen moved 75,000,000 XRP</h3>
                      <p className="text-sm text-muted-foreground">
                        rJNLz3A1qPKfWCtJLPhmMZAfBkutC2Qojm → Exchange detected
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-500">75M</div>
                      <div className="text-sm text-muted-foreground">XRP</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">MEDIUM MOVEMENT</Badge>
                        <span className="text-sm text-muted-foreground">15 minutes ago</span>
                      </div>
                      <h3 className="font-semibold">Arthur Britto moved 12,500,000 XRP</h3>
                      <p className="text-sm text-muted-foreground">
                        rUzSNPtxrmeSTpnjsvaTuQvF2SQFPFSvLn → Private wallet
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-orange-500">12.5M</div>
                      <div className="text-sm text-muted-foreground">XRP</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">SMALL MOVEMENT</Badge>
                        <span className="text-sm text-muted-foreground">1 hour ago</span>
                      </div>
                      <h3 className="font-semibold">Chris Larsen moved 5,000,000 XRP</h3>
                      <p className="text-sm text-muted-foreground">
                        rPoJNiCk7XSFLR28nH2hAbkYqjtMC3hK2k → Private wallet
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-500">5M</div>
                      <div className="text-sm text-muted-foreground">XRP</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <Activity className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">18</div>
                  <p className="text-sm text-muted-foreground">Wallets Monitored</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">47</div>
                  <p className="text-sm text-muted-foreground">Alerts Today</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">2.3s</div>
                  <p className="text-sm text-muted-foreground">Avg Alert Time</p>
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
                    <span className="text-sm">Last Check</span>
                    <span className="text-sm text-muted-foreground">30s ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Next Check</span>
                    <span className="text-sm text-muted-foreground">30s</span>
                  </div>
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
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Chris Larsen</span>
                    <span className="text-sm font-semibold">23 alerts</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Arthur Britto</span>
                    <span className="text-sm font-semibold">18 alerts</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Other Wallets</span>
                    <span className="text-sm font-semibold">6 alerts</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
