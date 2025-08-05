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
    // PHASE 1: Realistic Market Microstructure
    const microstructure: MarketMicrostructure = {
      // Much more conservative immediate depth (5-10% of float at tight spreads)
      immediateDepth: availableFloat * 0.08, // 8% immediately available
      
      // Market maker response (provides additional 15% of float)
      marketMakerResponse: availableFloat * 0.15, // 15% from algorithmic MM
      
      // Cross-exchange arbitrage (another 20% from major exchanges)
      crossExchangeArb: availableFloat * 0.20, // 20% from arb flows
      
      // Derivatives-driven float reduction (much more conservative)
      derivativesFloat: derivativesData ? 
        Math.max(availableFloat * 0.7, availableFloat * (1 - (derivativesData.totalOpenInterest / (marketCap * 10)))) :
        availableFloat,
      
      // Much more conservative leverage multiplier
      leverageMultiplier: derivativesData ? 
        1 + Math.min(0.3, (derivativesData.weightedFundingRate * 10) + 
        (derivativesData.avgLongShortRatio > 0.6 ? (derivativesData.avgLongShortRatio - 0.5) * 0.5 : 0)) :
        1.05 // Very modest 5% base amplification
    };

    // PHASE 2: Much more conservative derivatives amplification
    const syntheticDemandMultiplier = derivativesData ? 
      1 + Math.min(0.2, Math.log10(Math.max(1, derivativesData.totalOpenInterest / 10000000000)) * 0.1) : 1.1;
    
    const effectiveFloat = microstructure.derivativesFloat * 
      (1 - Math.min(0.2, syntheticDemandMultiplier * 0.05));

    // PHASE 3: Market Psychology Simulation
    const orderValueUSD = buyOrderSize * currentPrice;
    const psychology: MarketPsychology = {
      // Much more conservative momentum factor
      momentumFactor: orderValueUSD > 50000000 ? // > $50M triggers momentum
        1 + Math.min(0.15, Math.log10(orderValueUSD / 50000000) * 0.05) : 1,
      
      // Conservative liquidity panic
      liquidityPanic: orderValueUSD > 200000000 ? // > $200M causes panic
        0.8 + Math.exp(-orderValueUSD / 500000000) * 0.2 : 1,
      
      // Very conservative FOMO buying
      fomoBuying: orderValueUSD > 100000000 ? 
        Math.min(1.2, 1 + (orderValueUSD / 500000000) * 0.1) : 1,
      
      // Conservative whale alert multiplier
      whaleAlert: orderValueUSD > 50000000 ? 
        1 + Math.min(0.1, Math.log(orderValueUSD / 50000000) * 0.02) : 1
    };

    // PHASE 4: Realistic Simulation Execution
    let remainingOrder = buyOrderSize;
    let totalCost = 0;
    let currentPriceLevel = currentPrice;
    let liquidityConsumed = 0;

    // Phase 4.1: Immediate impact (consume immediate depth)
    const immediateExecution = Math.min(remainingOrder, microstructure.immediateDepth);
      if (immediateExecution > 0) {
        totalCost += immediateExecution * currentPriceLevel;
        liquidityConsumed += immediateExecution;
        remainingOrder -= immediateExecution;
        // Very minimal price impact for immediate depth
        currentPriceLevel *= 1 + (immediateExecution / microstructure.immediateDepth) * 0.0005;
      }

    // Phase 4.2: Market maker response
    if (remainingOrder > 0) {
      const mmExecution = Math.min(remainingOrder, microstructure.marketMakerResponse);
      if (mmExecution > 0) {
        // MMs provide liquidity but at higher prices
        const mmPriceImpact = (mmExecution / microstructure.marketMakerResponse) * 0.003;
        currentPriceLevel *= (1 + mmPriceImpact);
        totalCost += mmExecution * currentPriceLevel;
        liquidityConsumed += mmExecution;
        remainingOrder -= mmExecution;
      }
    }

    // Phase 4.3: Cross-exchange arbitrage kicks in
    if (remainingOrder > 0) {
      const arbExecution = Math.min(remainingOrder, microstructure.crossExchangeArb);
      if (arbExecution > 0) {
        // Arb provides more liquidity but prices start moving significantly
        const arbPriceImpact = (arbExecution / microstructure.crossExchangeArb) * 0.008;
        currentPriceLevel *= (1 + arbPriceImpact);
        totalCost += arbExecution * currentPriceLevel;
        liquidityConsumed += arbExecution;
        remainingOrder -= arbExecution;
      }
    }

    // Phase 4.4: Exhausted traditional liquidity - derivatives amplification
    if (remainingOrder > 0) {
      // Now we're in the exponential impact zone
      const remainingFloat = Math.max(effectiveFloat * 0.1, effectiveFloat - liquidityConsumed);
      const exhaustionRatio = Math.min(remainingOrder / remainingFloat, 1);
      
      // Exponential price impact when exhausting float
      const exhaustionImpact = Math.pow(exhaustionRatio, 1.2) * 0.05; // Much more conservative
      currentPriceLevel *= (1 + exhaustionImpact);
      
      totalCost += remainingOrder * currentPriceLevel;
      liquidityConsumed += remainingOrder;
      remainingOrder = 0;
    }

    // Apply amplification effects much more conservatively
    const derivativesAmplification = Math.min(1.5, microstructure.leverageMultiplier * syntheticDemandMultiplier);
    currentPriceLevel *= derivativesAmplification;

    // Apply psychology factors conservatively
    currentPriceLevel *= Math.min(1.3, psychology.momentumFactor * psychology.fomoBuying * psychology.whaleAlert);
    
    // Adjust for liquidity panic more conservatively
    if (psychology.liquidityPanic < 1) {
      const panicAmplification = 1 + (1 - psychology.liquidityPanic) * 0.1; // Much smaller effect
      currentPriceLevel *= panicAmplification;
    }

    // Calculate final results
    const finalPrice = currentPriceLevel;
    const priceImpact = ((finalPrice - currentPrice) / currentPrice) * 100;
    const averageExecutionPrice = liquidityConsumed > 0 ? totalCost / liquidityConsumed : currentPrice;
    const slippagePercentage = ((averageExecutionPrice - currentPrice) / currentPrice) * 100;
    
    // Market cap calculations
    const totalSupply = marketCap / currentPrice; // Derive total supply
    const newMarketCap = totalSupply * finalPrice;
    const marketCapIncrease = newMarketCap - marketCap;
    const effectiveMultiplier = newMarketCap / marketCap;

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