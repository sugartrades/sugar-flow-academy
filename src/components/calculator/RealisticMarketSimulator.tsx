import React, { useMemo } from 'react';
import { AggregatedDerivatives } from '@/hooks/useDerivativesData';
import { MARKET_SIMULATOR } from '@/config/constants';

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
      // Conservative immediate depth
      immediateDepth: availableFloat * MARKET_SIMULATOR.IMMEDIATE_DEPTH_PERCENT,
      
      // Market maker response
      marketMakerResponse: availableFloat * MARKET_SIMULATOR.MARKET_MAKER_RESPONSE_PERCENT,
      
      // Cross-exchange arbitrage
      crossExchangeArb: availableFloat * MARKET_SIMULATOR.CROSS_EXCHANGE_ARB_PERCENT,
      
      // Derivatives-driven float reduction
      derivativesFloat: derivativesData ? 
        Math.max(availableFloat * MARKET_SIMULATOR.DERIVATIVES_FLOAT_MULTIPLIER, 
        availableFloat * (1 - (derivativesData.totalOpenInterest / (marketCap * MARKET_SIMULATOR.DERIVATIVES_OI_DIVISOR)))) :
        availableFloat,
      
      // Conservative leverage multiplier
      leverageMultiplier: derivativesData ? 
        1 + Math.min(MARKET_SIMULATOR.LEVERAGE_MULTIPLIER.MAX_FUNDING_IMPACT, 
        (derivativesData.weightedFundingRate * MARKET_SIMULATOR.LEVERAGE_MULTIPLIER.FUNDING_MULTIPLIER) + 
        (derivativesData.avgLongShortRatio > MARKET_SIMULATOR.LEVERAGE_MULTIPLIER.RATIO_THRESHOLD ? 
        (derivativesData.avgLongShortRatio - 0.5) * MARKET_SIMULATOR.LEVERAGE_MULTIPLIER.RATIO_MULTIPLIER : 0)) :
        MARKET_SIMULATOR.LEVERAGE_MULTIPLIER.BASE
    };

    // PHASE 2: Conservative derivatives amplification
    const syntheticDemandMultiplier = derivativesData ? 
      1 + Math.min(MARKET_SIMULATOR.SYNTHETIC_DEMAND.MAX_MULTIPLIER, 
      Math.log10(Math.max(1, derivativesData.totalOpenInterest / MARKET_SIMULATOR.SYNTHETIC_DEMAND.OI_THRESHOLD)) * MARKET_SIMULATOR.SYNTHETIC_DEMAND.LOG_MULTIPLIER) : 1.1;
    
    const effectiveFloat = microstructure.derivativesFloat * 
      (1 - Math.min(MARKET_SIMULATOR.SYNTHETIC_DEMAND.MAX_MULTIPLIER, syntheticDemandMultiplier * MARKET_SIMULATOR.EXECUTION.EFFECTIVE_FLOAT_REDUCTION));

    // PHASE 3: Market Psychology Simulation
    const orderValueUSD = buyOrderSize * currentPrice;
    const psychology: MarketPsychology = {
      // Conservative momentum factor
      momentumFactor: orderValueUSD > MARKET_SIMULATOR.PSYCHOLOGY.MOMENTUM_THRESHOLD ? 
        1 + Math.min(MARKET_SIMULATOR.PSYCHOLOGY.MOMENTUM_MAX, 
        Math.log10(orderValueUSD / MARKET_SIMULATOR.PSYCHOLOGY.MOMENTUM_THRESHOLD) * MARKET_SIMULATOR.PSYCHOLOGY.MOMENTUM_MULTIPLIER) : 1,
      
      // Conservative liquidity panic
      liquidityPanic: orderValueUSD > MARKET_SIMULATOR.PSYCHOLOGY.LIQUIDITY_PANIC_THRESHOLD ? 
        MARKET_SIMULATOR.PSYCHOLOGY.LIQUIDITY_PANIC_BASE + 
        Math.exp(-orderValueUSD / MARKET_SIMULATOR.PSYCHOLOGY.LIQUIDITY_PANIC_DECAY) * 0.2 : 1,
      
      // Conservative FOMO buying
      fomoBuying: orderValueUSD > MARKET_SIMULATOR.PSYCHOLOGY.FOMO_THRESHOLD ? 
        Math.min(MARKET_SIMULATOR.PSYCHOLOGY.FOMO_MAX, 
        1 + (orderValueUSD / MARKET_SIMULATOR.PSYCHOLOGY.FOMO_DIVISOR) * 0.1) : 1,
      
      // Conservative whale alert multiplier
      whaleAlert: orderValueUSD > MARKET_SIMULATOR.PSYCHOLOGY.WHALE_ALERT_THRESHOLD ? 
        1 + Math.min(MARKET_SIMULATOR.PSYCHOLOGY.WHALE_ALERT_MAX, 
        Math.log(orderValueUSD / MARKET_SIMULATOR.PSYCHOLOGY.WHALE_ALERT_THRESHOLD) * MARKET_SIMULATOR.PSYCHOLOGY.WHALE_ALERT_MULTIPLIER) : 1
    };

    // PHASE 4: Realistic Simulation Execution
    let remainingOrder = buyOrderSize;
    let totalCost = 0;
    let currentPriceLevel = currentPrice;
    let liquidityConsumed = 0;

    // Phase 4.1: Immediate impact (consume immediate depth)
    const immediateExecution = Math.min(remainingOrder, microstructure.immediateDepth);
    if (immediateExecution > 0) {
      const executionPrice = currentPriceLevel * (1 + (immediateExecution / microstructure.immediateDepth) * MARKET_SIMULATOR.PRICE_IMPACT.IMMEDIATE_FACTOR);
      totalCost += immediateExecution * executionPrice;
      liquidityConsumed += immediateExecution;
      remainingOrder -= immediateExecution;
      currentPriceLevel = executionPrice;
    }

    // Phase 4.2: Market maker response
    if (remainingOrder > 0) {
      const mmExecution = Math.min(remainingOrder, microstructure.marketMakerResponse);
      if (mmExecution > 0) {
        // MMs provide liquidity but at progressively higher prices
        const mmPriceImpact = (mmExecution / microstructure.marketMakerResponse) * MARKET_SIMULATOR.PRICE_IMPACT.MARKET_MAKER_FACTOR;
        const executionPrice = currentPriceLevel * (1 + mmPriceImpact);
        totalCost += mmExecution * (currentPriceLevel + executionPrice) / 2; // Average price across the range
        liquidityConsumed += mmExecution;
        remainingOrder -= mmExecution;
        currentPriceLevel = executionPrice;
      }
    }

    // Phase 4.3: Cross-exchange arbitrage kicks in
    if (remainingOrder > 0) {
      const arbExecution = Math.min(remainingOrder, microstructure.crossExchangeArb);
      if (arbExecution > 0) {
        // Arb provides more liquidity but prices move more significantly
        const arbPriceImpact = (arbExecution / microstructure.crossExchangeArb) * MARKET_SIMULATOR.PRICE_IMPACT.ARBITRAGE_FACTOR;
        const executionPrice = currentPriceLevel * (1 + arbPriceImpact);
        totalCost += arbExecution * (currentPriceLevel + executionPrice) / 2; // Average price across the range
        liquidityConsumed += arbExecution;
        remainingOrder -= arbExecution;
        currentPriceLevel = executionPrice;
      }
    }

    // Phase 4.4: Exhausted traditional liquidity - exponential impact zone
    if (remainingOrder > 0) {
      const remainingFloat = Math.max(effectiveFloat * MARKET_SIMULATOR.EXECUTION.MIN_FLOAT_PERCENT, effectiveFloat - liquidityConsumed);
      const exhaustionRatio = Math.min(remainingOrder / remainingFloat, 1);
      
      // Exponential price impact when exhausting float
      const exhaustionImpact = Math.pow(exhaustionRatio, MARKET_SIMULATOR.PRICE_IMPACT.EXHAUSTION_POWER) * MARKET_SIMULATOR.PRICE_IMPACT.EXHAUSTION_MAX;
      const executionPrice = currentPriceLevel * (1 + exhaustionImpact);
      
      // Cost increases dramatically as we exhaust liquidity
      totalCost += remainingOrder * (currentPriceLevel + executionPrice) / 2;
      liquidityConsumed += remainingOrder;
      currentPriceLevel = executionPrice;
      remainingOrder = 0;
    }

    // Apply amplification effects conservatively
    const derivativesAmplification = Math.min(MARKET_SIMULATOR.AMPLIFICATION.DERIVATIVES_MAX, 
      microstructure.leverageMultiplier * syntheticDemandMultiplier);
    currentPriceLevel *= derivativesAmplification;

    // Apply psychology factors conservatively
    currentPriceLevel *= Math.min(MARKET_SIMULATOR.AMPLIFICATION.PSYCHOLOGY_MAX, 
      psychology.momentumFactor * psychology.fomoBuying * psychology.whaleAlert);
    
    // Adjust for liquidity panic conservatively
    if (psychology.liquidityPanic < 1) {
      const panicAmplification = 1 + (1 - psychology.liquidityPanic) * MARKET_SIMULATOR.AMPLIFICATION.PANIC_MAX;
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
        immediateImpact: ((currentPrice * (1 + MARKET_SIMULATOR.PRICE_IMPACT.CALIBRATION_FACTOR)) - currentPrice) / currentPrice * 100,
        derivativesAmplification: (derivativesAmplification - 1) * 100,
        momentumAcceleration: (psychology.momentumFactor * psychology.fomoBuying - 1) * 100,
        finalImpact: priceImpact
      }
    };
  }, [currentPrice, buyOrderSize, availableFloat, marketCap, derivativesData]);
}