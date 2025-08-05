import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon, TrendingUpIcon, ZapIcon, BrainIcon, TargetIcon } from 'lucide-react';

interface MarketImpactBreakdownProps {
  phases: {
    immediateImpact: number;
    derivativesAmplification: number;
    momentumAcceleration: number;
    finalImpact: number;
  };
  microstructure: {
    immediateDepth: number;
    marketMakerResponse: number;
    crossExchangeArb: number;
    derivativesFloat: number;
    leverageMultiplier: number;
  };
  psychology: {
    momentumFactor: number;
    liquidityPanic: number;
    fomoBuying: number;
    whaleAlert: number;
  };
  orderValueUSD: number;
}

export function MarketImpactBreakdown({
  phases,
  microstructure,
  psychology,
  orderValueUSD
}: MarketImpactBreakdownProps) {
  
  const formatXRP = (amount: number): string => {
    if (amount >= 1e9) return `${(amount / 1e9).toFixed(2)}B XRP`;
    if (amount >= 1e6) return `${(amount / 1e6).toFixed(2)}M XRP`;
    return `${(amount / 1e3).toFixed(2)}K XRP`;
  };

  const formatCurrency = (amount: number): string => {
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(2)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(2)}M`;
    return `$${(amount / 1e3).toFixed(2)}K`;
  };

  return (
    <div className="space-y-6">
      {/* Phase-by-Phase Impact Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TargetIcon className="h-5 w-5" />
            Price Impact Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Immediate</span>
                <Badge variant="outline">{phases.immediateImpact.toFixed(3)}%</Badge>
              </div>
              <Progress value={Math.min(100, (phases.immediateImpact / phases.finalImpact) * 100)} />
              <p className="text-xs text-muted-foreground">Order book depth consumption</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Derivatives</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-600">
                  {phases.derivativesAmplification.toFixed(1)}%
                </Badge>
              </div>
              <Progress 
                value={Math.min(100, (phases.derivativesAmplification / phases.finalImpact) * 100)} 
                className="[&>div]:bg-blue-500"
              />
              <p className="text-xs text-muted-foreground">Leverage & synthetic demand</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Momentum</span>
                <Badge variant="outline" className="bg-green-50 text-green-600">
                  {phases.momentumAcceleration.toFixed(1)}%
                </Badge>
              </div>
              <Progress 
                value={Math.min(100, (phases.momentumAcceleration / phases.finalImpact) * 100)}
                className="[&>div]:bg-green-500"
              />
              <p className="text-xs text-muted-foreground">Psychology & FOMO effects</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium font-bold">Final Impact</span>
                <Badge className="bg-purple-100 text-purple-700">
                  {phases.finalImpact.toFixed(2)}%
                </Badge>
              </div>
              <Progress value={100} className="[&>div]:bg-purple-500" />
              <p className="text-xs text-muted-foreground">Total cumulative effect</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Microstructure Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ZapIcon className="h-5 w-5" />
              Market Microstructure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                      <span className="text-sm font-medium">Immediate Depth</span>
                      <div className="text-right">
                        <div className="font-mono text-sm">{formatXRP(microstructure.immediateDepth)}</div>
                        <div className="text-xs text-muted-foreground">±0.1% spread</div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Liquidity available at current price with minimal slippage</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                      <span className="text-sm font-medium">Market Maker Response</span>
                      <div className="text-right">
                        <div className="font-mono text-sm">{formatXRP(microstructure.marketMakerResponse)}</div>
                        <div className="text-xs text-muted-foreground">HFT algorithms</div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Additional liquidity provided by algorithmic market makers</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                      <span className="text-sm font-medium">Cross-Exchange Arb</span>
                      <div className="text-right">
                        <div className="font-mono text-sm">{formatXRP(microstructure.crossExchangeArb)}</div>
                        <div className="text-xs text-muted-foreground">Rebalancing flow</div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Arbitrage flows from other exchanges to maintain price parity</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex justify-between items-center p-2 bg-blue-50 rounded border border-blue-200">
                      <span className="text-sm font-medium text-blue-800">Leverage Multiplier</span>
                      <div className="text-right">
                        <div className="font-mono text-sm text-blue-800">{microstructure.leverageMultiplier.toFixed(2)}x</div>
                        <div className="text-xs text-blue-600">Derivatives effect</div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Price amplification from leveraged positions and funding pressure</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainIcon className="h-5 w-5" />
              Market Psychology
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                      <span className="text-sm font-medium">Momentum Factor</span>
                      <div className="text-right">
                        <div className="font-mono text-sm">{psychology.momentumFactor.toFixed(2)}x</div>
                        <div className="text-xs text-muted-foreground">
                          {orderValueUSD > 50000000 ? "Active" : "Inactive"}
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Price acceleration from momentum trading (triggered at $50M+ orders)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                      <span className="text-sm font-medium">FOMO Buying</span>
                      <div className="text-right">
                        <div className="font-mono text-sm">{psychology.fomoBuying.toFixed(2)}x</div>
                        <div className="text-xs text-muted-foreground">
                          {orderValueUSD > 30000000 ? "Triggered" : "Not triggered"}
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Additional buying pressure from fear of missing out (triggered at $30M+ orders)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                      <span className="text-sm font-medium">Whale Alert</span>
                      <div className="text-right">
                        <div className="font-mono text-sm">{psychology.whaleAlert.toFixed(2)}x</div>
                        <div className="text-xs text-muted-foreground">
                          {orderValueUSD > 20000000 ? "Public attention" : "Under radar"}
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Market attention and copycat trading from whale alerts ($20M+ threshold)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex justify-between items-center p-2 bg-orange-50 rounded border border-orange-200">
                      <span className="text-sm font-medium text-orange-800">Liquidity Panic</span>
                      <div className="text-right">
                        <div className="font-mono text-sm text-orange-800">{psychology.liquidityPanic.toFixed(2)}x</div>
                        <div className="text-xs text-orange-600">
                          {psychology.liquidityPanic < 1 ? "Withdrawal" : "Stable"}
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Liquidity providers pulling orders during extreme price moves ($100M+ threshold)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Size Context */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <InfoIcon className="h-5 w-5" />
            Order Impact Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">{formatCurrency(orderValueUSD)}</div>
              <div className="text-sm text-muted-foreground">Order Value</div>
            </div>
            
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {orderValueUSD > 100000000 ? "Extreme" : 
                 orderValueUSD > 50000000 ? "Large" : 
                 orderValueUSD > 20000000 ? "Medium" : "Small"}
              </div>
              <div className="text-sm text-muted-foreground">Impact Category</div>
            </div>
            
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(psychology).filter(v => v > 1).length}
              </div>
              <div className="text-sm text-muted-foreground">Active Psychology Factors</div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Thresholds:</strong></p>
            <p>• $20M+: Whale alerts trigger public attention</p>
            <p>• $30M+: FOMO buying activates</p>
            <p>• $50M+: Momentum trading begins</p>
            <p>• $100M+: Liquidity panic may occur</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}