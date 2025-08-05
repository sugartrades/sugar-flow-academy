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

  // Generate realistic order book with proper market depth simulation
  const orderBook = useMemo((): OrderBookLevel[] => {
    console.log('📚 orderBook useMemo triggered with:', { 
      currentPrice, 
      calculatedFloat, 
      derivativesEnabled 
    });
    
    const levels: OrderBookLevel[] = [];
    let cumulative = 0;
    
    // REALISTIC market parameters - based on actual crypto orderbooks
    const totalLevels = 200;
    
    // Real XRP orderbooks - use Live Exchange Float Estimator data
    const estimatedExchangeFloat = derivativesEnabled && derivativesData?.estimatedFloat 
      ? derivativesData.estimatedFloat 
      : calculatedFloat;
    
    // Realistic percentage of exchange float available in orderbooks (typically 1-5%)
    const orderBookPercentage = 0.02; // 2% of exchange float in orderbooks
    const realisticTotalLiquidity = estimatedExchangeFloat * orderBookPercentage;
    
    console.log('💧 Using Live Exchange Float data:', {
      estimatedExchangeFloat: estimatedExchangeFloat,
      orderBookPercentage: `${orderBookPercentage * 100}%`,
      realisticTotalLiquidity: realisticTotalLiquidity
    });
    
    for (let i = 0; i < totalLevels; i++) {
      // AGGRESSIVE price progression - each level should meaningfully increase price
      // Start with tight spread, then exponential growth
      let priceIncrease;
      if (i < 10) {
        // Very tight spread for first 10 levels (0.1% - 1%)
        priceIncrease = (i + 1) * 0.001;
      } else if (i < 50) {
        // Moderate spread for next 40 levels (1% - 10%)
        const levelRatio = (i - 10) / 40;
        priceIncrease = 0.01 + (levelRatio * levelRatio * 0.09);
      } else {
        // Exponential growth for deeper levels (10% - 500%)
        const levelRatio = (i - 50) / 150;
        priceIncrease = 0.1 + Math.pow(levelRatio, 2) * 4.9; // Up to 500% increase
      }
      
      const price = currentPrice * (1 + priceIncrease);
      
      // REALISTIC liquidity distribution with steep decay
      let liquidityAtLevel;
      if (i < 5) {
        // Best levels: decent liquidity
        liquidityAtLevel = realisticTotalLiquidity * 0.15 * Math.exp(-i * 0.3);
      } else if (i < 20) {
        // Good levels: moderate liquidity  
        liquidityAtLevel = realisticTotalLiquidity * 0.08 * Math.exp(-(i - 5) * 0.2);
      } else {
        // Deep levels: very little liquidity
        liquidityAtLevel = realisticTotalLiquidity * 0.02 * Math.exp(-(i - 20) * 0.1);
      }
      
      // Apply minimal derivatives influence (keep it realistic)
      const derivativesInfluence = derivativesEnabled && derivativesData 
        ? Math.max(0.5, Math.min(1.5, 1 + (derivativesData.avgFundingRate * 20)))
        : 1.0;
      
      const size = Math.max(50, liquidityAtLevel * derivativesInfluence); // Minimum 50 XRP per level
      cumulative += size;
      
      levels.push({
        price,
        size,
        cumulative
      });
      
      console.log(`Level ${i}: price=$${price.toFixed(4)} (+${(priceIncrease*100).toFixed(2)}%), size=${size.toFixed(0)} XRP`);
      
      // Stop if we've used up our liquidity budget
      if (cumulative >= realisticTotalLiquidity) {
        console.log(`💧 Liquidity cap reached at level ${i}`);
        break;
      }
    }
    
    console.log('📊 Order book stats:', { 
      totalLevels: levels.length, 
      totalLiquidity: cumulative, 
      maxPrice: levels[levels.length - 1]?.price,
      priceRange: `$${currentPrice.toFixed(4)} - $${levels[levels.length - 1]?.price.toFixed(4)}`,
      maxPriceIncrease: levels.length > 0 ? `${(((levels[levels.length - 1].price / currentPrice) - 1) * 100).toFixed(1)}%` : '0%'
    });
    
    return levels;
  }, [currentPrice, calculatedFloat, derivativesEnabled, derivativesData]);

  // Calculate total available liquidity in order book
  const totalAvailableLiquidity = useMemo(() => {
    return orderBook.reduce((total, level) => total + level.size, 0);
  }, [orderBook]);

  // Calculate simulation results with enhanced safety checks
  const simulationResults = useMemo((): SimulationResults => {
    console.log('🔄 simulationResults useMemo triggered');
    console.log('📊 Simulation Parameters:', { 
      buyOrderSize, 
      currentPrice, 
      orderBookLength: orderBook.length,
      totalAvailableLiquidity,
      derivativesEnabled,
      leverageAmplifier,
      marketCap: xrpData?.marketCap
    });
    
    // Safety check: validate inputs
    if (!buyOrderSize || buyOrderSize <= 0 || !currentPrice || currentPrice <= 0) {
      console.warn('⚠️ Invalid simulation parameters, returning defaults');
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
    
    // Check if buy order exceeds available liquidity
    if (buyOrderSize > totalAvailableLiquidity) {
      console.warn('⚠️ Buy order exceeds total available liquidity');
    }
    
    let totalCost = 0;
    let finalPrice = currentPrice;
    let liquidityConsumed = 0;
    
    // Calculate synthetic buy pressure from derivatives
    let syntheticBuyPressure = 0;
    if (derivativesEnabled && derivativesData) {
      const longShortImbalance = Math.max(-1, Math.min(1, derivativesData.avgLongShortRatio - 1)); // Clamp to reasonable range
      const fundingPressure = Math.max(0, Math.abs(derivativesData.avgFundingRate) * 1000); // Ensure positive
      syntheticBuyPressure = Math.max(0, (longShortImbalance + fundingPressure) * buyOrderSize * 0.1);
    }
    
    // Calculate effective order size including synthetic pressure
    const effectiveOrderSize = buyOrderSize + syntheticBuyPressure;
    let remainingEffectiveAmount = effectiveOrderSize;
    
    // Execute through order book with safety checks
    for (const level of orderBook) {
      if (remainingEffectiveAmount <= 0) break;
      
      // Safety check for level data
      if (!level.size || level.size <= 0 || !level.price || level.price <= 0) {
        console.warn('⚠️ Invalid order book level:', level);
        continue;
      }
      
      const amountToTake = Math.min(remainingEffectiveAmount, level.size);
      totalCost += amountToTake * level.price;
      liquidityConsumed += amountToTake;
      remainingEffectiveAmount -= amountToTake;
      finalPrice = level.price;
    }
    
    // Safety checks for calculated values
    const executedAmount = Math.min(buyOrderSize, liquidityConsumed);
    const averageExecutionPrice = liquidityConsumed > 0 ? totalCost / liquidityConsumed : currentPrice;
    
    // Prevent division by zero and invalid percentages
    const priceImpact = currentPrice > 0 ? ((finalPrice - currentPrice) / currentPrice) * 100 : 0;
    const slippagePercentage = currentPrice > 0 ? ((averageExecutionPrice - currentPrice) / currentPrice) * 100 : 0;
    
    // Calculate market cap changes with safety checks
    const currentMarketCap = xrpData?.marketCap || (currentPrice * 100000000000); // 100B total supply
    const newMarketCap = currentPrice > 0 ? (currentMarketCap / currentPrice) * finalPrice : currentMarketCap;
    const marketCapIncrease = newMarketCap - currentMarketCap;
    
    // Calculate leverage-adjusted market cap
    const leverageMultiplier = derivativesEnabled && derivativesData 
      ? Math.max(0.1, derivativesData.leverageMultiplier * leverageAmplifier) // Prevent zero or negative multipliers
      : 1.0;
    
    const leverageAdjustedMarketCap = currentMarketCap + (marketCapIncrease * leverageMultiplier);
    const effectiveMultiplier = currentMarketCap > 0 ? leverageAdjustedMarketCap / currentMarketCap : 1;
    
    const results = {
      finalPrice: Math.max(currentPrice, finalPrice), // Ensure price never goes below current
      priceImpact: Math.max(0, priceImpact), // Price impact should be positive for buy orders
      marketCapIncrease,
      leverageAdjustedMarketCap,
      effectiveMultiplier: Math.max(1, effectiveMultiplier), // Multiplier should be at least 1
      executedAmount,
      averageExecutionPrice: Math.max(currentPrice, averageExecutionPrice), // Execution price should be at least current price
      slippagePercentage: Math.max(0, slippagePercentage), // Slippage should be positive
      liquidityConsumed,
      syntheticBuyPressure
    };
    
    console.log('✅ Simulation results:', results);
    return results;
  }, [buyOrderSize, orderBook, currentPrice, totalAvailableLiquidity, xrpData?.marketCap, derivativesEnabled, derivativesData, leverageAmplifier]);

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