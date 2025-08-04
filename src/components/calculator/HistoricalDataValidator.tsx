import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';

const historicalDataSchema = z.object({
  eventName: z.string().min(1, "Event name is required"),
  initialPrice: z.number().min(0.001, "Initial price must be greater than 0"),
  finalPrice: z.number().min(0.001, "Final price must be greater than 0"),
  netInflow: z.number().min(1000000, "Net inflow must be at least $1M"),
  timeframe: z.string().min(1, "Timeframe is required"),
  marketCapChange: z.number(),
});

type HistoricalDataForm = z.infer<typeof historicalDataSchema>;

interface ValidationResult {
  predictedPriceChange: number;
  actualPriceChange: number;
  predictedMarketCapChange: number;
  actualMarketCapChange: number;
  accuracy: number;
  deviation: number;
}

interface CalibrationSuggestion {
  parameter: string;
  currentValue: number;
  suggestedValue: number;
  impact: string;
  confidence: number;
}

export function HistoricalDataValidator() {
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [calibrationSuggestions, setCalibrationSuggestions] = useState<CalibrationSuggestion[]>([]);

  const form = useForm<HistoricalDataForm>({
    resolver: zodResolver(historicalDataSchema),
    defaultValues: {
      eventName: "",
      initialPrice: 0,
      finalPrice: 0,
      netInflow: 0,
      timeframe: "",
      marketCapChange: 0,
    },
  });

  // Simulate order book impact (simplified version of the main calculator logic)
  const simulateOrderBookImpact = (netInflow: number, initialPrice: number) => {
    const XRP_SUPPLY = 99987000000;
    const estimatedFloat = 5000000000; // 5B XRP on exchanges
    
    // Simplified order book simulation
    const orderBookDepth = estimatedFloat * 0.1; // 10% of float in order book
    const averageSpread = initialPrice * 0.001; // 0.1% spread
    
    // Calculate price impact based on order book absorption
    const priceImpact = (netInflow / (orderBookDepth * initialPrice)) * averageSpread;
    const newPrice = initialPrice * (1 + priceImpact);
    const marketCapChange = (newPrice - initialPrice) * XRP_SUPPLY;
    
    return {
      predictedPrice: newPrice,
      predictedPriceChange: ((newPrice - initialPrice) / initialPrice) * 100,
      predictedMarketCapChange: marketCapChange,
    };
  };

  const validateHistoricalData = (data: HistoricalDataForm) => {
    const simulation = simulateOrderBookImpact(data.netInflow, data.initialPrice);
    const actualPriceChange = ((data.finalPrice - data.initialPrice) / data.initialPrice) * 100;
    
    const result: ValidationResult = {
      predictedPriceChange: simulation.predictedPriceChange,
      actualPriceChange,
      predictedMarketCapChange: simulation.predictedMarketCapChange,
      actualMarketCapChange: data.marketCapChange,
      accuracy: 100 - Math.abs(simulation.predictedPriceChange - actualPriceChange),
      deviation: Math.abs(simulation.predictedPriceChange - actualPriceChange),
    };

    return result;
  };

  const generateCalibrationSuggestions = (results: ValidationResult[]) => {
    if (results.length === 0) return [];

    const avgAccuracy = results.reduce((sum, r) => sum + r.accuracy, 0) / results.length;
    const avgDeviation = results.reduce((sum, r) => sum + r.deviation, 0) / results.length;

    const suggestions: CalibrationSuggestion[] = [];

    if (avgAccuracy < 70) {
      suggestions.push({
        parameter: "Order Book Depth",
        currentValue: 10,
        suggestedValue: avgDeviation > 20 ? 15 : 8,
        impact: "Adjusts price impact sensitivity",
        confidence: 75,
      });

      suggestions.push({
        parameter: "Market Depth Multiplier",
        currentValue: 0.001,
        suggestedValue: avgDeviation > 30 ? 0.0015 : 0.0008,
        impact: "Fine-tunes spread calculations",
        confidence: 68,
      });
    }

    return suggestions;
  };

  const onSubmit = (data: HistoricalDataForm) => {
    const result = validateHistoricalData(data);
    const newResults = [...validationResults, result];
    setValidationResults(newResults);
    setCalibrationSuggestions(generateCalibrationSuggestions(newResults));
    form.reset();
  };

  const overallAccuracy = useMemo(() => {
    if (validationResults.length === 0) return 0;
    return validationResults.reduce((sum, r) => sum + r.accuracy, 0) / validationResults.length;
  }, [validationResults]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Historical Data Validation
        </CardTitle>
        <CardDescription>
          Cross-validate the simulation model with real historical XRP market events from sources like Coinglass
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="input" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="input">Input Data</TabsTrigger>
            <TabsTrigger value="results">Validation Results</TabsTrigger>
            <TabsTrigger value="calibration">Model Calibration</TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="eventName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., BlackRock ETF Approval" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="timeframe"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timeframe</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 24 hours, 1 week" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="initialPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Initial XRP Price ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.0001" 
                            placeholder="0.5000" 
                            {...field} 
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="finalPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Final XRP Price ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.0001" 
                            placeholder="0.6500" 
                            {...field} 
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="netInflow"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Net Inflow ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="1000000" 
                            placeholder="100000000" 
                            {...field} 
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Total buy pressure from Coinglass or similar sources
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="marketCapChange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Actual Market Cap Change ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="1000000" 
                            placeholder="5000000000" 
                            {...field} 
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Validate Historical Data
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {validationResults.length === 0 ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No validation data available. Add historical events to see results.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Model Accuracy</h3>
                  <div className="flex items-center gap-2">
                    <Progress value={overallAccuracy} className="w-32" />
                    <Badge variant={overallAccuracy > 70 ? "default" : "destructive"}>
                      {overallAccuracy.toFixed(1)}%
                    </Badge>
                  </div>
                </div>

                <div className="grid gap-4">
                  {validationResults.map((result, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Predicted Change</p>
                            <p className="font-semibold flex items-center gap-1">
                              {result.predictedPriceChange > 0 ? (
                                <TrendingUp className="h-3 w-3 text-green-500" />
                              ) : (
                                <TrendingDown className="h-3 w-3 text-red-500" />
                              )}
                              {formatPercentage(result.predictedPriceChange)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Actual Change</p>
                            <p className="font-semibold flex items-center gap-1">
                              {result.actualPriceChange > 0 ? (
                                <TrendingUp className="h-3 w-3 text-green-500" />
                              ) : (
                                <TrendingDown className="h-3 w-3 text-red-500" />
                              )}
                              {formatPercentage(result.actualPriceChange)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Accuracy</p>
                            <p className="font-semibold">
                              {result.accuracy.toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Deviation</p>
                            <p className="font-semibold">
                              {result.deviation.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="calibration" className="space-y-4">
            {calibrationSuggestions.length === 0 ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Model appears well-calibrated. Add more validation data for better insights.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Calibration Suggestions</h3>
                <div className="grid gap-4">
                  {calibrationSuggestions.map((suggestion, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{suggestion.parameter}</h4>
                          <Badge variant="outline">
                            {suggestion.confidence}% confidence
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Current Value</p>
                            <p className="font-medium">{suggestion.currentValue}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Suggested Value</p>
                            <p className="font-medium text-primary">{suggestion.suggestedValue}</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {suggestion.impact}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}