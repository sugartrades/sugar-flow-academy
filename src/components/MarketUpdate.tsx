
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useRealTimeMarketData } from '@/hooks/useRealTimeMarketData';

export function MarketUpdate() {
  const { marketData, loading, error, refetch } = useRealTimeMarketData();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatMarketCap = (marketCap: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(marketCap);
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4" />;
    if (change < 0) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getSentimentBadgeVariant = (sentiment: string) => {
    if (sentiment.toLowerCase().includes('bullish')) return 'default';
    if (sentiment.toLowerCase().includes('bearish')) return 'destructive';
    return 'secondary';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            📊 {marketData?.title || 'Market Update'}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={refetch}
            disabled={loading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <p className="text-sm">Loading market data...</p>
        ) : error ? (
          <div className="space-y-2">
            <p className="text-sm text-red-600">Error: {error}</p>
            <p className="text-sm">{marketData?.content}</p>
          </div>
        ) : marketData ? (
          <div className="space-y-3">
            {/* Price and Change */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold">
                  {formatPrice(marketData.price)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Market Cap: {formatMarketCap(marketData.marketCap)}
                </div>
              </div>
              <div className={`flex items-center space-x-1 ${getChangeColor(marketData.change24h)}`}>
                {getChangeIcon(marketData.change24h)}
                <span className="font-medium">
                  {marketData.change24h >= 0 ? '+' : ''}{marketData.change24h.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Sentiment */}
            <div className="space-y-1">
              <Badge variant={getSentimentBadgeVariant(marketData.sentiment)} className="text-xs">
                {marketData.sentiment.split(' - ')[0]}
              </Badge>
              <p className="text-sm text-muted-foreground">
                {marketData.sentiment.includes(' - ') 
                  ? marketData.sentiment.split(' - ')[1] 
                  : marketData.sentiment}
              </p>
            </div>

            {/* Last Updated */}
            <div className="text-xs text-muted-foreground">
              Last updated: {new Date(marketData.lastUpdated).toLocaleTimeString()}
            </div>
          </div>
        ) : (
          <p className="text-sm">No market data available</p>
        )}
      </CardContent>
    </Card>
  );
}
