import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, TrendingDown, Minus, Waves } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useXRPMarketData } from '@/hooks/useXRPMarketData';
import { useXRPOrderBookData } from '@/hooks/useXRPOrderBookData';
import { Skeleton } from '@/components/ui/skeleton';

export function XRPMarketDataPanel() {
  const { xrpData, loading, error, lastUpdated, refetch } = useXRPMarketData();
  const { 
    orderBookData, 
    loading: orderBookLoading, 
    error: orderBookError, 
    refetch: refetchOrderBook,
    selectedExchange,
    setSelectedExchange
  } = useXRPOrderBookData();

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

  const formatFloat = (float: number) => {
    if (float >= 1000000) {
      return `${(float / 1000000).toFixed(1)}M`;
    } else if (float >= 1000) {
      return `${(float / 1000).toFixed(1)}K`;
    }
    return float.toLocaleString();
  };

  const getSelectedExchangeData = () => {
    if (!orderBookData || !selectedExchange) return null;
    return orderBookData.exchanges.find(ex => ex.exchange === selectedExchange);
  };

  const getDisplayFloat = () => {
    if (!orderBookData) return 0;
    
    if (selectedExchange === 'average') {
      return orderBookData.averageFloat;
    } else if (selectedExchange === 'aggregated') {
      return orderBookData.aggregatedFloat;
    } else {
      const exchangeData = getSelectedExchangeData();
      return exchangeData?.xrpFloat || 0;
    }
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

      {/* XRP Float Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exchange Selection</CardTitle>
            <Waves className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Select value={selectedExchange || ''} onValueChange={setSelectedExchange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select exchange or view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="average">Average Float</SelectItem>
                <SelectItem value="aggregated">Aggregated Float</SelectItem>
                {orderBookData?.exchanges.map((exchange) => (
                  <SelectItem key={exchange.exchange} value={exchange.exchange}>
                    {exchange.exchange.charAt(0).toUpperCase() + exchange.exchange.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              Available XRP within 5% of current price
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">XRP Float</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={refetchOrderBook}
              className="h-8 w-8 p-0"
              disabled={orderBookLoading}
            >
              <RefreshCw className={`h-4 w-4 ${orderBookLoading ? 'animate-spin' : ''}`} />
            </Button>
          </CardHeader>
          <CardContent>
            {orderBookLoading ? (
              <Skeleton className="h-8 w-24 mb-2" />
            ) : (
              <div className="text-2xl font-bold">{formatFloat(getDisplayFloat())} XRP</div>
            )}
            <p className="text-xs text-muted-foreground">
              {selectedExchange === 'average' && 'Average across exchanges'}
              {selectedExchange === 'aggregated' && 'Total across exchanges'}
              {selectedExchange && !['average', 'aggregated'].includes(selectedExchange) && 
                `From ${selectedExchange.charAt(0).toUpperCase() + selectedExchange.slice(1)}`}
              {!selectedExchange && 'Select an exchange to view'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Liquidity Status</CardTitle>
          </CardHeader>
          <CardContent>
            {orderBookLoading ? (
              <Skeleton className="h-4 w-16 mb-2" />
            ) : (
              <div className="text-sm font-medium text-green-600">
                {orderBookData?.exchanges.length || 0} Exchanges
              </div>
            )}
            {orderBookError && (
              <p className="text-xs text-red-500 mb-1">
                {orderBookError}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {orderBookData?.lastUpdated ? 
                `Updated ${formatTimeAgo(new Date(orderBookData.lastUpdated))}` : 
                'No data available'
              }
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}