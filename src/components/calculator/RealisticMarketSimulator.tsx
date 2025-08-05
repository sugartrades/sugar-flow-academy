import React, { useMemo } from 'react';
import { AggregatedDerivatives } from '@/hooks/useDerivativesData';

interface RealisticMarketSimulatorProps {
  currentPrice: number;
  buyOrderSize: number;
  availableFloat: number;
  marketCap: number;
  derivativesData?: AggregatedDerivatives | null;
}

interface MarketMicrostructure {
  immediateDepth: number;      // XRP available at current price ±0.1%
  marketMakerResponse: number; // Additional liquidity from MM algorithms
  crossExchangeArb: number;    // Arbitrage flow from other exchanges
  derivativesFloat: number;    // Effective float reduction from derivatives
  leverageMultiplier: number;  // Amplification from leveraged demand
}

interface MarketPsychology {
  momentumFactor: number;      // Price move acceleration
  liquidityPanic: number;      // Liquidity withdrawal at extreme moves
  fomoBuying: number;         // Additional buying from price momentum
  whaleAlert: number;         // Market attention multiplier
}

interface SimulationResults {
  finalPrice: number;
  priceImpact: number;
  marketCapIncrease: number;
  effectiveMultiplier: number;
  executedAmount: number;
  averageExecutionPrice: number;
  slippagePercentage: number;
  syntheticDemand: number;
  microstructure: MarketMicrostructure;
  psychology: MarketPsychology;
  phases: {
    immediateImpact: number;
    derivativesAmplification: number;
    momentumAcceleration: number;
    finalImpact: number;
  };
}

