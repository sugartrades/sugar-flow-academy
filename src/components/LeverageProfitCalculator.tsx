import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp, TrendingDown, HelpCircle, Calculator, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalculationResult {
  grossProfit: number;
  netProfit: number;
  roi: number;
  isProfit: boolean;
  liquidationPrice: number;
}

const LeverageProfitCalculator = () => {
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [positionSize, setPositionSize] = useState('');
  const [leverage, setLeverage] = useState('10');
  const [direction, setDirection] = useState('long');
  const [feePercent, setFeePercent] = useState('0.1');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const leverageOptions = Array.from({ length: 100 }, (_, i) => `${i + 1}x`);

  const calculateProfit = () => {
    if (!entryPrice || !exitPrice || !positionSize) return;

    setIsCalculating(true);
    
    // Simulate calculation delay for animation
    setTimeout(() => {
      const entry = parseFloat(entryPrice);
      const exit = parseFloat(exitPrice);
      const size = parseFloat(positionSize);
      const lev = parseFloat(leverage);
      const fee = parseFloat(feePercent) / 100;

      // Calculate position size with leverage
      const leveragedSize = size * lev;
      
      // Calculate gross profit/loss
      let priceDiff: number;
      if (direction === 'long') {
        priceDiff = exit - entry;
      } else {
        priceDiff = entry - exit;
      }
      
      const grossProfit = (priceDiff / entry) * leveragedSize;
      
      // Calculate fees (entry + exit)
      const totalFees = leveragedSize * fee * 2;
      
      // Net profit after fees
      const netProfit = grossProfit - totalFees;
      
      // ROI calculation
      const roi = (netProfit / size) * 100;
      
      // Liquidation price calculation
      let liquidationPrice: number;
      if (direction === 'long') {
        liquidationPrice = entry * (1 - (1 / lev) + fee);
      } else {
        liquidationPrice = entry * (1 + (1 / lev) + fee);
      }

      setResult({
        grossProfit,
        netProfit,
        roi,
        isProfit: netProfit > 0,
        liquidationPrice
      });
      
      setIsCalculating(false);
    }, 800);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <TooltipProvider>
      <div className="w-full max-w-4xl mx-auto p-6">
        <Card className="bg-card border-border glow-card">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold glow-text flex items-center justify-center gap-3">
              <Calculator className="h-8 w-8" />
              Leveraged Profit Calculator
            </CardTitle>
            <p className="text-muted-foreground text-lg">
              Calculate your leveraged trading profits with precision
            </p>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Input Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Entry Price */}
              <div className="space-y-2">
                <Label htmlFor="entryPrice" className="text-sm font-medium">
                  Entry Price (USD)
                </Label>
                <Input
                  id="entryPrice"
                  type="number"
                  placeholder="50,000"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  className="bg-input border-border focus:glow-border transition-all duration-300"
                />
              </div>

              {/* Exit Price */}
              <div className="space-y-2">
                <Label htmlFor="exitPrice" className="text-sm font-medium">
                  Exit Price (USD)
                </Label>
                <Input
                  id="exitPrice"
                  type="number"
                  placeholder="55,000"
                  value={exitPrice}
                  onChange={(e) => setExitPrice(e.target.value)}
                  className="bg-input border-border focus:glow-border transition-all duration-300"
                />
              </div>

              {/* Position Size */}
              <div className="space-y-2">
                <Label htmlFor="positionSize" className="text-sm font-medium">
                  Position Size (USD)
                </Label>
                <Input
                  id="positionSize"
                  type="number"
                  placeholder="1,000"
                  value={positionSize}
                  onChange={(e) => setPositionSize(e.target.value)}
                  className="bg-input border-border focus:glow-border transition-all duration-300"
                />
              </div>

              {/* Leverage */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="leverage" className="text-sm font-medium">
                    Leverage
                  </Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Multiplier for your position size. Higher leverage = higher risk & reward</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Select value={leverage} onValueChange={setLeverage}>
                  <SelectTrigger className="bg-input border-border focus:glow-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {leverageOptions.map((lev) => (
                      <SelectItem key={lev} value={lev.replace('x', '')}>
                        {lev}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Direction */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Direction</Label>
                <RadioGroup
                  value={direction}
                  onValueChange={setDirection}
                  className="flex space-x-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="long"
                      id="long"
                      className="text-success border-success"
                    />
                    <Label
                      htmlFor="long"
                      className={cn(
                        "cursor-pointer transition-all duration-300",
                        direction === 'long' && "glow-success"
                      )}
                    >
                      Long
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="short"
                      id="short"
                      className="text-destructive border-destructive"
                    />
                    <Label
                      htmlFor="short"
                      className={cn(
                        "cursor-pointer transition-all duration-300",
                        direction === 'short' && "glow-danger"
                      )}
                    >
                      Short
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Fee Percentage */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="feePercent" className="text-sm font-medium">
                    Fee % (optional)
                  </Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Trading fees charged by your exchange (entry + exit)</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="feePercent"
                  type="number"
                  step="0.01"
                  placeholder="0.1"
                  value={feePercent}
                  onChange={(e) => setFeePercent(e.target.value)}
                  className="bg-input border-border focus:glow-border transition-all duration-300"
                />
              </div>
            </div>

            {/* Calculate Button */}
            <div className="flex justify-center">
              <Button
                onClick={calculateProfit}
                disabled={!entryPrice || !exitPrice || !positionSize || isCalculating}
                className={cn(
                  "px-8 py-3 text-lg font-semibold transition-all duration-300",
                  "bg-primary hover:bg-primary/90 text-primary-foreground",
                  "glow-border hover:shadow-lg"
                )}
              >
                {isCalculating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Calculating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Calculate Profit
                  </div>
                )}
              </Button>
            </div>

            {/* Results Section */}
            {result && (
              <div className={cn(
                "mt-8 p-6 rounded-lg border-2 transition-all duration-500 animate-fade-in",
                result.isProfit ? "border-success/50 bg-success/5" : "border-destructive/50 bg-destructive/5"
              )}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Gross Profit */}
                  <div className="text-center">
                    <Label className="text-muted-foreground text-sm">Gross P&L</Label>
                    <div className={cn(
                      "text-2xl font-bold mt-1",
                      result.grossProfit >= 0 ? "profit-glow" : "loss-glow"
                    )}>
                      {formatCurrency(result.grossProfit)}
                    </div>
                  </div>

                  {/* Net Profit */}
                  <div className="text-center">
                    <Label className="text-muted-foreground text-sm">Net Profit</Label>
                    <div className={cn(
                      "text-2xl font-bold mt-1 flex items-center justify-center gap-2",
                      result.isProfit ? "profit-glow" : "loss-glow"
                    )}>
                      {result.isProfit ? (
                        <TrendingUp className="h-6 w-6" />
                      ) : (
                        <TrendingDown className="h-6 w-6" />
                      )}
                      {formatCurrency(result.netProfit)}
                    </div>
                  </div>

                  {/* ROI */}
                  <div className="text-center">
                    <Label className="text-muted-foreground text-sm">ROI</Label>
                    <div className={cn(
                      "text-2xl font-bold mt-1",
                      result.roi >= 0 ? "profit-glow" : "loss-glow"
                    )}>
                      {formatPercentage(result.roi)}
                    </div>
                  </div>

                  {/* Liquidation Price */}
                  <div className="text-center">
                    <Label className="text-muted-foreground text-sm">Liquidation Price</Label>
                    <div className="text-2xl font-bold mt-1 text-foreground">
                      {formatCurrency(result.liquidationPrice)}
                    </div>
                  </div>
                </div>

                {/* Status Message */}
                <div className="mt-6 text-center">
                  <div className={cn(
                    "text-lg font-semibold",
                    result.isProfit ? "profit-glow" : "loss-glow"
                  )}>
                    {result.isProfit ? "🎉 Profitable Trade!" : "⚠️ Loss Trade"}
                  </div>
                </div>
              </div>
            )}

            {/* CTA Section */}
            <div className="mt-12 text-center p-8 bg-secondary/50 rounded-lg border border-border">
              <h3 className="text-2xl font-bold glow-text mb-4">
                Join SugarTrades.io for more tools, training, and real-time alerts.
              </h3>
              <p className="text-muted-foreground mb-6 text-lg">
                Access professional trading tools, comprehensive education, and live market insights
              </p>
              <Button
                asChild
                className={cn(
                  "px-8 py-3 text-lg font-semibold",
                  "bg-primary hover:bg-primary/90 text-primary-foreground",
                  "glow-border hover:shadow-lg transition-all duration-300"
                )}
              >
                <a href="/signup" className="flex items-center gap-2">
                  Create Free Account
                  <ArrowRight className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default LeverageProfitCalculator;