import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon, TrendingUp, TrendingDown, Calculator } from 'lucide-react';

interface CalculationResults {
  grossPL: number;
  netProfit: number;
  roi: number;
  liquidationPrice: number;
  isWin: boolean;
}

export function LeverageCalculatorComponent() {
  const [entryPrice, setEntryPrice] = useState<string>('');
  const [exitPrice, setExitPrice] = useState<string>('');
  const [positionSize, setPositionSize] = useState<string>('');
  const [leverage, setLeverage] = useState<string>('1');
  const [direction, setDirection] = useState<string>('long');
  const [feePercent, setFeePercent] = useState<string>('0.1');
  const [results, setResults] = useState<CalculationResults | null>(null);

  const calculateResults = () => {
    const entry = parseFloat(entryPrice);
    const exit = parseFloat(exitPrice);
    const size = parseFloat(positionSize);
    const lev = parseFloat(leverage);
    const fee = parseFloat(feePercent) / 100;

    if (!entry || !exit || !size || !lev) return;

    const capitalRequired = size / lev;
    const feeAmount = size * fee * 2; // Entry + Exit fees
    
    let grossPL: number;
    if (direction === 'long') {
      grossPL = ((exit - entry) / entry) * size;
    } else {
      grossPL = ((entry - exit) / entry) * size;
    }

    const netProfit = grossPL - feeAmount;
    const roi = (netProfit / capitalRequired) * 100;
    
    // Liquidation price calculation
    const liquidationBuffer = 0.8; // 80% of margin before liquidation
    let liquidationPrice: number;
    
    if (direction === 'long') {
      liquidationPrice = entry * (1 - (liquidationBuffer / lev));
    } else {
      liquidationPrice = entry * (1 + (liquidationBuffer / lev));
    }

    setResults({
      grossPL,
      netProfit,
      roi,
      liquidationPrice,
      isWin: netProfit > 0
    });
  };

  useEffect(() => {
    if (entryPrice && exitPrice && positionSize && leverage) {
      calculateResults();
    }
  }, [entryPrice, exitPrice, positionSize, leverage, direction, feePercent]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <TooltipProvider>
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Input Section */}
        <Card className="border-primary/20 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              Trade Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entryPrice" className="flex items-center gap-2">
                  Entry Price
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>The price at which you enter the position</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Input
                  id="entryPrice"
                  type="number"
                  placeholder="0.00"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exitPrice" className="flex items-center gap-2">
                  Exit Price
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>The price at which you plan to exit or have exited</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Input
                  id="exitPrice"
                  type="number"
                  placeholder="0.00"
                  value={exitPrice}
                  onChange={(e) => setExitPrice(e.target.value)}
                  className="bg-background/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="positionSize" className="flex items-center gap-2">
                Position Size (USD)
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total value of your position including leverage</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Input
                id="positionSize"
                type="number"
                placeholder="1000"
                value={positionSize}
                onChange={(e) => setPositionSize(e.target.value)}
                className="bg-background/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="leverage" className="flex items-center gap-2">
                  Leverage
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Multiplier for your position size</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Select value={leverage} onValueChange={setLeverage}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 5, 10, 20, 25, 50, 100].map((lev) => (
                      <SelectItem key={lev} value={lev.toString()}>
                        {lev}x
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="direction">Direction</Label>
                <Select value={direction} onValueChange={setDirection}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="long">Long (Buy)</SelectItem>
                    <SelectItem value="short">Short (Sell)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feePercent" className="flex items-center gap-2">
                Trading Fee (%)
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Combined entry and exit fees (typically 0.1-0.2%)</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Input
                id="feePercent"
                type="number"
                step="0.01"
                placeholder="0.1"
                value={feePercent}
                onChange={(e) => setFeePercent(e.target.value)}
                className="bg-background/50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card className="border-primary/20 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {results?.isWin ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
              Calculation Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {results ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Gross P/L</Label>
                    <div className={`text-2xl font-bold ${results.grossPL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatCurrency(results.grossPL)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Net Profit</Label>
                    <div className={`text-2xl font-bold ${results.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatCurrency(results.netProfit)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">ROI</Label>
                    <div className={`text-xl font-semibold ${results.roi >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatPercentage(results.roi)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Result</Label>
                    <div className={`text-xl font-semibold ${results.isWin ? 'text-green-500' : 'text-red-500'}`}>
                      {results.isWin ? 'WIN' : 'LOSS'}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Liquidation Price</Label>
                  <div className="text-xl font-semibold text-orange-500">
                    {formatCurrency(results.liquidationPrice)}
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Capital Required: {formatCurrency(parseFloat(positionSize) / parseFloat(leverage))}</p>
                    <p>Total Fees: {formatCurrency((parseFloat(positionSize) * parseFloat(feePercent) / 100) * 2)}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Enter your trade parameters to see calculations</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}