import { useState, useCallback } from 'react';

export interface UseXRPFloatSliderReturn {
  xrpFloat: number;
  setXrpFloat: (value: number) => void;
  formatFloat: (value: number) => string;
  generateSyntheticOrderBook: (currentPrice: number, xrpFloat: number) => Array<{
    price: number;
    size: number;
    cumulative: number;
  }>;
}

export function useXRPFloatSlider(): UseXRPFloatSliderReturn {
  const [xrpFloat, setXrpFloatState] = useState(15); // Default to 15 billion XRP

  const setXrpFloat = useCallback((value: number) => {
    setXrpFloatState(value);
  }, []);

  const formatFloat = useCallback((value: number): string => {
    if (value >= 1) {
      return `${value.toFixed(1)}B`;
    } else {
      return `${(value * 1000).toFixed(0)}M`;
    }
  }, []);

  const generateSyntheticOrderBook = useCallback((currentPrice: number, floatBillions: number) => {
    const levels: Array<{ price: number; size: number; cumulative: number }> = [];
    let cumulative = 0;
    
    // Convert billions to actual XRP amount
    const totalFloat = floatBillions * 1000000000;
    
    // Psychological resistance levels where major liquidity pools exist
    const psychologicalLevels = [1, 2, 3, 5, 10, 20, 50, 100];
    
    // Generate order book levels from current price upward with realistic ranges
    const maxPrice = Math.min(currentPrice * 50, 1000); // Extend range to 50x for large orders
    let stepSize = 0.001; // Start with smaller steps for precision
    
    for (let price = currentPrice; price <= maxPrice; price += stepSize) {
      const priceDistance = (price - currentPrice) / currentPrice;
      
      // More gradual exponential decay (factor of 6 instead of 15)
      let baseSize = totalFloat * 0.0025 * Math.exp(-priceDistance * 6);
      
      // Add concentrated liquidity at psychological levels
      const nearPsychLevel = psychologicalLevels.find(level => 
        Math.abs(price - level) / level < 0.02 // Within 2% of psychological level
      );
      
      if (nearPsychLevel) {
        // 3x more liquidity at psychological resistance levels
        baseSize *= 3;
      }
      
      // Add market maker clustering near current price (within 5%)
      if (priceDistance < 0.05) {
        baseSize *= 2; // Double liquidity for market makers near spot
      }
      
      // Deterministic variance for consistency
      const priceVariance = 0.7 + (0.6 * Math.sin(price * 50));
      const size = Math.max(5000, baseSize * priceVariance); // Higher minimum for realism
      
      cumulative += size;
      
      levels.push({
        price: Number(price.toFixed(4)),
        size,
        cumulative
      });
      
      // Distribute 25% of float instead of 10% for deeper liquidity
      if (cumulative > totalFloat * 0.25 || levels.length > 15000) break;
      
      // Dynamic step sizing for efficiency
      if (price > currentPrice * 1.5) stepSize = 0.005;
      if (price > currentPrice * 3) stepSize = 0.01;
      if (price > currentPrice * 10) stepSize = 0.05;
      if (price > currentPrice * 25) stepSize = 0.1;
    }
    
    return levels;
  }, []);

  return {
    xrpFloat,
    setXrpFloat,
    formatFloat,
    generateSyntheticOrderBook
  };
}
