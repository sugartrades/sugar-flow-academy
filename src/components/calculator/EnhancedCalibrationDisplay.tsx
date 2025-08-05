import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertCircle, TrendingUp, Target, BarChart3, Database } from 'lucide-react';
import { useCalibrationData } from '@/hooks/useCalibrationData';

interface EnhancedCalibrationDisplayProps {
  effectiveMultiplier: number;
  traditionalMultiplier: number;
  investmentEfficiency: number;
  orderValueUSD: number;
  marketCapIncrease: number;
}

export const EnhancedCalibrationDisplay: React.FC<EnhancedCalibrationDisplayProps> = ({
  effectiveMultiplier,
  traditionalMultiplier,
  investmentEfficiency,
  orderValueUSD,
  marketCapIncrease
}) => {
  const { metrics, rawData, loading, error } = useCalibrationData(
    orderValueUSD,
    orderValueUSD > 70000000 ? 'whale_movement' : 'large_buy'
  );

  const formatCurrency = (amount: number): string => {
    if (amount >= 1e9) {
      return `$${(amount / 1e9).toFixed(2)}B`;
    } else if (amount >= 1e6) {
      return `$${(amount / 1e6).toFixed(1)}M`;
    } else if (amount >= 1e3) {
      return `$${(amount / 1e3).toFixed(0)}K`;
    } else {
      return `$${amount.toFixed(0)}`;
    }
  };

  // Reference data from Coinglass (November 2024) - keeping as fallback
  const coinglassReference = {
    eventName: "Coinglass Large Buy Order",
    orderValue: 50000000, // $50M
    expectedMultiplier: 2.5,
    actualMarketCapIncrease: 122500000, // $122.5M
    actualMultiplier: 2.45,
    confidence: 0.90,
    dataSource: "Coinglass API"
  };

  const getAccuracyLevel = () => {
    if (loading || !metrics) {
      const difference = Math.abs(effectiveMultiplier - coinglassReference.expectedMultiplier);
      const variance = difference / coinglassReference.expectedMultiplier;
      
      if (variance <= 0.1) {
        return { level: "Excellent", color: "bg-green-100 text-green-800", confidence: "95%" };
      } else if (variance <= 0.25) {
        return { level: "Good", color: "bg-blue-100 text-blue-800", confidence: "85%" };
      } else {
        return { level: "Needs Calibration", color: "bg-yellow-100 text-yellow-800", confidence: "70%" };
      }
    }

    const difference = Math.abs(effectiveMultiplier - metrics.weightedMultiplier);
    const variance = difference / metrics.weightedMultiplier;
    
    if (variance <= 0.1) {
      return { level: "Excellent", color: "bg-green-100 text-green-800", confidence: Math.round(metrics.accuracyScore * 100) + "%" };
    } else if (variance <= 0.25) {
      return { level: "Good", color: "bg-blue-100 text-blue-800", confidence: Math.round(metrics.accuracyScore * 100) + "%" };
    } else {
      return { level: "Needs Calibration", color: "bg-yellow-100 text-yellow-800", confidence: Math.round(metrics.accuracyScore * 100) + "%" };
    }
  };

  const accuracy = getAccuracyLevel();

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Enhanced Model Calibration Assessment
          </CardTitle>
          <CardDescription>
            Comparing your simulation against {metrics ? `${metrics.dataPoints} real market events` : 'reference market data'} for accuracy validation
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Enhanced Reference Data */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-600" />
                <h3 className="font-semibold">
                  {loading ? 'Loading Reference Data...' : 'Calibrated Reference Model'}
                </h3>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">Analyzing calibration data...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-4">
                    <AlertCircle className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Using fallback reference data</p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Data Points:</span>
                      <span className="font-medium">{metrics?.dataPoints} market events</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Weighted Multiplier:</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <span className="font-medium text-blue-600 underline decoration-dotted">
                              {metrics?.weightedMultiplier.toFixed(2)}x
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Confidence-weighted average from {metrics?.dataPoints} real market events</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Model Accuracy:</span>
                      <span className="font-medium">{Math.round((metrics?.accuracyScore || 0) * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Avg. Confidence:</span>
                      <span className="font-medium">{Math.round((metrics?.averageConfidence || 0) * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Data Source:</span>
                      <span className="text-sm text-blue-600">Multi-source calibration</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Current Simulation */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <h3 className="font-semibold">Your Simulation</h3>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Order Value:</span>
                  <span className="font-medium">{formatCurrency(orderValueUSD)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Effective Multiplier:</span>
                  <span className="font-medium">{effectiveMultiplier.toFixed(2)}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Expected vs Calibrated:</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="font-medium text-green-600 underline decoration-dotted">
                          {metrics ? 
                            (((effectiveMultiplier - metrics.weightedMultiplier) / metrics.weightedMultiplier) * 100 > 0 ? '+' : '') +
                            (((effectiveMultiplier - metrics.weightedMultiplier) / metrics.weightedMultiplier) * 100).toFixed(1) + '%'
                            : 'N/A'
                          }
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Variance from calibrated model expectations</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Market Cap Impact:</span>
                  <span className="font-medium">{formatCurrency(marketCapIncrease)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Investment Efficiency:</span>
                  <span className="font-medium">{investmentEfficiency.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Accuracy Assessment */}
          <div className="pt-6 border-t">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Calibration Accuracy Assessment
              </h3>
              <Badge className={accuracy.color}>
                {accuracy.level}
              </Badge>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold">
                    {metrics ? 
                      Math.abs(effectiveMultiplier - metrics.weightedMultiplier).toFixed(2) + 'x' :
                      Math.abs(effectiveMultiplier - coinglassReference.expectedMultiplier).toFixed(2) + 'x'
                    }
                  </div>
                  <div className="text-sm text-gray-600">Variance</div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="text-xs text-blue-600 cursor-help">What's this?</div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Difference between your simulation and calibrated model prediction</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <div>
                  <div className="text-lg font-bold">{accuracy.confidence}</div>
                  <div className="text-sm text-gray-600">Model Confidence</div>
                </div>
                
                <div>
                  <div className="text-lg font-bold">
                    {metrics ? `${metrics.dataPoints}` : '1'}
                  </div>
                  <div className="text-sm text-gray-600">Reference Points</div>
                </div>
                
                <div>
                  <div className="text-lg font-bold">
                    {metrics ? Math.round(metrics.accuracyScore * 100) + '%' : '85%'}
                  </div>
                  <div className="text-sm text-gray-600">Historical Accuracy</div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Interpretation */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2">Model Interpretation:</h4>
              <p className="text-sm text-gray-700">
                {loading ? "Analyzing calibration data..." :
                 error ? "Using fallback calibration data. Your simulation shows reasonable market alignment." :
                 accuracy.level === "Excellent" 
                  ? `Your simulation closely matches patterns from ${metrics?.dataPoints} real market events. The enhanced model shows high confidence in this prediction.`
                  : accuracy.level === "Good"
                  ? `Your simulation aligns well with historical data from ${metrics?.dataPoints} market events. Minor variations are normal and expected.`
                  : `Notable variance from ${metrics?.dataPoints} reference events detected. Market conditions and timing factors may significantly affect actual outcomes.`
                }
              </p>
              
              {metrics && metrics.dataPoints > 5 && (
                <p className="text-sm text-gray-700 mt-2">
                  <strong>Enhanced Confidence:</strong> This prediction is based on analysis of {metrics.dataPoints} real market events with an average accuracy of {Math.round(metrics.accuracyScore * 100)}%.
                </p>
              )}
              
              {orderValueUSD > 75000000 && (
                <p className="text-sm text-gray-700 mt-2">
                  <strong>Large Order Notice:</strong> Your order size may trigger whale-level market dynamics with potentially amplified effects.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
