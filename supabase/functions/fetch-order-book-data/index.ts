import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderBookLevel {
  price: number;
  size: number;
}

interface ExchangeOrderBookData {
  exchange: string;
  orderBook: {
    asks: OrderBookLevel[];
    bids: OrderBookLevel[];
  };
  currentPrice: number;
  xrpFloat: number;
  timestamp: string;
}

interface OrderBookResponse {
  exchanges: ExchangeOrderBookData[];
  aggregatedFloat: number;
  averageFloat: number;
  lastUpdated: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching order book data for XRP/USDT from multiple exchanges...');

    // Import CCXT dynamically
    const ccxt = await import('https://esm.sh/ccxt@4.1.77');

    const exchanges = [
      { name: 'binance', exchange: new ccxt.binance({ enableRateLimit: true }) },
      { name: 'coinbasepro', exchange: new ccxt.coinbasepro({ enableRateLimit: true }) },
      { name: 'kraken', exchange: new ccxt.kraken({ enableRateLimit: true }) }
    ];

    const symbol = 'XRP/USDT';
    const exchangeData: ExchangeOrderBookData[] = [];
    let totalFloat = 0;
    let successfulExchanges = 0;

    for (const { name, exchange } of exchanges) {
      try {
        console.log(`Fetching order book from ${name}...`);
        
        // Fetch order book with limit of 100 levels
        const orderBook = await exchange.fetchOrderBook(symbol, 100);
        
        // Get current price (midpoint of best bid/ask)
        const bestBid = orderBook.bids.length > 0 ? orderBook.bids[0][0] : 0;
        const bestAsk = orderBook.asks.length > 0 ? orderBook.asks[0][0] : 0;
        const currentPrice = (bestBid + bestAsk) / 2;

        if (currentPrice <= 0) {
          console.warn(`Invalid price data from ${name}, skipping...`);
          continue;
        }

        // Calculate XRP Float: total XRP available up to 5% above current price
        const priceThreshold = currentPrice * 1.05; // 5% above current price
        let xrpFloat = 0;

        // Sum up all ask orders (sell orders) up to the price threshold
        for (const [price, amount] of orderBook.asks) {
          if (price <= priceThreshold) {
            xrpFloat += amount;
          } else {
            break; // Order book is sorted by price, so we can break here
          }
        }

        // Convert order book format
        const formattedOrderBook = {
          asks: orderBook.asks.slice(0, 50).map(([price, amount]) => ({
            price: Number(price),
            size: Number(amount)
          })),
          bids: orderBook.bids.slice(0, 50).map(([price, amount]) => ({
            price: Number(price),
            size: Number(amount)
          }))
        };

        exchangeData.push({
          exchange: name,
          orderBook: formattedOrderBook,
          currentPrice: currentPrice,
          xrpFloat: xrpFloat,
          timestamp: new Date().toISOString()
        });

        totalFloat += xrpFloat;
        successfulExchanges++;

        console.log(`${name}: Current price: $${currentPrice.toFixed(4)}, XRP Float: ${xrpFloat.toLocaleString()} XRP`);

      } catch (error) {
        console.error(`Error fetching data from ${name}:`, error.message);
        // Continue with other exchanges even if one fails
      }
    }

    if (successfulExchanges === 0) {
      throw new Error('Failed to fetch data from any exchange');
    }

    const averageFloat = totalFloat / successfulExchanges;

    const response: OrderBookResponse = {
      exchanges: exchangeData,
      aggregatedFloat: totalFloat,
      averageFloat: averageFloat,
      lastUpdated: new Date().toISOString()
    };

    console.log(`Order book data fetched successfully from ${successfulExchanges} exchanges`);
    console.log(`Aggregated XRP Float: ${totalFloat.toLocaleString()} XRP`);
    console.log(`Average XRP Float: ${averageFloat.toLocaleString()} XRP`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fetch-order-book-data function:', error);
    
    // Return fallback data structure
    const fallbackResponse: OrderBookResponse = {
      exchanges: [],
      aggregatedFloat: 0,
      averageFloat: 0,
      lastUpdated: new Date().toISOString(),
    };

    return new Response(JSON.stringify({
      ...fallbackResponse,
      error: error.message,
      usingFallback: true
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});