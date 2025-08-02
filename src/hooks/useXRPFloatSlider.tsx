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
    const totalFloat = floatBillions * 1000000000; // Convert to actual XRP count
    
    // Generate order book levels from current price upward
    for (let price = currentPrice; price <= Math.min(currentPrice * 10, 1000); price += 0.01) {
      // Calculate distance from current price as percentage
      const priceDistance = (price - currentPrice) / currentPrice;
      
      // Exponentially decreasing liquidity based on price distance and total float
      const baseSize = totalFloat * 0.001 * Math.exp(-priceDistance * 15);
      
      // Use deterministic variance based on price for consistency
      const priceVariance = 0.8 + (0.4 * Math.sin(price * 100)); // Deterministic but varied
      const size = Math.max(1000, baseSize * priceVariance); // Minimum 1000 XRP per level
      
      cumulative += size;
      
      levels.push({
        price: Number(price.toFixed(4)),
        size,
        cumulative
      });
      
      // Stop if we've distributed enough of the float or reached reasonable limits
      if (cumulative > totalFloat * 0.1 || levels.length > 10000) break;
      
      // Increase step size for higher prices for better performance
      if (price > currentPrice * 2) price += 0.04;
      if (price > currentPrice * 5) price += 0.20;
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
