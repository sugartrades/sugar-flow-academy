
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

interface CoinglassResponse {
  code: string;
  msg: string;
  data: {
    symbol: string;
    price: number;
    priceChangePercent: number;
    openInterest: number;
    openInterestChange: number;
  }[];
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Simple in-memory cache
let cachedData: any = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const now = Date.now();
    
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
    let dataSource = 'coingecko';
    let xrpFromCoinglass = null;
    
    // Try to fetch XRP from Coinglass if API key is available
    if (coinglassApiKey) {
      try {
        console.log('Attempting to fetch XRP data from Coinglass...');
        const coinglassResponse = await fetch(
          'https://api.coinglass.com/public/v2/open_interest?symbol=XRP',
          {
            method: 'GET',
            headers: {
              'coinglassSecret': coinglassApiKey,
            }
          }
        );

        if (coinglassResponse.ok) {
          const responseText = await coinglassResponse.text();
          console.log('Coinglass raw response:', responseText);
          
          const coinglassData = JSON.parse(responseText) as CoinglassResponse;
          console.log('Coinglass parsed data:', coinglassData);
          
          if (coinglassData.code === "0" && coinglassData.data && coinglassData.data.length > 0) {
            const xrpData = coinglassData.data[0]; // Get the first item which should be XRP data
            const price = xrpData.price;
            const change24h = xrpData.priceChangePercent;
            
            xrpFromCoinglass = {
              symbol: 'XRP',
              name: 'XRP',
              price: price,
              change24h: change24h,
              marketCap: price * 55000000000, // Approximate circulating supply
              sentiment: getSentiment(change24h)
            };
            
            dataSource = 'coinglass';
            console.log('Successfully fetched XRP data from Coinglass:', xrpFromCoinglass);
          } else {
            console.log('Coinglass API response indicates failure or no data:', coinglassData);
          }
        } else {
          console.log('Coinglass API request failed with status:', coinglassResponse.status);
        }
      } catch (error) {
        console.log('Failed to fetch from Coinglass, falling back to CoinGecko:', error.message);
      }
    }
    
    // Add delay to help with rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Fetch Bitcoin, Ethereum, and XRP data from CoinGecko API
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,ripple&vs_currencies=usd&include_24hr_change=true&include_market_cap=true',
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SugarTrades/1.0'
        },
      }
    );

    if (!response.ok) {
      // If we have cached data, return it even if expired
      if (cachedData) {
        console.log('API failed but returning stale cached data due to rate limiting');
        return new Response(JSON.stringify({
          ...cachedData,
          fromCache: true,
          stale: true,
          error: `API Error: ${response.status}`,
          cacheAge: Math.floor((now - cacheTimestamp) / 1000)
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('CoinGecko response:', data);

    const cryptos: CryptoData[] = [];

    // Process Bitcoin data
    if (data.bitcoin) {
      const btc = data.bitcoin;
      const sentiment = getSentiment(btc.usd_24h_change);
      cryptos.push({
        symbol: 'BTC',
        name: 'Bitcoin',
        price: btc.usd,
        change24h: btc.usd_24h_change,
        marketCap: btc.usd_market_cap,
        sentiment
      });
    }

    // Process Ethereum data
    if (data.ethereum) {
      const eth = data.ethereum;
      const sentiment = getSentiment(eth.usd_24h_change);
      cryptos.push({
        symbol: 'ETH',
        name: 'Ethereum',
        price: eth.usd,
        change24h: eth.usd_24h_change,
        marketCap: eth.usd_market_cap,
        sentiment
      });
    }

    // Process XRP data - use Coinglass data if available, otherwise CoinGecko
    if (xrpFromCoinglass) {
      cryptos.push(xrpFromCoinglass);
    } else if (data.ripple) {
      const xrp = data.ripple;
      const sentiment = getSentiment(xrp.usd_24h_change);
      cryptos.push({
        symbol: 'XRP',
        name: 'XRP',
        price: xrp.usd,
        change24h: xrp.usd_24h_change,
        marketCap: xrp.usd_market_cap,
        sentiment
      });
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
          price: 3.00,
          change24h: 0,
          marketCap: 170000000000,
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
