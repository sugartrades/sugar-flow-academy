
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useRealTimeMarketData } from '@/hooks/useRealTimeMarketData';

export function MarketUpdate() {
  const { currentCrypto, currentCryptoIndex, totalCryptos, loading, error, refetch } = useRealTimeMarketData();

  const formatPrice = (price: number, symbol: string) => {
    const decimals = symbol === 'XRP' ? 4 : 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
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

  const getCryptoEmoji = (symbol: string) => {
    switch (symbol) {
      case 'BTC': return '₿';
      case 'ETH': return 'Ξ';
      case 'XRP': return '◊';
      default: return '₿';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            📊 Market Update
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* Rotation indicators */}
            {totalCryptos > 1 && (
              <div className="flex gap-1">
                {Array.from({ length: totalCryptos }).map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      index === currentCryptoIndex ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            )}
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
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <p className="text-sm">Loading market data...</p>
        ) : error ? (
          <div className="space-y-2">
            <p className="text-sm text-red-600">Error: {error}</p>
            {currentCrypto && (
              <p className="text-sm">Showing fallback data for {currentCrypto.name}</p>
            )}
          </div>
        ) : currentCrypto ? (
          <div className="space-y-3">
            {/* Crypto Header with Animation */}
            <div className="flex items-center gap-2 animate-in fade-in duration-300">
              <span className="text-2xl">{getCryptoEmoji(currentCrypto.symbol)}</span>
              <div>
                <h3 className="font-semibold text-lg">{currentCrypto.name}</h3>
                <p className="text-xs text-muted-foreground">{currentCrypto.symbol}</p>
              </div>
            </div>

            {/* Price and Change */}
            <div className="flex items-center justify-between animate-in fade-in duration-300">
              <div>
                <div className="text-lg font-bold">
                  {formatPrice(currentCrypto.price, currentCrypto.symbol)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Market Cap: {formatMarketCap(currentCrypto.marketCap)}
                </div>
              </div>
              <div className={`flex items-center space-x-1 ${getChangeColor(currentCrypto.change24h)}`}>
                {getChangeIcon(currentCrypto.change24h)}
                <span className="font-medium">
                  {currentCrypto.change24h >= 0 ? '+' : ''}{currentCrypto.change24h.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Sentiment */}
            <div className="space-y-1 animate-in fade-in duration-300">
              <Badge variant={getSentimentBadgeVariant(currentCrypto.sentiment)} className="text-xs">
                {currentCrypto.sentiment.split(' - ')[0]}
              </Badge>
              <p className="text-sm text-muted-foreground">
                {currentCrypto.sentiment.includes(' - ') 
                  ? currentCrypto.sentiment.split(' - ')[1] 
                  : currentCrypto.sentiment}
              </p>
            </div>

            {/* Rotation info */}
            {totalCryptos > 1 && (
              <div className="text-xs text-muted-foreground">
                Auto-rotating every 8 seconds • {currentCryptoIndex + 1} of {totalCryptos}
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm">No market data available</p>
        )}
      </CardContent>
    </Card>
  );
}
