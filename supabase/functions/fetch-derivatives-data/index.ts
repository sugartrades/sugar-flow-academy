import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CoinglasspayloadResponse {
  code: string
  msg: string
  data: {
    symbol: string
    exchange: string
    openInterest: number
    openInterestChange24h: number
    longShortRatio: number
    fundingRate: number
    fundingRate8h: number
    liquidationVolume24h: number
    volume24h: number
    priceChangePercent24h: number
  }[]
}

interface DerivativesData {
  symbol: string
  exchange: string
  open_interest: number
  open_interest_24h_change: number
  long_short_ratio: number
  funding_rate: number
  funding_rate_8h: number
  liquidations_24h: number
  volume_24h: number
  data_timestamp: string
}

// Cache for storing data to avoid frequent API calls
let cachedData: DerivativesData[] | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const coinglassApiKey = Deno.env.get('COINGLASS_API_KEY')

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check cache first
    const now = Date.now()
    if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('Returning cached derivatives data')
      return new Response(JSON.stringify({
        derivatives: cachedData,
        lastUpdated: new Date(cacheTimestamp).toISOString(),
        source: 'cache'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // If no API key, return fallback data
    if (!coinglassApiKey) {
      console.log('No Coinglass API key found, returning fallback data')
      const fallbackData = generateFallbackDerivativesData()
      
      return new Response(JSON.stringify({
        derivatives: fallbackData,
        lastUpdated: new Date().toISOString(),
        source: 'fallback',
        warning: 'Using simulated data - Coinglass API key not configured'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Fetch data from Coinglass API
    console.log('Fetching derivatives data from Coinglass API')
    const exchanges = ['Binance', 'OKX', 'Bybit', 'Bitget', 'dYdX']
    const derivativesData: DerivativesData[] = []

    for (const exchange of exchanges) {
      try {
        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 200))

        console.log(`Fetching data for ${exchange} from CoinGlass API...`)
        
        // CoinGlass API v2 endpoint for futures data
        const response = await fetch(
          `https://open-api.coinglass.com/public/v2/indicator/futures-data?symbol=XRP&ex=${exchange}`,
          {
            headers: {
              'CG-API-KEY': coinglassApiKey,
              'Accept': 'application/json'
            }
          }
        )

        console.log(`Response status for ${exchange}: ${response.status}`)

        if (!response.ok) {
          const errorText = await response.text()
          console.warn(`Failed to fetch data for ${exchange}: ${response.status} - ${errorText}`)
          
          // Check for specific error types
          if (response.status === 401) {
            console.error('Invalid CoinGlass API key')
          } else if (response.status === 403) {
            console.error('Insufficient permissions or rate limit exceeded')
          } else if (response.status === 404) {
            console.error('API endpoint not found - check URL format')
          }
          continue
        }

        const apiResponse: CoinglasspayloadResponse = await response.json()
        
        // Check if API response is successful
        if (apiResponse.code !== '0' || !apiResponse.data || apiResponse.data.length === 0) {
          console.warn(`No data returned for ${exchange}: ${apiResponse.msg || 'Unknown error'}`)
          continue
        }

        // Process the first data item (should be XRP data for the exchange)
        const data = apiResponse.data[0]
        
        derivativesData.push({
          symbol: 'XRP',
          exchange: exchange,
          open_interest: data.openInterest || 0,
          open_interest_24h_change: data.openInterestChange24h || 0,
          long_short_ratio: data.longShortRatio || 1,
          funding_rate: data.fundingRate || 0,
          funding_rate_8h: data.fundingRate8h || 0,
          liquidations_24h: data.liquidationVolume24h || 0,
          volume_24h: data.volume24h || 0,
          data_timestamp: new Date().toISOString()
        })

      } catch (error) {
        console.warn(`Error fetching data for ${exchange}:`, error)
      }
    }

    // If we got some data, store it in database
    if (derivativesData.length > 0) {
      const { error: dbError } = await supabase
        .from('derivatives_data')
        .insert(derivativesData)

      if (dbError) {
        console.warn('Failed to store derivatives data:', dbError)
      } else {
        console.log(`Stored ${derivativesData.length} derivatives records`)
      }

      // Update cache
      cachedData = derivativesData
      cacheTimestamp = now
    } else {
      // Fallback if no live data
      console.log('No live data available, using fallback')
      derivativesData.push(...generateFallbackDerivativesData())
    }

    return new Response(JSON.stringify({
      derivatives: derivativesData,
      lastUpdated: new Date().toISOString(),
      source: derivativesData.length > 0 ? 'live' : 'fallback'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in fetch-derivatives-data function:', error)
    
    // Return fallback data on error
    const fallbackData = generateFallbackDerivativesData()
    
    return new Response(JSON.stringify({
      derivatives: fallbackData,
      lastUpdated: new Date().toISOString(),
      source: 'fallback',
      error: 'Failed to fetch live data'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

function generateFallbackDerivativesData(): DerivativesData[] {
  const exchanges = ['Binance', 'OKX', 'Bybit', 'Bitget', 'dYdX']
  const baseTimestamp = new Date().toISOString()
  
  return exchanges.map(exchange => ({
    symbol: 'XRP',
    exchange: exchange,
    open_interest: Math.random() * 1000000000 + 500000000, // 500M-1.5B XRP
    open_interest_24h_change: (Math.random() - 0.5) * 20, // -10% to +10%
    long_short_ratio: Math.random() * 2 + 0.5, // 0.5 to 2.5
    funding_rate: (Math.random() - 0.5) * 0.002, // -0.1% to +0.1%
    funding_rate_8h: (Math.random() - 0.5) * 0.006, // -0.3% to +0.3%
    liquidations_24h: Math.random() * 50000000, // 0-50M XRP
    volume_24h: Math.random() * 200000000 + 100000000, // 100M-300M XRP
    data_timestamp: baseTimestamp
  }))
}