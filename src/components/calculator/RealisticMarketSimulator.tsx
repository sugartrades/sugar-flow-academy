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
  traditionalMultiplier: number;
  investmentEfficiency: number;
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
    console.log('🔄 Running market simulation with:', { currentPrice, buyOrderSize, availableFloat, marketCap });
    
    // ===================================================================
    // PHASE 1: MARKET MICROSTRUCTURE ANALYSIS
    // ===================================================================
    // This phase calculates the realistic liquidity layers available in the market.
    // Each layer represents different sources of liquidity that become available 
    // as the order executes and price moves.
    
    // Calculate float-dependent price impact scaling factor
    const floatScaling = Math.max(0.5, Math.min(2.0, 
      MARKET_SIMULATOR.PRICE_IMPACT.FLOAT_SCALING.IMPACT_AMPLIFIER * 
      Math.log(MARKET_SIMULATOR.PRICE_IMPACT.FLOAT_SCALING.MIN_FLOAT / Math.max(availableFloat, MARKET_SIMULATOR.PRICE_IMPACT.FLOAT_SCALING.MIN_FLOAT)) * 
      MARKET_SIMULATOR.PRICE_IMPACT.FLOAT_SCALING.LOG_DAMPENING + 1
    ));

    const microstructure: MarketMicrostructure = {
      /**
       * IMMEDIATE DEPTH: Realistic top-of-book liquidity with fixed base + float percentage
       * Uses a base amount plus a small percentage of float, capped at a maximum.
       * This creates realistic constraints where very large floats don't create
       * proportionally massive immediate depth.
       */
      immediateDepth: Math.min(
        MARKET_SIMULATOR.LIQUIDITY_TIERS.IMMEDIATE_DEPTH.BASE_AMOUNT + 
        (availableFloat * MARKET_SIMULATOR.LIQUIDITY_TIERS.IMMEDIATE_DEPTH.FLOAT_PERCENT),
        MARKET_SIMULATOR.LIQUIDITY_TIERS.IMMEDIATE_DEPTH.MAX_CAP
      ),
      
      /**
       * MARKET MAKER RESPONSE: Logarithmic scaling for algorithmic market makers
       * Uses base amount plus logarithmic scaling of float, capped at maximum.
       * This models how MM capacity grows sub-linearly with float size.
       */
      marketMakerResponse: Math.min(
        MARKET_SIMULATOR.LIQUIDITY_TIERS.MARKET_MAKER.BASE_AMOUNT + 
        (Math.log10(Math.max(1, availableFloat / 1000000000)) * MARKET_SIMULATOR.LIQUIDITY_TIERS.MARKET_MAKER.LOG_SCALING_FACTOR * availableFloat),
        MARKET_SIMULATOR.LIQUIDITY_TIERS.MARKET_MAKER.MAX_CAP
      ),
      
      /**
       * CROSS-EXCHANGE ARBITRAGE: Square root scaling for inter-exchange flows
       * Uses base amount plus square root scaling of float, capped at maximum.
       * This models how arbitrage capacity scales with float but with diminishing returns.
       */
      crossExchangeArb: Math.min(
        MARKET_SIMULATOR.LIQUIDITY_TIERS.CROSS_EXCHANGE.BASE_AMOUNT + 
        (Math.sqrt(availableFloat / 1000000000) * MARKET_SIMULATOR.LIQUIDITY_TIERS.CROSS_EXCHANGE.SQRT_SCALING_FACTOR * availableFloat),
        MARKET_SIMULATOR.LIQUIDITY_TIERS.CROSS_EXCHANGE.MAX_CAP
      ),
      
      /**
       * DERIVATIVES-DRIVEN FLOAT REDUCTION: Effective circulating supply reduction
       * Derivatives trading can effectively lock up underlying tokens through:
       * 1. Hedge positions requiring physical XRP
       * 2. Arbitrage strategies that remove XRP from circulation
       * 3. Market maker hedging of derivatives positions
       * Higher open interest = more XRP locked up = reduced effective float
       */
      derivativesFloat: derivativesData ? 
        Math.max(availableFloat * MARKET_SIMULATOR.DERIVATIVES_FLOAT_MULTIPLIER, 
        availableFloat * (1 - (derivativesData.totalOpenInterest / (marketCap * MARKET_SIMULATOR.DERIVATIVES_OI_DIVISOR)))) :
        availableFloat,
      
      /**
       * LEVERAGE MULTIPLIER: Amplification effect from leveraged market participants
       * Leveraged traders create outsized demand because they control larger positions
       * with smaller capital. This multiplier is influenced by:
       * 1. Funding rates: High funding rates indicate leveraged long demand
       * 2. Long/Short ratio: Skewed ratios amplify directional pressure
       * The multiplier is capped to prevent unrealistic amplification
       */
      leverageMultiplier: derivativesData ? 
        1 + Math.min(MARKET_SIMULATOR.LEVERAGE_MULTIPLIER.MAX_FUNDING_IMPACT, 
        (derivativesData.weightedFundingRate * MARKET_SIMULATOR.LEVERAGE_MULTIPLIER.FUNDING_MULTIPLIER) + 
        (derivativesData.avgLongShortRatio > MARKET_SIMULATOR.LEVERAGE_MULTIPLIER.RATIO_THRESHOLD ? 
        (derivativesData.avgLongShortRatio - 0.5) * MARKET_SIMULATOR.LEVERAGE_MULTIPLIER.RATIO_MULTIPLIER : 0)) :
        MARKET_SIMULATOR.LEVERAGE_MULTIPLIER.BASE
    };

    // ===================================================================
    // PHASE 2: DERIVATIVES AMPLIFICATION CALCULATION
    // ===================================================================
    // Conservative derivatives amplification based on open interest levels
    const syntheticDemandMultiplier = derivativesData ? 
      1 + Math.min(MARKET_SIMULATOR.SYNTHETIC_DEMAND.MAX_MULTIPLIER, 
      Math.log10(Math.max(1, derivativesData.totalOpenInterest / MARKET_SIMULATOR.SYNTHETIC_DEMAND.OI_THRESHOLD)) * MARKET_SIMULATOR.SYNTHETIC_DEMAND.LOG_MULTIPLIER) : 1.1;
    
    const effectiveFloat = microstructure.derivativesFloat * 
      (1 - Math.min(MARKET_SIMULATOR.SYNTHETIC_DEMAND.MAX_MULTIPLIER, syntheticDemandMultiplier * MARKET_SIMULATOR.EXECUTION.EFFECTIVE_FLOAT_REDUCTION));
    
    console.log('📊 Liquidity breakdown:', {
      availableFloat,
      derivativesFloat: microstructure.derivativesFloat,
      effectiveFloat,
      immediateDepth: microstructure.immediateDepth,
      marketMakerResponse: microstructure.marketMakerResponse,
      crossExchangeArb: microstructure.crossExchangeArb,
      totalLowImpactLiquidity: microstructure.immediateDepth + microstructure.marketMakerResponse + microstructure.crossExchangeArb,
      orderSize: buyOrderSize,
      orderSizeVsImmediateDepth: `${((buyOrderSize / microstructure.immediateDepth) * 100).toFixed(1)}%`
    });

    // ===================================================================
    // PHASE 3: MARKET PSYCHOLOGY SIMULATION
    // ===================================================================
    // This phase models the behavioral responses of market participants to large orders.
    // These psychological factors can significantly amplify or dampen price movements
    // beyond what pure supply/demand mechanics would suggest.
    
    const orderValueUSD = buyOrderSize * currentPrice;
    const psychology: MarketPsychology = {
      /**
       * MOMENTUM FACTOR: Price movement acceleration due to perceived trend
       * Large orders create the appearance of strong bullish momentum, which attracts
       * additional buyers who want to "ride the wave". This factor increases logarithmically
       * with order size to model how bigger orders create more noticeable momentum.
       * The logarithmic scaling prevents unrealistic exponential effects while still
       * capturing the psychological impact of increasingly large orders.
       */
      momentumFactor: orderValueUSD > MARKET_SIMULATOR.PSYCHOLOGY.MOMENTUM_THRESHOLD ? 
        1 + Math.min(MARKET_SIMULATOR.PSYCHOLOGY.MOMENTUM_MAX, 
        Math.log10(orderValueUSD / MARKET_SIMULATOR.PSYCHOLOGY.MOMENTUM_THRESHOLD) * MARKET_SIMULATOR.PSYCHOLOGY.MOMENTUM_MULTIPLIER) : 1,
      
      /**
       * LIQUIDITY PANIC FACTOR: Market maker and trader withdrawal during extreme moves
       * When very large orders appear, market makers and other liquidity providers
       * often step back from the market to avoid adverse selection. This creates
       * a "liquidity panic" where available liquidity shrinks, amplifying price impact.
       * The exponential decay models how panic intensity decreases with larger orders
       * (market participants become numb to size after a certain threshold).
       */
      liquidityPanic: orderValueUSD > MARKET_SIMULATOR.PSYCHOLOGY.LIQUIDITY_PANIC_THRESHOLD ? 
        MARKET_SIMULATOR.PSYCHOLOGY.LIQUIDITY_PANIC_BASE + 
        Math.exp(-orderValueUSD / MARKET_SIMULATOR.PSYCHOLOGY.LIQUIDITY_PANIC_DECAY) * 0.2 : 1,
      
      /**
       * FOMO BUYING FACTOR: Fear of Missing Out driven additional buying pressure
       * Large visible orders can trigger FOMO in retail and institutional traders who
       * interpret the order as a signal of upcoming price appreciation. This creates
       * additional buying pressure beyond the original order. The linear scaling with
       * a cap prevents unrealistic runaway effects while modeling real FOMO behavior.
       */
      fomoBuying: orderValueUSD > MARKET_SIMULATOR.PSYCHOLOGY.FOMO_THRESHOLD ? 
        Math.min(MARKET_SIMULATOR.PSYCHOLOGY.FOMO_MAX, 
        1 + (orderValueUSD / MARKET_SIMULATOR.PSYCHOLOGY.FOMO_DIVISOR) * 0.1) : 1,
      
      /**
       * WHALE ALERT MULTIPLIER: Market attention and follow-through from whale watching
       * Very large orders often trigger "whale alerts" on social media and trading platforms,
       * drawing additional market attention and trading activity. This multiplier models
       * the increased trading volume and price volatility that follows public awareness
       * of large transactions. Uses logarithmic scaling to model diminishing returns.
       */
      whaleAlert: orderValueUSD > MARKET_SIMULATOR.PSYCHOLOGY.WHALE_ALERT_THRESHOLD ? 
        1 + Math.min(MARKET_SIMULATOR.PSYCHOLOGY.WHALE_ALERT_MAX, 
        Math.log(orderValueUSD / MARKET_SIMULATOR.PSYCHOLOGY.WHALE_ALERT_THRESHOLD) * MARKET_SIMULATOR.PSYCHOLOGY.WHALE_ALERT_MULTIPLIER) : 1
    };

    // ===================================================================
    // PHASE 4: MULTI-PHASE REALISTIC SIMULATION EXECUTION
    // ===================================================================
    // This simulation models how a large order would actually execute in the market
    // by consuming liquidity in realistic phases, each with different characteristics
    // and price impact profiles. Real markets don't have infinite liquidity at any
    // price level - instead, liquidity comes in layers that become progressively
    // more expensive to access.
    
    let remainingOrder = buyOrderSize;
    let totalCost = 0;
    let currentPriceLevel = currentPrice;
    let liquidityConsumed = 0;

    // ===================================================================
    // PHASE 4.1: IMMEDIATE IMPACT - Consuming Top-of-Book Liquidity
    // ===================================================================
    // First, the order consumes the immediately available liquidity at or very near
    // the current market price. This represents limit orders sitting on the order book
    // within a few basis points of the last trade price. Price impact is minimal here
    // because we're trading at essentially the "market price".
    const immediateExecution = Math.min(remainingOrder, microstructure.immediateDepth);
    if (immediateExecution > 0) {
      const scaledImpactFactor = MARKET_SIMULATOR.PRICE_IMPACT.BASE_FACTORS.IMMEDIATE * floatScaling;
      const executionPrice = currentPriceLevel * (1 + (immediateExecution / microstructure.immediateDepth) * scaledImpactFactor);
      totalCost += immediateExecution * executionPrice;
      liquidityConsumed += immediateExecution;
      remainingOrder -= immediateExecution;
      currentPriceLevel = executionPrice;
    }

    // ===================================================================
    // PHASE 4.2: MARKET MAKER RESPONSE - Algorithmic Liquidity Provision
    // ===================================================================
    // After consuming immediate liquidity, market makers respond by providing additional
    // liquidity, but at progressively less favorable prices. Market makers use algorithms
    // that detect large orders and adjust their quotes accordingly - they provide liquidity
    // but charge a premium for the inventory risk they're taking on.
    if (remainingOrder > 0) {
      const mmExecution = Math.min(remainingOrder, microstructure.marketMakerResponse);
      if (mmExecution > 0) {
        // MMs provide liquidity but at progressively higher prices to compensate for risk
        const scaledImpactFactor = MARKET_SIMULATOR.PRICE_IMPACT.BASE_FACTORS.MARKET_MAKER * floatScaling;
        const mmPriceImpact = (mmExecution / microstructure.marketMakerResponse) * scaledImpactFactor;
        const executionPrice = currentPriceLevel * (1 + mmPriceImpact);
        totalCost += mmExecution * (currentPriceLevel + executionPrice) / 2; // Average price across the range
        liquidityConsumed += mmExecution;
        remainingOrder -= mmExecution;
        currentPriceLevel = executionPrice;
      }
    }

    // ===================================================================
    // PHASE 4.3: CROSS-EXCHANGE ARBITRAGE - Inter-Exchange Liquidity Flow
    // ===================================================================
    // When local liquidity is exhausted, arbitrageurs begin moving liquidity from other
    // exchanges. This process takes more time and involves additional costs (trading fees,
    // transfer costs, etc.), so arbitrageurs require a larger price discrepancy to make
    // it profitable. This phase provides substantial liquidity but at significantly worse prices.
    if (remainingOrder > 0) {
      const arbExecution = Math.min(remainingOrder, microstructure.crossExchangeArb);
      if (arbExecution > 0) {
        // Arbitrage provides more liquidity but requires larger price movements to be profitable
        const scaledImpactFactor = MARKET_SIMULATOR.PRICE_IMPACT.BASE_FACTORS.ARBITRAGE * floatScaling;
        const arbPriceImpact = (arbExecution / microstructure.crossExchangeArb) * scaledImpactFactor;
        const executionPrice = currentPriceLevel * (1 + arbPriceImpact);
        totalCost += arbExecution * (currentPriceLevel + executionPrice) / 2; // Average price across the range
        liquidityConsumed += arbExecution;
        remainingOrder -= arbExecution;
        currentPriceLevel = executionPrice;
      }
    }

    // ===================================================================
    // PHASE 4.4: LIQUIDITY EXHAUSTION - Exponential Price Impact Zone
    // ===================================================================
    // When all traditional liquidity sources are exhausted, we enter the "thin market" zone
    // where each additional unit purchased has an exponentially increasing price impact.
    // This models the reality that in illiquid conditions, small additional demand can
    // cause dramatic price swings. The exponential function captures how price impact
    // accelerates as available liquidity approaches zero.
    if (remainingOrder > 0) {
      const remainingFloat = Math.max(availableFloat * MARKET_SIMULATOR.EXECUTION.MIN_FLOAT_PERCENT, availableFloat - liquidityConsumed);
      const exhaustionRatio = Math.min(remainingOrder / remainingFloat, 1);
      
      // Enhanced exponential price impact when exhausting float - models thin market conditions
      const baseExhaustionImpact = MARKET_SIMULATOR.PRICE_IMPACT.BASE_FACTORS.EXHAUSTION_BASE * floatScaling;
      const exhaustionImpact = Math.pow(exhaustionRatio, MARKET_SIMULATOR.PRICE_IMPACT.EXHAUSTION.POWER) * 
        Math.min(MARKET_SIMULATOR.PRICE_IMPACT.EXHAUSTION.MAX_IMPACT, baseExhaustionImpact * (1 + exhaustionRatio));
      const executionPrice = currentPriceLevel * (1 + exhaustionImpact);
      
      // Cost increases dramatically as we exhaust available liquidity
      totalCost += remainingOrder * (currentPriceLevel + executionPrice) / 2;
      liquidityConsumed += remainingOrder;
      currentPriceLevel = executionPrice;
      remainingOrder = 0;
    }

    console.log('⚡ Execution phases:', {
      immediateExecution,
      mmExecution: (buyOrderSize - remainingOrder - immediateExecution > 0) ? Math.min(buyOrderSize - immediateExecution, microstructure.marketMakerResponse) : 0,
      arbExecution: remainingOrder > 0 ? Math.min(remainingOrder, microstructure.crossExchangeArb) : 0,
      exhaustionExecution: remainingOrder,
      floatScaling,
      liquidityTierSizes: {
        immediate: microstructure.immediateDepth,
        marketMaker: microstructure.marketMakerResponse,
        arbitrage: microstructure.crossExchangeArb
      },
      finalPriceImpact: ((currentPriceLevel - currentPrice) / currentPrice) * 100
    });

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
    
    // Calculate traditional multiplier: market cap increase per XRP order size
    // This shows how much market cap increase results from each XRP token bought
    const traditionalMultiplier = buyOrderSize > 0 ? marketCapIncrease / (buyOrderSize * currentPrice) : 0;
    
    // Calculate investment efficiency: market cap increase per dollar spent
    // This shows how efficiently your investment dollars are converted to market cap
    const investmentAmount = buyOrderSize * averageExecutionPrice;
    const investmentEfficiency = investmentAmount > 0 ? marketCapIncrease / investmentAmount : 0;
    
    // Keep legacy effectiveMultiplier as investmentEfficiency for backwards compatibility
    const effectiveMultiplier = investmentEfficiency;

    return {
      finalPrice,
      priceImpact,
      marketCapIncrease,
      effectiveMultiplier,
      traditionalMultiplier,
      investmentEfficiency,
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