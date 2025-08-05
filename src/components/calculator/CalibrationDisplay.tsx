import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUpIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react';

interface CalibrationDisplayProps {
  effectiveMultiplier: number;
  orderValueUSD: number;
  marketCapIncrease: number;
}

export function CalibrationDisplay({
  effectiveMultiplier,
  orderValueUSD,
  marketCapIncrease
}: CalibrationDisplayProps) {
  
  // Coinglass reference: $40M → $20.9B market cap movement (522x multiplier)
  const coinglassOrderSize = 40000000; // $40M
  const coinglassMarketCapIncrease = 20900000000; // $20.9B
  const coinglassMultiplier = 522;
  
  const formatCurrency = (amount: number): string => {
    if (amount >= 1e12) return `$${(amount / 1e12).toFixed(2)}T`;
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(2)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(2)}M`;
    return `$${(amount / 1e3).toFixed(2)}K`;
  };

  // Calculate how close we are to Coinglass example
  const orderSizeRatio = orderValueUSD / coinglassOrderSize;
  const expectedMultiplierFromCoinglass = coinglassMultiplier * Math.pow(orderSizeRatio, 0.8); // Scaling factor
  const multiplierAccuracy = Math.abs(effectiveMultiplier - expectedMultiplierFromCoinglass) / expectedMultiplierFromCoinglass;
  
  const getAccuracyLevel = () => {
    if (multiplierAccuracy < 0.2) return { level: "Excellent", color: "green", icon: CheckCircleIcon };
    if (multiplierAccuracy < 0.5) return { level: "Good", color: "blue", icon: CheckCircleIcon };
    return { level: "Needs Calibration", color: "orange", icon: AlertCircleIcon };
  };

  const accuracy = getAccuracyLevel();
  const AccuracyIcon = accuracy.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUpIcon className="h-5 w-5" />
          Model Calibration vs Real Market Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Coinglass Reference Case */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
            📊 Coinglass Real Market Example
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-blue-600 font-medium">Net Capital Inflow</div>
              <div className="font-mono text-blue-800">{formatCurrency(coinglassOrderSize)}</div>
            </div>
            <div>
              <div className="text-blue-600 font-medium">Market Cap Movement</div>
              <div className="font-mono text-blue-800">{formatCurrency(coinglassMarketCapIncrease)}</div>
            </div>
            <div>
              <div className="text-blue-600 font-medium">Effective Multiplier</div>
              <div className="font-mono text-blue-800">{coinglassMultiplier}x</div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Current Simulation */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
            🎯 Your Simulation
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-green-600 font-medium">Order Value</div>
              <div className="font-mono text-green-800">{formatCurrency(orderValueUSD)}</div>
            </div>
            <div>
              <div className="text-green-600 font-medium">Market Cap Impact</div>
              <div className="font-mono text-green-800">{formatCurrency(marketCapIncrease)}</div>
            </div>
            <div>
              <div className="text-green-600 font-medium">Your Multiplier</div>
              <div className="font-mono text-green-800">{effectiveMultiplier.toFixed(1)}x</div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Accuracy Assessment */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AccuracyIcon className={`h-5 w-5 text-${accuracy.color}-600`} />
            <span className="font-semibold">Model Accuracy:</span>
            <Badge variant="outline" className={`bg-${accuracy.color}-50 text-${accuracy.color}-700`}>
              {accuracy.level}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-3 bg-muted/30 rounded">
                    <div className="text-sm font-medium">Expected Multiplier</div>
                    <div className="font-mono text-lg">{expectedMultiplierFromCoinglass.toFixed(1)}x</div>
                    <div className="text-xs text-muted-foreground">Based on Coinglass scaling</div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>What the multiplier should be based on the Coinglass reference scaled to your order size</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-3 bg-muted/30 rounded">
                    <div className="text-sm font-medium">Variance</div>
                    <div className="font-mono text-lg">{(multiplierAccuracy * 100).toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">From expected value</div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>How much your simulation differs from the expected real-world result</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <Separator />

        {/* Interpretation */}
        <div className="space-y-3">
          <h4 className="font-semibold">Interpretation:</h4>
          
          {orderValueUSD === coinglassOrderSize && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
              🎯 <strong>Perfect Match:</strong> Your order size exactly matches the Coinglass example. 
              Your multiplier should be close to 522x for maximum accuracy.
            </div>
          )}

          {orderValueUSD > coinglassOrderSize && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded text-sm text-orange-800">
              ⚡ <strong>Larger Order:</strong> Your order is {(orderSizeRatio).toFixed(1)}x larger than Coinglass. 
              Expect even more extreme multiplier effects due to liquidity exhaustion.
            </div>
          )}

          {orderValueUSD < coinglassOrderSize && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
              💧 <strong>Smaller Order:</strong> Your order is {(1/orderSizeRatio).toFixed(1)}x smaller than Coinglass. 
              Multiplier should be proportionally lower but still significant.
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            <p><strong>Note:</strong> The Coinglass example represents real market conditions where a $40M net capital inflow 
            resulted in a $20.9B market cap increase. This 522x multiplier demonstrates the powerful amplification 
            effects of derivatives, leverage, and market psychology in low-liquidity scenarios.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}