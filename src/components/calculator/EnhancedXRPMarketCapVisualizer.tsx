import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useXRPMarketData } from '@/hooks/useXRPMarketData';
import { MarketCapSettings } from './MarketCapSettings';
import { LiveExchangeFloatEstimator } from './LiveExchangeFloatEstimator';
import { LeverageSentimentBar } from './LeverageSentimentBar';
import { FundingRatePanel } from './FundingRatePanel';
import { TestModePanel } from './TestModePanel';
import { InfoIcon, TrendingUpIcon, DollarSignIcon, TargetIcon, AlertTriangleIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface OrderBookLevel {
  price: number;
  size: number;
  cumulative: number;
}

interface SimulationResults {
  finalPrice: number;
  priceImpact: number;
  marketCapIncrease: number;
  leverageAdjustedMarketCap: number;
  effectiveMultiplier: number;
  executedAmount: number;
  averageExecutionPrice: number;
  slippagePercentage: number;
  liquidityConsumed: number;
  syntheticBuyPressure: number;
}

export function EnhancedXRPMarketCapVisualizer() {
  const { xrpData, loading, derivativesEnabled, setDerivativesEnabled } = useXRPMarketData();
  
  // State for simulation parameters
  const [xrpFloat, setXrpFloat] = useState(8000000000); // 8B XRP default
  const [buyOrderSize, setBuyOrderSize] = useState(100000000); // 100M XRP
  const [leverageAmplifier, setLeverageAmplifier] = useState(2.0);
  const [updateFrequency, setUpdateFrequency] = useState(300); // 5 minutes
  const [dataSource, setDataSource] = useState('coinglass');
  const [manualFloatOverride, setManualFloatOverride] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [testSnapshot, setTestSnapshot] = useState<any>(null);

  // Get current XRP price and derivatives data
  const currentPrice = xrpData?.price || 3.0;
  const derivativesData = xrpData?.derivatives;

  // Calculate dynamic exchange float based on derivatives data
  const calculatedFloat = useMemo(() => {
    if (derivativesEnabled && derivativesData && !manualFloatOverride) {
      // Use estimated float from derivatives data
      return derivativesData.estimatedFloat;
    }
    return xrpFloat; // Use manual setting
  }, [derivativesEnabled, derivativesData, manualFloatOverride, xrpFloat]);

  // Dynamic step calculation for smooth slider interaction
  const getDynamicStep = (value: number): number => {
    if (value < 10000000) return 1000000; // 1M steps for < 10M
    if (value < 100000000) return 5000000; // 5M steps for < 100M
    if (value < 1000000000) return 10000000; // 10M steps for < 1B
    return 50000000; // 50M steps for > 1B
  };

  const handleBuyOrderChange = (value: number[]) => {
    console.log('🎯 Buy order size changed:', value[0]);
    setBuyOrderSize(value[0]);
  };

  // Generate simplified order book with dramatic price impact (like original calculator)
  const orderBook = useMemo((): OrderBookLevel[] => {
    if (!currentPrice || currentPrice <= 0) return [];
    
    const levels: OrderBookLevel[] = [];
    let cumulativeXRP = 0;
    
    // SIMPLIFIED order book - designed for educational multiplier effect
    const totalLevels = 100;
    
    // Use much larger liquidity amounts for dramatic effect (like original calculator)
    // This represents the total available liquidity across all major exchanges
    const totalLiquidity = calculatedFloat * 0.15; // 15% of float available in orderbooks
    
    console.log('📊 Simplified order book generation:', {
      calculatedFloat: calculatedFloat,
      totalLiquidity: totalLiquidity,
      currentPrice: currentPrice
    });
    
    for (let i = 0; i < totalLevels; i++) {
      // DRAMATIC price progression - steeper curve for educational effect
      const priceMultiplier = 1 + Math.pow(i / 20, 1.8) * 0.01; // Exponential price increase
      const price = currentPrice * priceMultiplier;
      
      // Front-load liquidity at current price, then rapidly decrease
      const sizeMultiplier = Math.exp(-i * 0.08); // Faster decay for dramatic effect
      const baseSize = (totalLiquidity / 20) * sizeMultiplier; // Concentrate liquidity in first 20 levels
      
      // Ensure minimum meaningful sizes
      const size = Math.max(baseSize, totalLiquidity * 0.001); // Min 0.1% of total liquidity
      
      cumulativeXRP += size;
      
      levels.push({
        price: price,
        size: size,
        cumulative: cumulativeXRP
      });
    }
    
    console.log('📈 Order book created:', {
      levels: levels.length,
      totalLiquidity: cumulativeXRP,
      priceRange: `$${currentPrice.toFixed(3)} - $${levels[levels.length - 1].price.toFixed(3)}`,
      firstLevelSize: levels[0].size,
      liquidityConcentration: `${((levels.slice(0, 10).reduce((sum, level) => sum + level.size, 0) / cumulativeXRP) * 100).toFixed(1)}% in first 10 levels`
    });
    
    return levels;
  }, [calculatedFloat, currentPrice]);

  // Calculate total available liquidity in order book
  const totalAvailableLiquidity = useMemo(() => {
    return orderBook.reduce((total, level) => total + level.size, 0);
  }, [orderBook]);

  // Calculate simulation results with simplified logic (like original calculator)
  const simulationResults = useMemo((): SimulationResults => {
    // Safety check: validate inputs
    if (!buyOrderSize || buyOrderSize <= 0 || !currentPrice || currentPrice <= 0) {
      return {
        finalPrice: currentPrice,
        priceImpact: 0,
        marketCapIncrease: 0,
        leverageAdjustedMarketCap: xrpData?.marketCap || 0,
        effectiveMultiplier: 1,
        executedAmount: 0,
        averageExecutionPrice: currentPrice,
        slippagePercentage: 0,
        liquidityConsumed: 0,
        syntheticBuyPressure: 0
      };
    }
    
    let totalCost = 0;
    let finalPrice = currentPrice;
    let liquidityConsumed = 0;
    let remainingAmount = buyOrderSize;
    
    // Simple order book execution - just walk through levels
    for (const level of orderBook) {
      if (remainingAmount <= 0) break;
      
      const amountToTake = Math.min(remainingAmount, level.size);
      totalCost += amountToTake * level.price;
      liquidityConsumed += amountToTake;
      remainingAmount -= amountToTake;
      finalPrice = level.price;
    }
    
    // Calculate basic results
    const executedAmount = buyOrderSize - remainingAmount;
    const averageExecutionPrice = liquidityConsumed > 0 ? totalCost / liquidityConsumed : currentPrice;
    const priceImpact = ((finalPrice - currentPrice) / currentPrice) * 100;
    const slippagePercentage = ((averageExecutionPrice - currentPrice) / currentPrice) * 100;
    
    // Calculate market cap impact (simple multiplier effect)
    const currentMarketCap = xrpData?.marketCap || (currentPrice * 100000000000); // 100B total supply
    const newMarketCap = (currentMarketCap / currentPrice) * finalPrice;
    const marketCapIncrease = newMarketCap - currentMarketCap;
    const effectiveMultiplier = newMarketCap / currentMarketCap;
    
    const results = {
      finalPrice,
      priceImpact,
      marketCapIncrease,
      leverageAdjustedMarketCap: newMarketCap,
      effectiveMultiplier,
      executedAmount,
      averageExecutionPrice,
      slippagePercentage,
      liquidityConsumed,
      syntheticBuyPressure: 0 // Simplified - no derivatives pressure
    };
    
    console.log('✅ Simplified simulation results:', results);
    return results;
  }, [buyOrderSize, orderBook, currentPrice, xrpData?.marketCap]);

  // Formatting functions
  const formatCurrency = (amount: number): string => {
    if (amount >= 1e12) return `$${(amount / 1e12).toFixed(2)}T`;
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(2)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(2)}M`;
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(2)}K`;
    return `$${amount.toFixed(2)}`;
  };

  const formatPrice = (price: number): string => `$${price.toFixed(4)}`;
  
  const formatXRPValue = (amount: number): string => {
    if (amount >= 1e9) return `${(amount / 1e9).toFixed(2)}B XRP`;
    if (amount >= 1e6) return `${(amount / 1e6).toFixed(2)}M XRP`;
    if (amount >= 1e3) return `${(amount / 1e3).toFixed(2)}K XRP`;
    return `${amount.toFixed(0)} XRP`;
  };

  const formatSliderValue = (value: number): string => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(0)}M`;
    return `${(value / 1e3).toFixed(0)}K`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Settings Panel */}
      <MarketCapSettings
        derivativesEnabled={derivativesEnabled}
        onDerivativesToggle={setDerivativesEnabled}
        updateFrequency={updateFrequency}
        onUpdateFrequencyChange={setUpdateFrequency}
        dataSource={dataSource}
        onDataSourceChange={setDataSource}
        leverageAmplifier={leverageAmplifier}
        onLeverageAmplifierChange={setLeverageAmplifier}
      />

      {/* Input Controls */}
      {/* Advanced Analytics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <LiveExchangeFloatEstimator 
          derivativesData={derivativesData} 
          loading={loading} 
          currentXRPPrice={currentPrice}
        />
        <LeverageSentimentBar 
          derivativesData={derivativesData} 
          loading={loading} 
        />
        <FundingRatePanel 
          derivativesData={derivativesData} 
          loading={loading} 
        />
      </div>

      {/* Test Mode Panel */}
      <TestModePanel 
        isTestMode={isTestMode}
        onTestModeChange={setIsTestMode}
        onSnapshotSelect={setTestSnapshot}
        currentSnapshot={testSnapshot}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Exchange Float Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="xrp-float">Estimated XRP Float on Exchanges</Label>
                <div className="flex items-center gap-2">
                  <Badge variant={manualFloatOverride ? "destructive" : "default"}>
                    {manualFloatOverride ? "Manual" : (derivativesEnabled ? "Auto" : "Manual")}
                  </Badge>
                  {derivativesEnabled && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setManualFloatOverride(false)}
                            disabled={!derivativesData}
                            className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
                          >
                            {manualFloatOverride ? "Reset to Auto" : "Auto Mode"}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {!derivativesData 
                              ? "Live derivatives data not available" 
                              : manualFloatOverride 
                                ? "Return to automatic calculation based on derivatives data"
                                : "Currently using automatic calculation"
                            }
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
              <Slider
                id="xrp-float"
                min={1000000000}
                max={20000000000}
                step={100000000}
                value={[calculatedFloat]}
                onValueChange={(value) => {
                  setXrpFloat(value[0]);
                  setManualFloatOverride(true);
                }}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>1B XRP</span>
                <span className="font-medium">{formatXRPValue(calculatedFloat)}</span>
                <span>20B XRP</span>
              </div>
              {derivativesEnabled && derivativesData && !manualFloatOverride && (
                <p className="text-xs text-muted-foreground">
                  Auto-calculated from Open Interest and volume data
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Buy Order Simulation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="buy-order">Buy Order Size</Label>
              <Slider
                id="buy-order"
                min={1000000}
                max={2000000000}
                step={getDynamicStep(buyOrderSize)}
                value={[buyOrderSize]}
                onValueChange={handleBuyOrderChange}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>1M XRP</span>
                <span className="font-medium">{formatXRPValue(buyOrderSize)}</span>
                <span>2B XRP</span>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">
                  Market value: {formatCurrency(buyOrderSize * currentPrice)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Available liquidity: {formatXRPValue(totalAvailableLiquidity)}
                </div>
                {buyOrderSize > totalAvailableLiquidity && (
                  <div className="text-xs text-orange-600 font-medium">
                    ⚠️ Order exceeds available liquidity
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Price Impact</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{simulationResults.priceImpact.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {formatPrice(currentPrice)} → {formatPrice(simulationResults.finalPrice)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Avg execution: {formatPrice(simulationResults.averageExecutionPrice)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {derivativesEnabled ? "Leverage-Adjusted Market Cap" : "Market Cap Impact"}
            </CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(derivativesEnabled ? simulationResults.leverageAdjustedMarketCap : simulationResults.marketCapIncrease)}
            </div>
            <p className="text-xs text-muted-foreground">
              {derivativesEnabled ? "Total adjusted cap" : "Increase from current"}
            </p>
            {derivativesEnabled && (
              <p className="text-xs text-green-600 mt-1">
                +{formatCurrency(simulationResults.leverageAdjustedMarketCap - (xrpData?.marketCap || 0))}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {derivativesEnabled ? "Effective Multiplier" : "Market Cap Multiplier"}
            </CardTitle>
            <TargetIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {simulationResults.effectiveMultiplier.toFixed(2)}x
            </div>
            <p className="text-xs text-muted-foreground">
              {derivativesEnabled ? "Including leverage effects" : "Standard multiplier"}
            </p>
            {derivativesEnabled && derivativesData && (
              <div className="space-y-1 mt-2">
                <p className="text-xs text-muted-foreground">
                  Base leverage: {derivativesData.leverageMultiplier.toFixed(2)}x
                </p>
                <p className="text-xs text-muted-foreground">
                  Amplifier: {leverageAmplifier}x
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Execution Summary</CardTitle>
            <AlertTriangleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {simulationResults.slippagePercentage.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Slippage
            </p>
            <div className="space-y-1 mt-2">
              <p className="text-xs text-muted-foreground">
                Executed: {formatXRPValue(simulationResults.executedAmount)}
              </p>
              <p className="text-xs text-muted-foreground">
                Liquidity used: {formatXRPValue(simulationResults.liquidityConsumed)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Derivatives Insights */}
      {derivativesEnabled && derivativesData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <InfoIcon className="h-5 w-5" />
              Derivatives Market Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Total Open Interest</Label>
                <p className="text-lg font-semibold">{formatXRPValue(derivativesData.totalOpenInterest)}</p>
                <p className="text-xs text-muted-foreground">Across all exchanges</p>
              </div>
              
              <div className="space-y-1">
                <Label className="text-sm font-medium">Long/Short Ratio</Label>
                <p className="text-lg font-semibold">{derivativesData.avgLongShortRatio.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  {derivativesData.avgLongShortRatio > 1 ? "Long bias" : "Short bias"}
                </p>
              </div>
              
              <div className="space-y-1">
                <Label className="text-sm font-medium">Avg Funding Rate</Label>
                <p className={`text-lg font-semibold ${derivativesData.avgFundingRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(derivativesData.avgFundingRate * 100).toFixed(4)}%
                </p>
                <p className="text-xs text-muted-foreground">8-hour rate</p>
              </div>
              
              <div className="space-y-1">
                <Label className="text-sm font-medium">Synthetic Buy Pressure</Label>
                <p className="text-lg font-semibold text-blue-600">
                  {formatXRPValue(simulationResults.syntheticBuyPressure)}
                </p>
                <p className="text-xs text-muted-foreground">From derivatives effects</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Educational Tooltip Section */}
      <Card>
        <CardHeader>
          <CardTitle>Understanding the Enhanced Model</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Traditional Model:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Uses estimated exchange float</li>
                <li>• Static order book depth</li>
                <li>• Pure spot market impact</li>
                <li>• Linear price progression</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Enhanced Model:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Dynamic float from derivatives data</li>
                <li>• Leverage-adjusted order depth</li>
                <li>• Synthetic buy pressure from futures</li>
                <li>• Funding rate influence on liquidity</li>
              </ul>
            </div>
          </div>
          
          <Separator />
          
          <div className="text-xs text-muted-foreground">
            <p><strong>Disclaimer:</strong> This is a theoretical model for educational purposes. 
            Real market conditions involve additional factors like market maker algorithms, 
            cross-exchange arbitrage, and institutional trading patterns that are not captured here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}