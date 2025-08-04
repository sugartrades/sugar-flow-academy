import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon, TrendingUpIcon, TrendingDownIcon, MinusIcon } from 'lucide-react';
import { AggregatedDerivatives } from '@/hooks/useDerivativesData';

interface FundingRatePanelProps {
  derivativesData: AggregatedDerivatives | null;
  loading: boolean;
}

export function FundingRatePanel({ derivativesData, loading }: FundingRatePanelProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="h-4 w-4 bg-muted animate-pulse rounded"></span>
            Funding Rate Analysis
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

  if (!derivativesData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💰 Funding Rate Analysis
            <Badge variant="secondary">No Data</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            <p>Funding rate data unavailable</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatFundingRate = (rate: number): string => {
    return `${(rate * 100).toFixed(4)}%`;
  };

  const getAnnualizedRate = (rate: number): string => {
    // Funding happens every 8 hours, so 3 times per day
    const annualized = rate * 3 * 365;
    return `${(annualized * 100).toFixed(1)}%`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'bullish': return <TrendingUpIcon className="h-4 w-4 text-green-500" />;
      case 'bearish': return <TrendingDownIcon className="h-4 w-4 text-red-500" />;
      default: return <MinusIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string): string => {
    switch (trend) {
      case 'bullish': return 'border-green-500 text-green-700';
      case 'bearish': return 'border-red-500 text-red-700';
      default: return 'border-gray-500 text-gray-700';
    }
  };

  const getTrendDescription = (trend: string): string => {
    switch (trend) {
      case 'bullish': 
        return 'Positive funding rates indicate long positions are paying shorts, suggesting bullish sentiment and potential for long liquidations.';
      case 'bearish': 
        return 'Negative funding rates indicate short positions are paying longs, suggesting bearish sentiment and potential for short squeezes.';
      default: 
        return 'Neutral funding rates indicate balanced long/short sentiment with minimal funding pressure.';
    }
  };

  const getFundingImpact = (rate: number): { level: string; description: string; color: string } => {
    const absRate = Math.abs(rate);
    if (absRate > 0.001) {
      return {
        level: 'High',
        description: 'Significant funding pressure - high potential for market impact',
        color: 'text-red-600'
      };
    } else if (absRate > 0.0005) {
      return {
        level: 'Moderate',
        description: 'Moderate funding pressure - some market impact expected',
        color: 'text-yellow-600'
      };
    } else {
      return {
        level: 'Low',
        description: 'Minimal funding pressure - limited market impact',
        color: 'text-green-600'
      };
    }
  };

  const weightedFundingRate = derivativesData.weightedFundingRate;
  const avgFundingRate = derivativesData.avgFundingRate;
  const fundingTrend = derivativesData.fundingTrend;
  const fundingImpact = getFundingImpact(weightedFundingRate);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          💰 Funding Rate Analysis
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>Funding rates show the cost of holding perpetual futures. Positive rates indicate longs pay shorts (bullish sentiment), negative rates mean shorts pay longs (bearish sentiment).</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Funding Rate Display */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            {getTrendIcon(fundingTrend)}
            <div className="text-3xl font-bold">
              {formatFundingRate(weightedFundingRate)}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Weighted Average (Next 8h)
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Annualized: {getAnnualizedRate(weightedFundingRate)}
          </div>
        </div>

        {/* Trend Indicator */}
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={getTrendColor(fundingTrend)}>
            {fundingTrend.charAt(0).toUpperCase() + fundingTrend.slice(1)} Trend
          </Badge>
          <div className="flex-1">
            <div className={`text-sm font-medium ${fundingImpact.color}`}>
              {fundingImpact.level} Impact
            </div>
          </div>
        </div>

        {/* Funding Rate Comparison */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Weighted Rate:</span>
            <span className="font-medium">{formatFundingRate(weightedFundingRate)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Simple Average:</span>
            <span className="font-medium">{formatFundingRate(avgFundingRate)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Difference:</span>
            <span className={`font-medium ${
              Math.abs(weightedFundingRate - avgFundingRate) > 0.0001 ? 'text-orange-600' : 'text-green-600'
            }`}>
              {formatFundingRate(Math.abs(weightedFundingRate - avgFundingRate))}
            </span>
          </div>
        </div>

        {/* Impact on Price Multiplier */}
        <div className="bg-muted/50 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Price Impact Adjustment</span>
            <span className="text-lg font-bold text-primary">
              {derivativesData.leverageMultiplier.toFixed(2)}x
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            {fundingImpact.description}
          </div>
        </div>

        {/* Market Context */}
        <div className="border-t pt-3 space-y-1">
          <div className="text-sm font-medium">Market Context</div>
          <div className="text-xs text-muted-foreground">
            {getTrendDescription(fundingTrend)}
          </div>
        </div>

        {/* Exchange Count */}
        <div className="text-xs text-muted-foreground text-center">
          Data weighted by open interest from {derivativesData.exchangeCount} exchanges
        </div>
      </CardContent>
    </Card>
  );
}