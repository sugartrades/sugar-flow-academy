
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CryptoData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
  sentiment: string;
}

interface CoinglassLiquidationResponse {
  code: string;
  msg: string;
  data: {
    totalLiquidation: number;
    totalLong: number;
    totalShort: number;
    dataMap: {
      [exchange: string]: {
        long: number;
        short: number;
        total: number;
      };
    };
  };
}

interface CryptolDataWithLiquidations extends CryptoData {
  liquidations?: {
    total24h: number;
    long24h: number;
    short24h: number;
    exchanges: string[];
  };
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Simple in-memory cache
let cachedData: any = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes cache (reduced for faster updates)

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const now = Date.now();
    
    // Force cache clear for new data source - remove this after first deployment
    if (cachedData && cachedData.dataSource && !cachedData.dataSource.includes('binance')) {
      console.log('Clearing old CoinGecko cache to switch to Binance data source');
      cachedData = null;
      cacheTimestamp = 0;
    }
    
    // Check if we have valid cached data
    if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('Returning cached market data, age:', Math.floor((now - cacheTimestamp) / 1000), 'seconds');
      return new Response(JSON.stringify({
        ...cachedData,
        fromCache: true,
        cacheAge: Math.floor((now - cacheTimestamp) / 1000)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Cache miss or expired, fetching fresh data...');
    
    // Check if Coinglass API key is available for XRP data
    const coinglassApiKey = Deno.env.get('COINGLASS_API_KEY');
    let dataSource = 'binance';
    let xrpFromCoinglass = null;
    
    // Try to fetch XRP liquidation data from Coinglass (available in Hobbyist tier)
    let xrpLiquidations = null;
    if (coinglassApiKey) {
      try {
        console.log('Attempting to fetch XRP liquidation data from Coinglass...');
        // Use liquidation endpoint with proper parameters
        const liquidationResponse = await fetch(
          'https://open-api.coinglass.com/public/v2/liquidation?symbol=XRP&time_type=1',
          {
            method: 'GET',
            headers: {
              'CG-API-KEY': coinglassApiKey,
              'Accept': 'application/json'
            }
          }
        );

        if (liquidationResponse.ok) {
          const liquidationText = await liquidationResponse.text();
          console.log('Coinglass liquidation raw response:', liquidationText);
          
          const liquidationData = JSON.parse(liquidationText) as CoinglassLiquidationResponse;
          console.log('Coinglass liquidation parsed data:', liquidationData);
          
          if (liquidationData.code === "0" && liquidationData.data) {
            // Extract liquidation data from the response
            const data = liquidationData.data;
            const dataMap = data.dataMap;
            const exchanges = Object.keys(dataMap);
            
            xrpLiquidations = {
              total24h: data.totalLiquidation || 0,
              long24h: data.totalLong || 0,
              short24h: data.totalShort || 0,
              exchanges: exchanges
            };
            
            dataSource = 'binance+coinglass';
            console.log('Successfully fetched XRP liquidation data from Coinglass:', xrpLiquidations);
          } else {
            console.log('Coinglass liquidation API response indicates failure or no data. Code:', liquidationData.code, 'Message:', liquidationData.msg);
            if (liquidationData.msg?.includes('Upgrade plan')) {
              console.log('Coinglass API key has insufficient permissions for liquidation data');
            }
          }
        } else {
          const errorText = await liquidationResponse.text();
          console.log('Coinglass liquidation API request failed with status:', liquidationResponse.status, 'Response:', errorText);
          if (liquidationResponse.status === 402 || errorText.includes('Upgrade plan')) {
            console.log('Current Coinglass subscription tier does not support liquidation historical data');
          }
        }
      } catch (error) {
        console.log('Failed to fetch liquidation data from Coinglass:', error.message);
      }
    }
    
    // Add delay to help with rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Fetch XRP data from Binance Public API (more reliable and free)
    const binanceResponse = await fetch(
      'https://api.binance.com/api/v3/ticker/24hr?symbol=XRPUSDT',
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SugarTrades/1.0'
        },
      }
    );

    if (!binanceResponse.ok) {
      // If we have cached data, return it even if expired
      if (cachedData) {
        console.log('Binance API failed but returning stale cached data');
        return new Response(JSON.stringify({
          ...cachedData,
          fromCache: true,
          stale: true,
          error: `Binance API Error: ${binanceResponse.status}`,
          cacheAge: Math.floor((now - cacheTimestamp) / 1000)
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`Binance API error: ${binanceResponse.status}`);
    }

    const binanceData = await binanceResponse.json();
    console.log('Binance XRP response:', binanceData);

    const cryptos: CryptolDataWithLiquidations[] = [];

    // Process XRP data from Binance API
    if (binanceData && binanceData.symbol === 'XRPUSDT') {
      const price = parseFloat(binanceData.lastPrice);
      const change24h = parseFloat(binanceData.priceChangePercent);
      
      // Estimate market cap (approximate XRP circulating supply: ~59 billion)
      const estimatedCirculatingSupply = 59000000000;
      const marketCap = price * estimatedCirculatingSupply;
      
      const sentiment = getSentiment(change24h);
      const xrpData: CryptolDataWithLiquidations = {
        symbol: 'XRP',
        name: 'XRP',
        price: price,
        change24h: change24h,
        marketCap: marketCap,
        sentiment
      };
      
      // Add liquidation data if available from Coinglass
      if (xrpLiquidations) {
        xrpData.liquidations = xrpLiquidations;
      }
      
      cryptos.push(xrpData);
      
      // Update data source
      dataSource = xrpLiquidations ? 'binance+coinglass' : 'binance';
      
      console.log('Successfully processed XRP data from Binance:', xrpData);
    }

    if (cryptos.length === 0) {
      throw new Error('No cryptocurrency data found in response');
    }

    const marketData = {
      cryptos,
      lastUpdated: new Date().toISOString(),
      dataSource: dataSource
    };

    // Cache the successful response
    cachedData = marketData;
    cacheTimestamp = now;

    console.log('Returning fresh market data and caching it');

    return new Response(JSON.stringify(marketData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fetch-market-data function:', error);
    
    // If we have cached data, return it even if stale
    if (cachedData) {
      const now = Date.now();
      console.log('Returning stale cached data due to API error');
      return new Response(JSON.stringify({
        ...cachedData,
        fromCache: true,
        stale: true,
        error: `API Error: ${error.message}`,
        cacheAge: Math.floor((now - cacheTimestamp) / 1000)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Return a successful response with fallback data instead of a 500 error
    const fallbackData = {
      cryptos: [
        {
          symbol: 'BTC',
          name: 'Bitcoin',
          price: 42000,
          change24h: 0,
          marketCap: 800000000000,
          sentiment: 'Neutral'
        },
        {
          symbol: 'ETH',
          name: 'Ethereum',
          price: 2500,
          change24h: 0,
          marketCap: 300000000000,
          sentiment: 'Neutral'
        },
        {
          symbol: 'XRP',
          name: 'XRP',
          price: 3.08,
          change24h: 0,
          marketCap: 181720000000,
          sentiment: 'Neutral'
        }
      ],
      lastUpdated: new Date().toISOString(),
      error: `API Error: ${error.message}`,
      usingFallback: true
    };
    
    console.log('Returning fallback data due to error:', fallbackData);
    
    return new Response(JSON.stringify(fallbackData), {
      status: 200, // Always return 200 to avoid client-side errors
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getSentiment(change24h: number): string {
  if (change24h > 2) {
    return 'Bullish - Strong upward momentum';
  } else if (change24h > 0) {
    return 'Slightly Bullish - Modest gains';
  } else if (change24h < -2) {
    return 'Bearish - Significant decline';
  } else if (change24h < 0) {
    return 'Slightly Bearish - Minor losses';
  }
  return 'Neutral - Stable price action';
}
