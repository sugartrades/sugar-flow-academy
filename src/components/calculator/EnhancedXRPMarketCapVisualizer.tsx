import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useXRPMarketData } from '@/hooks/useXRPMarketData';
import { useRealisticMarketSimulator } from './RealisticMarketSimulator';
import { useSmoothValueTransition } from '@/hooks/useSmoothValueTransition';
import { MarketImpactBreakdown } from './MarketImpactBreakdown';
import { CalibrationDisplay } from './CalibrationDisplay';
import { MarketCapSettings } from './MarketCapSettings';
import { LiveExchangeFloatEstimator } from './LiveExchangeFloatEstimator';
import { LeverageSentimentBar } from './LeverageSentimentBar';
import { FundingRatePanel } from './FundingRatePanel';
import { TestModePanel } from './TestModePanel';
import { InfoIcon, TrendingUpIcon, DollarSignIcon, TargetIcon, AlertTriangleIcon, ZapIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  CALCULATOR_DEFAULTS, 
  SLIDER_CONFIGS, 
  FORMATTING, 
  MARKET_DATA 
} from '@/config/constants';

// Remove old interfaces since we're using the new realistic simulator

export function EnhancedXRPMarketCapVisualizer() {
  const { xrpData, loading, refreshing, derivativesEnabled, setDerivativesEnabled } = useXRPMarketData();
  
  // State for simulation parameters
  const [xrpFloat, setXrpFloat] = useState<number>(CALCULATOR_DEFAULTS.XRP_FLOAT);
  const [buyOrderSize, setBuyOrderSize] = useState<number>(CALCULATOR_DEFAULTS.BUY_ORDER_SIZE);
  const [leverageAmplifier, setLeverageAmplifier] = useState<number>(CALCULATOR_DEFAULTS.LEVERAGE_AMPLIFIER);
  const [updateFrequency, setUpdateFrequency] = useState<number>(CALCULATOR_DEFAULTS.UPDATE_FREQUENCY);
  const [dataSource, setDataSource] = useState<string>(CALCULATOR_DEFAULTS.DATA_SOURCE);
  const [manualFloatOverride, setManualFloatOverride] = useState<boolean>(CALCULATOR_DEFAULTS.MANUAL_FLOAT_OVERRIDE);
  const [isTestMode, setIsTestMode] = useState<boolean>(CALCULATOR_DEFAULTS.TEST_MODE);
  const [testSnapshot, setTestSnapshot] = useState<any>(null);

  // Get current XRP price and derivatives data
  const currentPrice = xrpData?.price || MARKET_DATA.DEFAULT_XRP_PRICE_ENHANCED;
  const derivativesData = xrpData?.derivatives;

  // Calculate dynamic exchange float based on derivatives data
  const calculatedFloat = useMemo(() => {
    if (derivativesEnabled && derivativesData && !manualFloatOverride) {
      // Use estimated float from derivatives data
      return derivativesData.estimatedFloat;
    }
    return xrpFloat; // Use manual setting
  }, [derivativesEnabled, derivativesData, manualFloatOverride, xrpFloat]);

  // Dynamic step calculation for smooth slider interaction (memoized)
  const getDynamicStep = useCallback((value: number): number => {
    const { DYNAMIC_STEPS } = SLIDER_CONFIGS.XRP_FLOAT;
    if (value < 10000000) return DYNAMIC_STEPS.SMALL;
    if (value < 100000000) return DYNAMIC_STEPS.MEDIUM;
    if (value < 1000000000) return DYNAMIC_STEPS.LARGE;
    return DYNAMIC_STEPS.EXTRA_LARGE;
  }, []);

  // Memoized callback for buy order changes
  const handleBuyOrderChange = useCallback((value: number[]) => {
    console.log('🎯 Buy order size changed:', value[0]);
    setBuyOrderSize(value[0]);
  }, []);

  // Memoized market cap calculation
  const marketCap = useMemo(() => 
    xrpData?.marketCap || (currentPrice * MARKET_DATA.XRP_TOTAL_SUPPLY), 
    [xrpData?.marketCap, currentPrice]
  );

  // Use the new realistic market simulator
  const simulationResults = useRealisticMarketSimulator({
    currentPrice,
    buyOrderSize,
    availableFloat: calculatedFloat,
    marketCap,
    derivativesData
  });

  // Smooth transitions for key values
  const priceImpactTransition = useSmoothValueTransition(simulationResults.priceImpact);
  const marketCapIncreaseTransition = useSmoothValueTransition(simulationResults.marketCapIncrease);
  const effectiveMultiplierTransition = useSmoothValueTransition(simulationResults.effectiveMultiplier);
  const slippageTransition = useSmoothValueTransition(simulationResults.slippagePercentage);

  // Memoized formatting functions to prevent recreation on every render
  const formatCurrency = useCallback((amount: number | undefined | null): string => {
    if (amount == null || isNaN(amount)) return '$0.00';
    if (amount >= FORMATTING.CURRENCY.TRILLION) return `$${(amount / FORMATTING.CURRENCY.TRILLION).toFixed(2)}T`;
    if (amount >= FORMATTING.CURRENCY.BILLION) return `$${(amount / FORMATTING.CURRENCY.BILLION).toFixed(2)}B`;
    if (amount >= FORMATTING.CURRENCY.MILLION) return `$${(amount / FORMATTING.CURRENCY.MILLION).toFixed(2)}M`;
    if (amount >= FORMATTING.CURRENCY.THOUSAND) return `$${(amount / FORMATTING.CURRENCY.THOUSAND).toFixed(2)}K`;
    return `$${amount.toFixed(2)}`;
  }, []);

  const formatPrice = useCallback((price: number | undefined | null): string => {
    if (price == null || isNaN(price)) return '$0.0000';
    return `$${price.toFixed(FORMATTING.PRICE_DECIMALS)}`;
  }, []);
  
  const formatXRPValue = useCallback((amount: number | undefined | null): string => {
    if (amount == null || isNaN(amount)) return '0 XRP';
    if (amount >= FORMATTING.XRP_VALUE.BILLION) return `${(amount / FORMATTING.XRP_VALUE.BILLION).toFixed(2)}B XRP`;
    if (amount >= FORMATTING.XRP_VALUE.MILLION) return `${(amount / FORMATTING.XRP_VALUE.MILLION).toFixed(2)}M XRP`;
    if (amount >= FORMATTING.XRP_VALUE.THOUSAND) return `${(amount / FORMATTING.XRP_VALUE.THOUSAND).toFixed(2)}K XRP`;
    return `${amount.toFixed(0)} XRP`;
  }, []);

  const formatSliderValue = useCallback((value: number | undefined | null): string => {
    if (value == null || isNaN(value)) return '0';
    if (value >= FORMATTING.CURRENCY.BILLION) return `${(value / FORMATTING.CURRENCY.BILLION).toFixed(1)}B`;
    if (value >= FORMATTING.CURRENCY.MILLION) return `${(value / FORMATTING.CURRENCY.MILLION).toFixed(0)}M`;
    return `${(value / FORMATTING.CURRENCY.THOUSAND).toFixed(0)}K`;
  }, []);

  // Memoized state setters to prevent child component re-renders
  const handleDerivativesToggle = useCallback((enabled: boolean) => {
    setDerivativesEnabled(enabled);
  }, [setDerivativesEnabled]);

  const handleUpdateFrequencyChange = useCallback((frequency: number) => {
    setUpdateFrequency(frequency);
  }, []);

  const handleDataSourceChange = useCallback((source: string) => {
    setDataSource(source);
  }, []);

  const handleLeverageAmplifierChange = useCallback((amplifier: number) => {
    setLeverageAmplifier(amplifier);
  }, []);

  const handleTestModeChange = useCallback((mode: boolean) => {
    setIsTestMode(mode);
  }, []);

  const handleSnapshotSelect = useCallback((snapshot: any) => {
    setTestSnapshot(snapshot);
  }, []);

  const handleManualFloatReset = useCallback(() => {
    setManualFloatOverride(false);
  }, []);

  const handleXRPFloatChange = useCallback((value: number[]) => {
    setXrpFloat(value[0]);
    setManualFloatOverride(true);
  }, []);

  if (loading && !xrpData) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="calculator-card">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2 loading-fade"></div>
                <div className="h-8 bg-muted rounded w-1/2 loading-fade"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="calculator-card">
              <CardContent className="p-6">
                <div className="h-6 bg-muted rounded w-1/3 mb-4 loading-fade"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded loading-fade"></div>
                  <div className="h-12 bg-muted rounded loading-fade"></div>
                  <div className="h-4 bg-muted rounded w-2/3 loading-fade"></div>
                </div>
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
        onDerivativesToggle={handleDerivativesToggle}
        updateFrequency={updateFrequency}
        onUpdateFrequencyChange={handleUpdateFrequencyChange}
        dataSource={dataSource}
        onDataSourceChange={handleDataSourceChange}
        leverageAmplifier={leverageAmplifier}
        onLeverageAmplifierChange={handleLeverageAmplifierChange}
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
        onTestModeChange={handleTestModeChange}
        onSnapshotSelect={handleSnapshotSelect}
        currentSnapshot={testSnapshot}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="calculator-card">
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
                            onClick={handleManualFloatReset}
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
                min={SLIDER_CONFIGS.XRP_FLOAT.MIN}
                max={SLIDER_CONFIGS.XRP_FLOAT.MAX}
                step={SLIDER_CONFIGS.XRP_FLOAT.STEP}
                value={[calculatedFloat]}
                onValueChange={handleXRPFloatChange}
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

        <Card className="calculator-card">
          <CardHeader>
            <CardTitle>Buy Order Simulation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="buy-order">Buy Order Size</Label>
              <Slider
                id="buy-order"
                min={SLIDER_CONFIGS.BUY_ORDER_ENHANCED.MIN}
                max={SLIDER_CONFIGS.BUY_ORDER_ENHANCED.MAX}
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
                  Available liquidity: {formatXRPValue(calculatedFloat)}
                </div>
                {buyOrderSize > calculatedFloat && (
                  <div className="text-xs text-orange-600 font-medium">
                    ⚠️ Order exceeds available float
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Results Display with Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          <TabsTrigger value="calibration">Calibration</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Main Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="calculator-card">
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

        <Card className="calculator-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {derivativesEnabled ? "Leverage-Adjusted Market Cap" : "Market Cap Impact"}
            </CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(simulationResults.marketCapIncrease)}
            </div>
            <p className="text-xs text-muted-foreground">
              {derivativesEnabled ? "Total adjusted cap" : "Increase from current"}
            </p>
            {derivativesEnabled && (
              <p className="text-xs text-green-600 mt-1">
                New cap: {formatCurrency((xrpData?.marketCap || 0) + simulationResults.marketCapIncrease)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="calculator-card">
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

        <Card className="calculator-card">
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
                Total cost: {formatCurrency(simulationResults.executedAmount * simulationResults.averageExecutionPrice)}
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
                  {formatXRPValue(simulationResults.syntheticDemand)}
                </p>
                <p className="text-xs text-muted-foreground">From derivatives effects</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
        </TabsContent>

        <TabsContent value="breakdown">
          <MarketImpactBreakdown
            phases={simulationResults.phases}
            microstructure={simulationResults.microstructure}
            psychology={simulationResults.psychology}
            orderValueUSD={buyOrderSize * currentPrice}
          />
        </TabsContent>

        <TabsContent value="calibration">
          <CalibrationDisplay
            effectiveMultiplier={simulationResults.effectiveMultiplier}
            orderValueUSD={buyOrderSize * currentPrice}
            marketCapIncrease={simulationResults.marketCapIncrease}
          />
        </TabsContent>

        <TabsContent value="education">
          <Card>
            <CardHeader>
              <CardTitle>Why 522x Multipliers Are Real</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                The Coinglass example shows how $40M capital inflow created $20.9B market cap movement (522x multiplier) 
                through derivatives leverage, market psychology, and liquidity constraints.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 rounded">
                  <h4 className="font-semibold text-blue-800 mb-2">Enhanced Model Features</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Realistic market microstructure</li>
                    <li>• Derivatives-driven amplification</li>
                    <li>• Market psychology simulation</li>
                    <li>• Calibrated against real data</li>
                  </ul>
                </div>
                <div className="p-3 bg-green-50 rounded">
                  <h4 className="font-semibold text-green-800 mb-2">Key Insights</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Float is much smaller than total supply</li>
                    <li>• Large orders trigger cascading effects</li>
                    <li>• Psychology amplifies price movements</li>
                    <li>• Derivatives create synthetic demand</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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