
import React from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Community() {
  const discussions = [
    {
      id: 1,
      title: "Bitcoin breaking $45k resistance - what's next?",
      author: "CryptoTrader92",
      replies: 23,
      lastActivity: "2 hours ago",
      category: "Market Analysis",
      isHot: true
    },
    {
      id: 2,
      title: "Best indicators for altcoin trading?",
      author: "NewbieTrader",
      replies: 15,
      lastActivity: "4 hours ago",
      category: "Technical Analysis",
      isHot: false
    },
    {
      id: 3,
      title: "Risk management strategies that saved my portfolio",
      author: "SafeTrader",
      replies: 31,
      lastActivity: "6 hours ago",
      category: "Risk Management",
      isHot: true
    },
    {
      id: 4,
      title: "DeFi yield farming - worth the risk?",
      author: "DeFiExplorer",
      replies: 12,
      lastActivity: "8 hours ago",
      category: "DeFi",
      isHot: false
    }
  ];

  const topContributors = [
    { name: "Alex Johnson", points: 2340, avatar: "AJ" },
    { name: "Sarah Chen", points: 1890, avatar: "SC" },
    { name: "Mike Rodriguez", points: 1567, avatar: "MR" },
    { name: "Emma Davis", points: 1234, avatar: "ED" },
    { name: "John Smith", points: 1001, avatar: "JS" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header showAuth={false} />
      
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Community Hub</h1>
          <p className="text-muted-foreground">
            Connect with fellow traders, share insights, and learn together
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Community Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-primary mb-2">12,450</div>
                  <p className="text-sm text-muted-foreground">Active Members</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-primary mb-2">856</div>
                  <p className="text-sm text-muted-foreground">Discussions Today</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-primary mb-2">24/7</div>
                  <p className="text-sm text-muted-foreground">Support Available</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Start a Discussion</CardTitle>
                <CardDescription>
                  Share your trading insights or ask questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  <Button>💹 Market Analysis</Button>
                  <Button variant="outline">📊 Technical Question</Button>
                  <Button variant="outline">🛡️ Risk Management</Button>
                  <Button variant="outline">💡 Strategy Share</Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Discussions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Discussions</CardTitle>
                <CardDescription>
                  Hot topics in the trading community
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {discussions.map((discussion) => (
                  <div key={discussion.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={discussion.isHot ? "default" : "secondary"}>
                          {discussion.category}
                        </Badge>
                        {discussion.isHot && (
                          <Badge variant="destructive" className="text-xs">🔥 Hot</Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {discussion.lastActivity}
                      </span>
                    </div>
                    <h3 className="font-semibold hover:text-primary cursor-pointer mb-1">
                      {discussion.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>by {discussion.author}</span>
                      <span>{discussion.replies} replies</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Contributors */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Contributors</CardTitle>
                <CardDescription>This month's most helpful members</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {topContributors.map((contributor, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {contributor.avatar}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{contributor.name}</p>
                      <p className="text-xs text-muted-foreground">{contributor.points} points</p>
                    </div>
                    <div className="text-lg">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '⭐'}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Live Chat */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">💬 Live Chat</CardTitle>
                <CardDescription>Join the real-time discussion</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="text-xs">
                    <span className="font-medium">TraderPro:</span>
                    <span className="text-muted-foreground ml-2">Anyone watching ETH right now?</span>
                  </div>
                  <div className="text-xs">
                    <span className="font-medium">CryptoQueen:</span>
                    <span className="text-muted-foreground ml-2">BTC looking bullish! 📈</span>
                  </div>
                  <div className="text-xs">
                    <span className="font-medium">HODLer2024:</span>
                    <span className="text-muted-foreground ml-2">Time to buy the dip?</span>
                  </div>
                </div>
                <Button className="w-full" size="sm">
                  Join Chat
                </Button>
              </CardContent>
            </Card>

            {/* Community Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📋 Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>• Be respectful and helpful</p>
                <p>• No financial advice</p>
                <p>• Share knowledge freely</p>
                <p>• Keep discussions on-topic</p>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  Read Full Guidelines
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
