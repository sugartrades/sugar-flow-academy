import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  Lightbulb,
  ArrowRight,
  Target
} from 'lucide-react';

interface OrderBookLevel {
  price: number;
  size: number;
  cumulative: number;
}

interface SimulationResults {
  initialPrice: number;
  finalPrice: number;
  initialMarketCap: number;
  finalMarketCap: number;
  marketCapIncrease: number;
  multiplier: number;
  ordersExecuted: number;
  averageExecutionPrice: number;
}

export function XRPMarketCapVisualizer() {
  const [buyOrderSize, setBuyOrderSize] = useState([1000000000]); // $1B default
  
  // XRP constants
  const XRP_SUPPLY = 99987000000; // ~99.987 billion XRP in circulation
  const INITIAL_XRP_PRICE = 3.00; // Starting price assumption
  
  // Generate realistic order book data
  const orderBook = useMemo((): OrderBookLevel[] => {
    const levels: OrderBookLevel[] = [];
    let cumulative = 0;
    
    // Generate order book levels from $3 to $1000+
    for (let price = INITIAL_XRP_PRICE; price <= 1000; price += 0.01) {
      // Exponentially decreasing liquidity as price increases
      const baseSize = Math.max(100000, 10000000 * Math.exp(-(price - INITIAL_XRP_PRICE) * 0.5));
      
      // Add some randomness but keep it realistic
      const randomFactor = 0.7 + Math.random() * 0.6;
      const size = baseSize * randomFactor;
      
      cumulative += size;
      
      levels.push({
        price: Number(price.toFixed(2)),
        size,
        cumulative
      });
      
      // Larger price jumps at higher levels for performance
      if (price > 10) price += 0.04;
      if (price > 50) price += 0.20;
      if (price > 100) price += 1.00;
    }
    
    return levels;
  }, []);

  // Calculate simulation results
  const simulationResults = useMemo((): SimulationResults => {
    const buyOrder = buyOrderSize[0];
    let remainingBuyOrder = buyOrder;
    let totalXRPBought = 0;
    let totalUSDSpent = 0;
    let ordersExecuted = 0;
    let finalPrice = INITIAL_XRP_PRICE;
    
    // Execute buy order through order book
    for (const level of orderBook) {
      if (remainingBuyOrder <= 0) break;
      
      const levelValue = level.size * level.price;
      const buyAmount = Math.min(remainingBuyOrder, levelValue);
      const xrpBought = buyAmount / level.price;
      
      totalXRPBought += xrpBought;
      totalUSDSpent += buyAmount;
      remainingBuyOrder -= buyAmount;
      finalPrice = level.price;
      ordersExecuted++;
      
      if (buyAmount === levelValue) ordersExecuted++;
    }
    
    const initialMarketCap = INITIAL_XRP_PRICE * XRP_SUPPLY;
    const finalMarketCap = finalPrice * XRP_SUPPLY;
    const marketCapIncrease = finalMarketCap - initialMarketCap;
    const multiplier = totalUSDSpent > 0 ? marketCapIncrease / totalUSDSpent : 0;
    const averageExecutionPrice = totalXRPBought > 0 ? totalUSDSpent / totalXRPBought : INITIAL_XRP_PRICE;
    
    return {
      initialPrice: INITIAL_XRP_PRICE,
      finalPrice,
      initialMarketCap,
      finalMarketCap,
      marketCapIncrease,
      multiplier,
      ordersExecuted,
      averageExecutionPrice
    };
  }, [buyOrderSize, orderBook]);

  const formatCurrency = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatPrice = (value: number) => {
    return `$${value.toFixed(4)}`;
  };

  const formatSliderValue = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
    return formatCurrency(value);
  };

  return (
    <div className="space-y-8">
      {/* Buy Order Size Slider */}
      <Card className="border-primary/20 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Buy Order Size
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">$10M</span>
              <div className="text-2xl font-bold text-primary">
                {formatSliderValue(buyOrderSize[0])}
              </div>
              <span className="text-sm text-muted-foreground">$10B</span>
            </div>
            <Slider
              value={buyOrderSize}
              onValueChange={setBuyOrderSize}
              min={10000000}
              max={10000000000}
              step={50000000}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Price Impact */}
        <Card className="border-primary/20 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Price Impact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Initial Price</p>
                <p className="text-2xl font-bold">{formatPrice(simulationResults.initialPrice)}</p>
              </div>
              <ArrowRight className="w-6 h-6 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">New Price</p>
                <p className="text-2xl font-bold text-green-500">{formatPrice(simulationResults.finalPrice)}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Price Increase</span>
                <span className="font-semibold text-green-500">
                  +{(((simulationResults.finalPrice - simulationResults.initialPrice) / simulationResults.initialPrice) * 100).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Avg Execution Price</span>
                <span className="font-semibold">{formatPrice(simulationResults.averageExecutionPrice)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Market Cap Impact */}
        <Card className="border-primary/20 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              Market Cap Impact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Initial Market Cap</span>
                <span className="font-semibold">{formatCurrency(simulationResults.initialMarketCap)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Final Market Cap</span>
                <span className="font-semibold text-green-500">{formatCurrency(simulationResults.finalMarketCap)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Market Cap Increase</span>
                <span className="font-bold text-green-500">{formatCurrency(simulationResults.marketCapIncrease)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Effective Multiplier</span>
                <Badge variant="secondary" className="text-lg font-bold">
                  {simulationResults.multiplier.toFixed(1)}x
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Execution Details */}
      <Card className="border-primary/20 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-500" />
            Order Execution Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Orders Executed</p>
              <p className="text-3xl font-bold text-orange-500">{simulationResults.ordersExecuted.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Order Book Depth</p>
              <p className="text-3xl font-bold">{formatPrice(INITIAL_XRP_PRICE)} - {formatPrice(simulationResults.finalPrice)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Liquidity Consumed</p>
              <p className="text-3xl font-bold text-blue-500">{formatCurrency(buyOrderSize[0])}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insight Card */}
      <Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            💡 Market Insight
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p className="font-medium">Why does price move so much on low liquidity?</p>
            <div className="space-y-2 text-muted-foreground">
              <p>
                • <strong>Order Book Depth:</strong> Large buy orders must consume multiple price levels to fill completely
              </p>
              <p>
                • <strong>Market Cap Multiplication:</strong> Price increases apply to the entire circulating supply (~100B XRP)
              </p>
              <p>
                • <strong>Liquidity Scarcity:</strong> Higher price levels typically have exponentially less liquidity available
              </p>
              <p className="pt-2 font-medium text-foreground">
                A {formatCurrency(buyOrderSize[0])} buy order creates a {formatCurrency(simulationResults.marketCapIncrease)} market cap increase - 
                a <span className="text-green-500 font-bold">{simulationResults.multiplier.toFixed(1)}x multiplier effect!</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
