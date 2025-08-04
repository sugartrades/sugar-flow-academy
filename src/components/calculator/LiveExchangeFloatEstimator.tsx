import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon, TrendingUpIcon, TrendingDownIcon, MinusIcon } from 'lucide-react';
import { AggregatedDerivatives } from '@/hooks/useDerivativesData';

interface LiveExchangeFloatEstimatorProps {
  derivativesData: AggregatedDerivatives | null;
  loading: boolean;
  currentXRPPrice: number;
}

export function LiveExchangeFloatEstimator({ 
  derivativesData, 
  loading, 
  currentXRPPrice 
}: LiveExchangeFloatEstimatorProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="h-4 w-4 bg-muted animate-pulse rounded"></span>
            Live Exchange Float Estimator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-8 bg-muted animate-pulse rounded"></div>
            <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
            <div className="h-4 bg-muted animate-pulse rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!derivativesData || !derivativesData.floatRange) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 Live Exchange Float Estimator
            <Badge variant="secondary">Fallback</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            <p>No derivatives data available</p>
            <p className="text-sm">Using default float estimation</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatXRP = (amount: number): string => {
    if (amount >= 1e9) return `${(amount / 1e9).toFixed(2)}B XRP`;
    if (amount >= 1e6) return `${(amount / 1e6).toFixed(1)}M XRP`;
    return `${(amount / 1e3).toFixed(0)}K XRP`;
  };

  const formatCurrency = (amount: number): string => {
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(2)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`;
    return `$${(amount / 1e3).toFixed(0)}K`;
  };

  const getConfidenceLevel = (exchangeCount: number): 'high' | 'medium' | 'low' => {
    if (exchangeCount >= 15) return 'high';
    if (exchangeCount >= 8) return 'medium';
    return 'low';
  };

  const confidenceLevel = getConfidenceLevel(derivativesData.exchangeCount);
  const floatUSDValue = derivativesData.estimatedFloat * currentXRPPrice;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📊 Live Exchange Float Estimator
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Estimates XRP available on exchanges based on open interest, volume, and market conditions from {derivativesData.exchangeCount} exchanges</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Float Estimate */}
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">
            {formatXRP(derivativesData.estimatedFloat)}
          </div>
          <div className="text-sm text-muted-foreground">
            {formatCurrency(floatUSDValue)} at current price
          </div>
        </div>

        {/* Float Range */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Estimated Range:</span>
            <Badge variant={confidenceLevel === 'high' ? 'default' : confidenceLevel === 'medium' ? 'secondary' : 'outline'}>
              {confidenceLevel} confidence
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>{formatXRP(derivativesData.floatRange.min)}</span>
            <span className="text-muted-foreground">to</span>
            <span>{formatXRP(derivativesData.floatRange.max)}</span>
          </div>
          
          {/* Visual Range Bar */}
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="absolute h-full bg-gradient-to-r from-blue-500 to-primary rounded-full"
              style={{
                left: '20%',
                width: '60%'
              }}
            />
            <div 
              className="absolute h-full w-1 bg-white border border-primary"
              style={{
                left: `${20 + ((derivativesData.estimatedFloat - derivativesData.floatRange.min) / 
                  (derivativesData.floatRange.max - derivativesData.floatRange.min)) * 60}%`,
                transform: 'translateX(-50%)'
              }}
            />
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Total Open Interest</div>
            <div className="font-medium">{formatXRP(derivativesData.totalOpenInterest)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">24h Volume</div>
            <div className="font-medium">{formatXRP(derivativesData.totalVolume24h)}</div>
          </div>
        </div>

        {/* Exchange Distribution (Top 3) */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Top Exchanges by Open Interest</div>
          <div className="space-y-1">
            {Object.entries(derivativesData.exchangeDistribution)
              .sort(([,a], [,b]) => b.oi - a.oi)
              .slice(0, 3)
              .map(([exchange, data]) => (
                <div key={exchange} className="flex items-center justify-between text-xs">
                  <span>{exchange}</span>
                  <span className="text-muted-foreground">
                    {data.percentage.toFixed(1)}% ({formatXRP(data.oi)})
                  </span>
                </div>
              ))
            }
          </div>
        </div>

        {/* Data Source Info */}
        <div className="text-xs text-muted-foreground text-center border-t pt-2">
          Data from {derivativesData.exchangeCount} exchanges • Auto-updates every 5 minutes
        </div>
      </CardContent>
    </Card>
  );
}