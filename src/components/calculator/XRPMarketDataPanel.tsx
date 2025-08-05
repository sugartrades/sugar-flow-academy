import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useXRPMarketData } from '@/hooks/useXRPMarketData';
import { useUserRole } from '@/hooks/useUserRole';
import { Skeleton } from '@/components/ui/skeleton';
import { useSmoothValueTransition } from '@/hooks/useSmoothValueTransition';

export function XRPMarketDataPanel() {
  const { xrpData, loading, refreshing, error, lastUpdated, refetch, dataSource } = useXRPMarketData();
  const { isAdmin, loading: roleLoading } = useUserRole();
  
  // Smooth transitions for price and change values
  const priceTransition = useSmoothValueTransition(xrpData?.price || 0);
  const changeTransition = useSmoothValueTransition(xrpData?.change24h || 0);
  const marketCapTransition = useSmoothValueTransition(xrpData?.marketCap || 0);
  
  // Show refresh button for admins or when data source is not Coinglass
  const showRefreshButton = isAdmin || dataSource !== 'coinglass';

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
      <Card className="calculator-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16 loading-fade" />
              <Skeleton className="h-8 w-24 loading-fade" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20 loading-fade" />
              <Skeleton className="h-6 w-16 loading-fade" />
            </div>
            <Skeleton className="h-10 w-10 rounded-md loading-fade" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="calculator-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🪙</span>
              <h3 className="font-semibold text-lg">XRP Live Price</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold">
                {formatPrice(xrpData?.price || 0)}
              </span>
              <div className={`flex items-center gap-1 ${getChangeColor(xrpData?.change24h || 0)}`}>
                {getChangeIcon(xrpData?.change24h || 0)}
                <span className="font-medium">
                  {changeTransition.displayValue !== undefined 
                    ? `${changeTransition.displayValue > 0 ? '+' : ''}${changeTransition.displayValue.toFixed(2)}%`
                    : '0.00%'
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="text-right space-y-1">
            <div className="text-sm text-muted-foreground">Market Cap</div>
            <div className="font-semibold">
              {xrpData?.marketCap ? formatMarketCap(xrpData.marketCap) : 'N/A'}
            </div>
            <Badge variant={getSentimentBadgeVariant(xrpData?.sentiment || 'neutral')}>
              {xrpData?.sentiment || 'neutral'}
            </Badge>
          </div>

          <div className="flex flex-col items-end gap-2">
            {showRefreshButton && !roleLoading && (
              <Button
                variant="outline"
                size="sm"
                onClick={refetch}
                disabled={loading || refreshing}
                className="h-10 w-10 p-0"
              >
                <RefreshCw className={`h-4 w-4 ${loading || refreshing ? 'animate-spin' : ''}`} />
              </Button>
            )}
            <div className="text-xs text-muted-foreground">
              {lastUpdated ? formatTimeAgo(lastUpdated) : 'Never'}
            </div>
            {dataSource && (
              <div className="text-xs text-muted-foreground">
                Source: {dataSource === 'binance+coinglass' ? 'Binance + Coinglass' : 
                         dataSource === 'binance' ? 'Binance' : 
                         dataSource === 'coinglass+coingecko' ? 'CoinGecko + Coinglass' : 
                         dataSource === 'coinglass' ? 'Coinglass' : 'CoinGecko'}
              </div>
            )}
          </div>
        </div>
        
        {/* Display liquidation data if available */}
        {xrpData?.liquidations && (
          <div className="mt-4 border-t pt-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">24h Liquidations</span>
              <Badge variant="outline" className="text-xs">
                {xrpData.liquidations.exchanges.length} exchanges
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Total</div>
                <div className="font-medium">
                  ${(xrpData.liquidations.total24h / 1000000).toFixed(2)}M
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Longs</div>
                <div className="font-medium text-red-500">
                  ${(xrpData.liquidations.long24h / 1000000).toFixed(2)}M
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Shorts</div>
                <div className="font-medium text-green-500">
                  ${(xrpData.liquidations.short24h / 1000000).toFixed(2)}M
                </div>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mt-3 text-sm text-amber-600 bg-amber-50 p-2 rounded">
            ⚠️ Using fallback data: {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}