export function useRealisticMarketSimulator({
  currentPrice,
  buyOrderSize,
  availableFloat,
  marketCap,
  derivativesData
}: RealisticMarketSimulatorProps): SimulationResults {
  
  return useMemo(() => {
    // PHASE 1: Realistic Market Microstructure with Exponential Liquidity Exhaustion
    const microstructure: MarketMicrostructure = {
      // Reduced immediate depth - more realistic for major order impact
      immediateDepth: availableFloat * 0.05, // Only 5% immediately available
      
      // Market maker response - more limited at extreme orders
      marketMakerResponse: availableFloat * 0.08, // 8% from algorithmic MM
      
      // Cross-exchange arbitrage - limited capacity
      crossExchangeArb: availableFloat * 0.12, // 12% from arb flows
      
      // Derivatives-driven float reduction - more aggressive impact
      derivativesFloat: derivativesData ? 
        Math.max(availableFloat * 0.4, availableFloat * (1 - (derivativesData.totalOpenInterest / (marketCap * 3)))) :
        availableFloat * 0.85, // Assume 15% reduction from derivatives even without data
      
      // Enhanced leverage multiplier - no caps for extreme scenarios
      leverageMultiplier: derivativesData ? 
        1 + Math.max(0.5, (derivativesData.weightedFundingRate * 20) + 
        (derivativesData.avgLongShortRatio > 0.6 ? (derivativesData.avgLongShortRatio - 0.5) * 2 : 0)) :
        1.3 // Higher base amplification
    };

    // PHASE 2: Enhanced derivatives amplification - remove caps for extreme scenarios
    const syntheticDemandMultiplier = derivativesData ? 
      1 + Math.max(0.5, Math.log10(Math.max(1, derivativesData.totalOpenInterest / 5000000000)) * 0.3) : 1.5;
    
    const effectiveFloat = microstructure.derivativesFloat * 
      (1 - Math.min(0.6, syntheticDemandMultiplier * 0.15)); // More aggressive float reduction

    // PHASE 3: Realistic Market Psychology - remove caps for extreme scenarios
    const orderValueUSD = buyOrderSize * currentPrice;
    const psychology: MarketPsychology = {
      // Enhanced momentum factor - exponential growth for large orders
      momentumFactor: orderValueUSD > 20000000 ? // > $20M triggers momentum
        1 + Math.pow(Math.log10(orderValueUSD / 20000000), 1.5) * 0.3 : 1,
      
      // Liquidity panic - more severe at lower thresholds
      liquidityPanic: orderValueUSD > 50000000 ? // > $50M causes panic
        0.6 + Math.exp(-orderValueUSD / 200000000) * 0.4 : 1,
      
      // FOMO buying - exponential for whale orders
      fomoBuying: orderValueUSD > 30000000 ? 
        1 + Math.pow(orderValueUSD / 100000000, 1.2) * 0.5 : 1,
      
      // Whale alert multiplier - stronger effects
      whaleAlert: orderValueUSD > 25000000 ? 
        1 + Math.log(orderValueUSD / 25000000) * 0.15 : 1
    };

    // PHASE 4: Realistic Simulation Execution
    let remainingOrder = buyOrderSize;
    let totalCost = 0;
    let currentPriceLevel = currentPrice;
    let liquidityConsumed = 0;

    // Phase 4.1: Immediate impact (consume immediate depth) - exponential for large orders
    const immediateExecution = Math.min(remainingOrder, microstructure.immediateDepth);
    if (immediateExecution > 0) {
      const depthRatio = immediateExecution / microstructure.immediateDepth;
      const immediateImpact = Math.pow(depthRatio, 1.5) * 0.002; // More aggressive immediate impact
      const executionPrice = currentPriceLevel * (1 + immediateImpact);
      totalCost += immediateExecution * (currentPriceLevel + executionPrice) / 2;
      liquidityConsumed += immediateExecution;
      remainingOrder -= immediateExecution;
      currentPriceLevel = executionPrice;
    }

    // Phase 4.2: Market maker response - steeper price curves
    if (remainingOrder > 0) {
      const mmExecution = Math.min(remainingOrder, microstructure.marketMakerResponse);
      if (mmExecution > 0) {
        // MMs provide liquidity but at exponentially higher prices
        const mmRatio = mmExecution / microstructure.marketMakerResponse;
        const mmPriceImpact = Math.pow(mmRatio, 1.3) * 0.008; // More aggressive MM pricing
        const executionPrice = currentPriceLevel * (1 + mmPriceImpact);
        totalCost += mmExecution * (currentPriceLevel + executionPrice) / 2;
        liquidityConsumed += mmExecution;
        remainingOrder -= mmExecution;
        currentPriceLevel = executionPrice;
      }
    }

    // Phase 4.3: Cross-exchange arbitrage - even steeper curves as liquidity thins
    if (remainingOrder > 0) {
      const arbExecution = Math.min(remainingOrder, microstructure.crossExchangeArb);
      if (arbExecution > 0) {
        // Arb provides liquidity but with exponential price discovery
        const arbRatio = arbExecution / microstructure.crossExchangeArb;
        const arbPriceImpact = Math.pow(arbRatio, 1.5) * 0.025; // Much steeper arbitrage impact
        const executionPrice = currentPriceLevel * (1 + arbPriceImpact);
        totalCost += arbExecution * (currentPriceLevel + executionPrice) / 2;
        liquidityConsumed += arbExecution;
        remainingOrder -= arbExecution;
        currentPriceLevel = executionPrice;
      }
    }

    // Phase 4.4: Liquidity exhaustion zone - extreme exponential impacts
    if (remainingOrder > 0) {
      const remainingFloat = Math.max(effectiveFloat * 0.05, effectiveFloat - liquidityConsumed);
      const exhaustionRatio = Math.min(remainingOrder / remainingFloat, 1);
      
      // Extreme exponential price impact - this is where multipliers explode
      let exhaustionImpact;
      if (exhaustionRatio > 0.8) {
        // Liquidity cliff - price discovery breaks down
        exhaustionImpact = Math.pow(exhaustionRatio, 3) * 0.5; // Up to 50% impact for full exhaustion
      } else if (exhaustionRatio > 0.5) {
        // Steep but manageable
        exhaustionImpact = Math.pow(exhaustionRatio, 2.5) * 0.25;
      } else {
        // Normal exponential scaling
        exhaustionImpact = Math.pow(exhaustionRatio, 2) * 0.1;
      }
      
      const executionPrice = currentPriceLevel * (1 + exhaustionImpact);
      totalCost += remainingOrder * (currentPriceLevel + executionPrice) / 2;
      liquidityConsumed += remainingOrder;
      currentPriceLevel = executionPrice;
      remainingOrder = 0;
    }

    // Apply amplification effects - no caps for extreme scenarios
    const derivativesAmplification = microstructure.leverageMultiplier * syntheticDemandMultiplier;
    currentPriceLevel *= derivativesAmplification;

    // Apply psychology factors - remove caps for realistic whale impact
    const psychologyMultiplier = psychology.momentumFactor * psychology.fomoBuying * psychology.whaleAlert;
    currentPriceLevel *= psychologyMultiplier;
    
    // Liquidity panic creates feedback loops
    if (psychology.liquidityPanic < 1) {
      const panicAmplification = 1 + (1 - psychology.liquidityPanic) * 0.8; // Stronger panic effects
      currentPriceLevel *= panicAmplification;
    }

    // Calculate final results with proper slippage calculation
    const finalPrice = currentPriceLevel;
    const priceImpact = ((finalPrice - currentPrice) / currentPrice) * 100;
    
    // Calculate weighted average execution price across all phases
    const averageExecutionPrice = liquidityConsumed > 0 ? totalCost / liquidityConsumed : currentPrice;
    
    // Slippage should reflect the difference between average execution and entry price
    const slippagePercentage = liquidityConsumed > 0 ? 
      ((averageExecutionPrice - currentPrice) / currentPrice) * 100 : 0;
    
    // Market cap calculations
    const totalSupply = marketCap / currentPrice; // Derive total supply
    const newMarketCap = totalSupply * finalPrice;
    const marketCapIncrease = newMarketCap - marketCap;
    // FIX: Correct effective multiplier calculation - should be market cap increase divided by order value
    const effectiveMultiplier = marketCapIncrease / orderValueUSD;

    return {
      finalPrice,
      priceImpact,
      marketCapIncrease,
      effectiveMultiplier,
      executedAmount: liquidityConsumed,
      averageExecutionPrice,
      slippagePercentage,
      syntheticDemand: buyOrderSize * (derivativesAmplification - 1),
      microstructure,
      psychology,
      phases: {
        immediateImpact: ((currentPrice * 1.002) - currentPrice) / currentPrice * 100,
        derivativesAmplification: (derivativesAmplification - 1) * 100,
        momentumAcceleration: (psychology.momentumFactor * psychology.fomoBuying - 1) * 100,
        finalImpact: priceImpact
      }
    };
  }, [currentPrice, buyOrderSize, availableFloat, marketCap, derivativesData]);
}