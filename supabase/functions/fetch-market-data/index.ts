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

// Enhanced configuration
const CONFIG = {
  CACHE_DURATION: 2 * 60 * 1000, // 2 minutes
  MAX_RETRIES: 3,
  RETRY_DELAY_BASE: 1000,
  REQUEST_TIMEOUT: 15000,
  RATE_LIMIT_DELAY: 200,
  
  // API endpoints with fallbacks
  BINANCE_ENDPOINTS: [
    'https://api.binance.com/api/v3/ticker/24hr?symbol=XRPUSDT',
    'https://api1.binance.com/api/v3/ticker/24hr?symbol=XRPUSDT',
    'https://api2.binance.com/api/v3/ticker/24hr?symbol=XRPUSDT',
    'https://api3.binance.com/api/v3/ticker/24hr?symbol=XRPUSDT'
  ],
  
  COINGLASS_ENDPOINTS: [
    'https://open-api.coinglass.com/public/v2/liquidation?symbol=XRP&time_type=1',
    'https://api.coinglass.com/public/v2/liquidation?symbol=XRP&time_type=1'
  ],
  
  // Alternative data sources
  COINGECKO_ENDPOINTS: [
    'https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd&include_24hr_change=true&include_market_cap=true',
    'https://pro-api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd&include_24hr_change=true&include_market_cap=true'
  ]
};

