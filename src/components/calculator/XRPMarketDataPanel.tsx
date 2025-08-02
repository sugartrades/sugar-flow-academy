import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, TrendingDown, Minus, Sliders } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useXRPMarketData } from '@/hooks/useXRPMarketData';
import { useXRPFloatSlider } from '@/hooks/useXRPFloatSlider';
import { Skeleton } from '@/components/ui/skeleton';

export function XRPMarketDataPanel() {
  const { xrpData, loading, error, lastUpdated, refetch } = useXRPMarketData();
  const { xrpFloat, setXrpFloat, formatFloat } = useXRPFloatSlider();

  const formatPrice = (price: number): string => {
    return `$${price.toFixed(4)}`;
  };

  const formatMarketCap = (marketCap: number): string => {
    if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    }
    return `$${(marketCap / 1e6).toFixed(2)}M`;
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getChangeColor = (change: number): string => {
    if (change > 0) return "text-green-500";
    if (change < 0) return "text-red-500";
    return "text-muted-foreground";
  };

  const getSentimentBadgeVariant = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'bullish': return 'default';
      case 'bearish': return 'destructive';
      default: return 'secondary';
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  };


  if (loading && !xrpData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-10 w-10 rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 mb-8">
      {/* Market Data Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">XRP Price</CardTitle>
            <div className="flex items-center space-x-1">
              {getChangeIcon(xrpData?.change24h || 0)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(xrpData?.price || 0)}</div>
            <p className={`text-xs ${getChangeColor(xrpData?.change24h || 0)}`}>
              {xrpData?.change24h > 0 ? '+' : ''}{xrpData?.change24h?.toFixed(2)}% 24h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Cap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMarketCap(xrpData?.marketCap || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Last updated {lastUpdated ? formatTimeAgo(lastUpdated) : 'Never'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sentiment</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={getSentimentBadgeVariant(xrpData?.sentiment || 'neutral')} className="mb-2">
              {xrpData?.sentiment || 'neutral'}
            </Badge>
            {error && (
              <p className="text-xs text-muted-foreground">
                Using fallback data
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Status</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={refetch}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium text-green-600">Live Data</div>
            <p className="text-xs text-muted-foreground">
              Auto-refresh: 2min
            </p>
          </CardContent>
        </Card>
      </div>

      {/* XRP Float Control */}
      <Card className="border-primary/20 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-primary" />
            Manual XRP Float Estimation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">1B XRP</span>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{formatFloat(xrpFloat)} XRP</div>
                <p className="text-xs text-muted-foreground">Available liquidity estimate</p>
              </div>
              <span className="text-sm text-muted-foreground">30B XRP</span>
            </div>
            <Slider
              value={[xrpFloat]}
              onValueChange={(value) => setXrpFloat(value[0])}
              min={1}
              max={30}
              step={0.5}
              className="w-full"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">
              <strong>Manual Control:</strong> Set your estimate for available XRP liquidity in the order book.
            </p>
            <p>
              This represents XRP available within reasonable price ranges (~5-10% above current price) 
              for large buy orders. Higher values = deeper liquidity = less price impact.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}