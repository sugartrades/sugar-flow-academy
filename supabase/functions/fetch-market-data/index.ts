
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching market data for BTC, ETH, and XRP from CoinGecko API...');
    
    // Fetch Bitcoin, Ethereum, and XRP data from CoinGecko API
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,ripple&vs_currencies=usd&include_24hr_change=true&include_market_cap=true',
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
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

    // Process XRP data
    if (data.ripple) {
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
      lastUpdated: new Date().toISOString()
    };

    console.log('Returning market data:', marketData);

    return new Response(JSON.stringify(marketData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fetch-market-data function:', error);
    
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
          price: 0.60,
          change24h: 0,
          marketCap: 35000000000,
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