// Enhanced User-Agent rotation to avoid 451 errors
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'SugarTrades/2.0 (Trading Analytics)',
  'XRP-Analytics/1.0 (Market Data)'
];

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Enhanced in-memory cache with data source tracking
let cachedData: any = null;
let cacheTimestamp: number = 0;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const now = Date.now();
    
    // Check if we have valid cached data
    if (cachedData && (now - cacheTimestamp) < CONFIG.CACHE_DURATION) {
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
    
    // Try to fetch data from multiple sources with fallback chain
    let marketData = null;
    let dataSource = '';
    let lastError = null;

    // 1. Try Binance API with enhanced retry and fallback endpoints
    console.log('Attempting Binance API...');
    try {
      const binanceData = await fetchWithFallbackEndpoints(
        CONFIG.BINANCE_ENDPOINTS,
        { requiresAuth: false, sourceType: 'binance' }
      );
      
      if (binanceData && binanceData.symbol === 'XRPUSDT') {
        marketData = await processBinanceData(binanceData);
        dataSource = 'binance';
        console.log('Successfully fetched data from Binance');
      }
    } catch (error) {
      console.warn('Binance API failed:', error.message);
      lastError = error;
    }

    // 2. Try CoinGecko as fallback
    if (!marketData) {
      console.log('Attempting CoinGecko API...');
      try {
        const coinGeckoData = await fetchWithFallbackEndpoints(
          CONFIG.COINGECKO_ENDPOINTS,
          { requiresAuth: false, sourceType: 'coingecko' }
        );
        
        if (coinGeckoData && coinGeckoData.ripple) {
          marketData = await processCoinGeckoData(coinGeckoData.ripple);
          dataSource = 'coingecko';
          console.log('Successfully fetched data from CoinGecko');
        }
      } catch (error) {
        console.warn('CoinGecko API failed:', error.message);
        lastError = error;
      }
    }

    // 3. Try to enhance with liquidation data from CoinGlass (optional)
    if (marketData) {
      try {
        const liquidationData = await fetchLiquidationData();
        if (liquidationData && marketData.cryptos?.[0]) {
          marketData.cryptos[0].liquidations = liquidationData;
          dataSource += '+coinglass';
        }
      } catch (error) {
        console.warn('CoinGlass liquidation data failed:', error.message);
        // This is optional, don't fail the whole request
      }
    }

    // 4. Generate enhanced fallback data if all APIs fail
    if (!marketData) {
      console.log('All APIs failed, generating enhanced fallback data');
      marketData = generateEnhancedFallbackData(lastError);
      dataSource = 'enhanced_fallback';
    }

    // Add metadata
    marketData.lastUpdated = new Date().toISOString();
    marketData.dataSource = dataSource;

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
    
    // Return enhanced fallback data
    const fallbackData = generateEnhancedFallbackData(error);
    
    console.log('Returning fallback data due to error:', fallbackData);
    
    return new Response(JSON.stringify(fallbackData), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Enhanced fetch with fallback endpoints and improved retry logic
async function fetchWithFallbackEndpoints(endpoints: string[], options: {
  requiresAuth?: boolean;
  sourceType?: string;
}): Promise<any> {
  let lastError = null;
  
  for (let i = 0; i < endpoints.length; i++) {
    const endpoint = endpoints[i];
    console.log(`Trying endpoint ${i + 1}/${endpoints.length}: ${endpoint}`);
    
    try {
      const data = await fetchWithRetry(endpoint, {
        requiresAuth: options.requiresAuth || false,
        sourceType: options.sourceType || 'unknown',
        endpointIndex: i
      });
      
      if (data) {
        console.log(`Successfully fetched from endpoint ${i + 1}`);
        return data;
      }
    } catch (error) {
      console.warn(`Endpoint ${i + 1} failed:`, error.message);
      lastError = error;
      
      // Add delay between endpoint attempts
      if (i < endpoints.length - 1) {
        await new Promise(resolve => setTimeout(resolve, CONFIG.RATE_LIMIT_DELAY));
      }
    }
  }
  
  throw lastError || new Error('All endpoints failed');
}

// Enhanced retry mechanism with better error handling
async function fetchWithRetry(url: string, options: {
  requiresAuth?: boolean;
  sourceType?: string;
  endpointIndex?: number;
}): Promise<any> {
  let lastError = null;
  
  for (let attempt = 0; attempt < CONFIG.MAX_RETRIES; attempt++) {
    try {
      console.log(`Fetching ${url} (attempt ${attempt + 1}/${CONFIG.MAX_RETRIES})`);
      
      // Enhanced headers to avoid 451 errors
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
        'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
      };

      // Add API key for CoinGlass if needed
      if (url.includes('coinglass.com') && options.requiresAuth) {
        const coinglassApiKey = Deno.env.get('COINGLASS_API_KEY');
        if (coinglassApiKey) {
          headers['CG-API-KEY'] = coinglassApiKey;
        }
      }

      // Add CoinGecko API key if available
      if (url.includes('pro-api.coingecko.com')) {
        const coinGeckoApiKey = Deno.env.get('COINGECKO_API_KEY');
        if (coinGeckoApiKey) {
          headers['x-cg-pro-api-key'] = coinGeckoApiKey;
        }
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);

      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        console.log(`Successfully fetched data from ${options.sourceType} (attempt ${attempt + 1})`);
        return data;
      } else if (response.status === 451) {
        throw new Error(`Unavailable for legal reasons (451) - possibly geo-blocked`);
      } else if (response.status === 429) {
        // Rate limit - longer delay before retry
        const retryAfter = response.headers.get('Retry-After');
        const delayMs = retryAfter ? parseInt(retryAfter) * 1000 : CONFIG.RETRY_DELAY_BASE * Math.pow(2, attempt);
        console.log(`Rate limited (429), waiting ${delayMs}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.warn(`Attempt ${attempt + 1} failed:`, error.message);
      lastError = error;
      
      if (attempt === CONFIG.MAX_RETRIES - 1) {
        break;
      }
      
      // Exponential backoff with jitter
      const delayMs = CONFIG.RETRY_DELAY_BASE * Math.pow(2, attempt) + Math.random() * 500;
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
}

// Process Binance API data
async function processBinanceData(binanceData: any): Promise<any> {
  const price = parseFloat(binanceData.lastPrice);
  const change24h = parseFloat(binanceData.priceChangePercent);
  
  // Estimate market cap (approximate XRP circulating supply: ~59 billion)
  const estimatedCirculatingSupply = 59000000000;
  const marketCap = price * estimatedCirculatingSupply;
  
  const sentiment = getSentiment(change24h);
  
  return {
    cryptos: [{
      symbol: 'XRP',
      name: 'XRP',
      price: price,
      change24h: change24h,
      marketCap: marketCap,
      sentiment
    }]
  };
}

// Process CoinGecko API data
async function processCoinGeckoData(coinGeckoData: any): Promise<any> {
  const price = coinGeckoData.usd;
  const change24h = coinGeckoData.usd_24h_change || 0;
  const marketCap = coinGeckoData.usd_market_cap || (price * 59000000000);
  
  const sentiment = getSentiment(change24h);
  
  return {
    cryptos: [{
      symbol: 'XRP',
      name: 'XRP',
      price: price,
      change24h: change24h,
      marketCap: marketCap,
      sentiment
    }]
  };
}

// Enhanced liquidation data fetching
async function fetchLiquidationData(): Promise<any> {
  const coinglassApiKey = Deno.env.get('COINGLASS_API_KEY');
  if (!coinglassApiKey) {
    return null;
  }

  try {
    const liquidationData = await fetchWithFallbackEndpoints(
      CONFIG.COINGLASS_ENDPOINTS,
      { requiresAuth: true, sourceType: 'coinglass' }
    );

    if (liquidationData?.code === "0" && liquidationData.data) {
      const data = liquidationData.data;
      const dataMap = data.dataMap;
      const exchanges = Object.keys(dataMap);
      
      return {
        total24h: data.totalLiquidation || 0,
        long24h: data.totalLong || 0,
        short24h: data.totalShort || 0,
        exchanges: exchanges
      };
    }
  } catch (error) {
    console.warn('Failed to fetch liquidation data:', error.message);
  }
  
  return null;
}

// Enhanced fallback data generation with dynamic pricing
function generateEnhancedFallbackData(error?: Error): any {
  // Use time-based variations for more realistic fallback data
  const timeSeed = Date.now() / (1000 * 60 * 60); // Hourly variations
  const basePrice = 3.08; // Reasonable base price for XRP
  const priceVariation = Math.sin(timeSeed * 0.1) * 0.3; // ±30 cents variation
  const price = Math.max(0.1, basePrice + priceVariation);
  
  const changeVariation = Math.sin(timeSeed * 0.2) * 15; // ±15% change variation
  const change24h = Math.max(-50, Math.min(50, changeVariation)); // Clamp to reasonable range
  
  const estimatedCirculatingSupply = 59000000000;
  const marketCap = price * estimatedCirculatingSupply;
  
  return {
    cryptos: [{
      symbol: 'XRP',
      name: 'XRP',
      price: price,
      change24h: change24h,
      marketCap: marketCap,
      sentiment: getSentiment(change24h)
    }],
    lastUpdated: new Date().toISOString(),
    error: error ? `API Error: ${error.message}` : 'Using fallback data',
    usingFallback: true,
    warning: 'Live data temporarily unavailable - using simulated values'
  };
}

function getSentiment(change24h: number): string {
  if (change24h > 5) {
    return 'Very Bullish - Strong rally in progress';
  } else if (change24h > 2) {
    return 'Bullish - Strong upward momentum';
  } else if (change24h > 0) {
    return 'Slightly Bullish - Modest gains';
  } else if (change24h < -5) {
    return 'Very Bearish - Sharp decline';
  } else if (change24h < -2) {
    return 'Bearish - Significant decline';
  } else if (change24h < 0) {
    return 'Slightly Bearish - Minor losses';
  }
  return 'Neutral - Stable price action';
}