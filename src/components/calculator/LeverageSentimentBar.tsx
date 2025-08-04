import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon, TrendingUpIcon, TrendingDownIcon, ScaleIcon } from 'lucide-react';
import { AggregatedDerivatives } from '@/hooks/useDerivativesData';

interface LeverageSentimentBarProps {
  derivativesData: AggregatedDerivatives | null;
  loading: boolean;
}

export function LeverageSentimentBar({ derivativesData, loading }: LeverageSentimentBarProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="h-4 w-4 bg-muted animate-pulse rounded"></span>
            Leverage Sentiment Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-6 bg-muted animate-pulse rounded-full"></div>
            <div className="h-4 bg-muted animate-pulse rounded w-2/3"></div>
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
            ⚖️ Leverage Sentiment Impact
            <Badge variant="secondary">No Data</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            <p>Leverage sentiment data unavailable</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSentimentColor = (sentiment: string): string => {
    switch (sentiment) {
      case 'long_dominant': return 'bg-green-500';
      case 'short_dominant': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'long_dominant': return <TrendingUpIcon className="h-4 w-4 text-green-500" />;
      case 'short_dominant': return <TrendingDownIcon className="h-4 w-4 text-red-500" />;
      default: return <ScaleIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSentimentLabel = (sentiment: string): string => {
    switch (sentiment) {
      case 'long_dominant': return 'Long Dominant';
      case 'short_dominant': return 'Short Dominant';
      default: return 'Balanced';
    }
  };

  const getSentimentDescription = (sentiment: string): string => {
    switch (sentiment) {
      case 'long_dominant': return 'Traders are predominantly long, indicating bullish sentiment and higher potential for liquidation cascades on downside moves.';
      case 'short_dominant': return 'Traders are predominantly short, indicating bearish sentiment and higher potential for squeeze rallies.';
      default: return 'Long and short positions are relatively balanced, indicating neutral market sentiment.';
    }
  };

  // Calculate position on sentiment bar (0-100%)
  const longShortRatio = derivativesData.avgLongShortRatio;
  const barPosition = Math.max(0, Math.min(100, ((longShortRatio - 0.5) / 2.0) * 100 + 50));

  // Calculate multiplier impact
  const multiplierImpact = derivativesData.leverageMultiplier;
  const impactColor = multiplierImpact > 1.5 ? 'text-orange-600' : 
                     multiplierImpact > 1.2 ? 'text-yellow-600' : 'text-green-600';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          ⚖️ Leverage Sentiment Impact
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>Shows the balance between long and short positions across exchanges. Imbalanced sentiment can amplify price movements through liquidation cascades.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sentiment Indicator */}
        <div className="flex items-center gap-3">
          {getSentimentIcon(derivativesData.leverageSentiment)}
          <div className="flex-1">
            <div className="font-medium">{getSentimentLabel(derivativesData.leverageSentiment)}</div>
            <div className="text-sm text-muted-foreground">
              L/S Ratio: {longShortRatio.toFixed(2)}
            </div>
          </div>
          <Badge 
            variant={derivativesData.leverageSentiment === 'balanced' ? 'secondary' : 'outline'}
            className={derivativesData.leverageSentiment === 'long_dominant' ? 'border-green-500' : 
                       derivativesData.leverageSentiment === 'short_dominant' ? 'border-red-500' : ''}
          >
            {getSentimentLabel(derivativesData.leverageSentiment)}
          </Badge>
        </div>

        {/* Visual Sentiment Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Short Heavy</span>
            <span>Balanced</span>
            <span>Long Heavy</span>
          </div>
          
          <div className="relative h-3 bg-gradient-to-r from-red-200 via-gray-200 to-green-200 rounded-full overflow-hidden">
            {/* Center line */}
            <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gray-400 transform -translate-x-0.5" />
            
            {/* Position indicator */}
            <div 
              className="absolute top-0 w-3 h-full bg-white border-2 border-gray-800 rounded-full transform -translate-x-1/2"
              style={{ left: `${barPosition}%` }}
            />
          </div>
          
          <div className="text-center text-xs text-muted-foreground">
            {longShortRatio > 1 ? 
              `${((longShortRatio - 1) * 100).toFixed(0)}% more longs` :
              `${((1 - longShortRatio) * 100).toFixed(0)}% more shorts`
            }
          </div>
        </div>

        {/* Impact on Buy Pressure */}
        <div className="bg-muted/50 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Buy Pressure Multiplier</span>
            <span className={`text-lg font-bold ${impactColor}`}>
              {multiplierImpact.toFixed(2)}x
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            {getSentimentDescription(derivativesData.leverageSentiment)}
          </div>
        </div>

        {/* Market Mood Score */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Market Mood Score</span>
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  derivativesData.marketMoodScore > 0.7 ? 'bg-green-500' :
                  derivativesData.marketMoodScore > 0.3 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${derivativesData.marketMoodScore * 100}%` }}
              />
            </div>
            <span className="font-medium w-8">
              {(derivativesData.marketMoodScore * 100).toFixed(0)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}