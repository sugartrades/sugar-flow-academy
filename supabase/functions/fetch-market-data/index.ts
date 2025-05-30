
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching market data from CoinGecko API...');
    
    // Fetch Bitcoin data from CoinGecko API
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_market_cap=true',
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

    const bitcoin = data.bitcoin;
    if (!bitcoin) {
      throw new Error('Bitcoin data not found in response');
    }

    const price = bitcoin.usd;
    const change24h = bitcoin.usd_24h_change;
    const marketCap = bitcoin.usd_market_cap;

    // Determine market sentiment based on 24h change
    let sentiment = 'Neutral';
    if (change24h > 2) {
      sentiment = 'Bullish - Strong upward momentum';
    } else if (change24h > 0) {
      sentiment = 'Slightly Bullish - Modest gains';
    } else if (change24h < -2) {
      sentiment = 'Bearish - Significant decline';
    } else if (change24h < 0) {
      sentiment = 'Slightly Bearish - Minor losses';
    }

    // Create market update content
    const title = `Bitcoin Market Update`;
    const content = `BTC: $${price.toLocaleString()} (${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%) - ${sentiment}`;

    const marketData = {
      title,
      content,
      price,
      change24h,
      marketCap,
      sentiment,
      lastUpdated: new Date().toISOString()
    };

    console.log('Returning market data:', marketData);

    return new Response(JSON.stringify(marketData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fetch-market-data function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        title: 'Market Update',
        content: 'Unable to fetch live market data at this time. Please try again later.',
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
