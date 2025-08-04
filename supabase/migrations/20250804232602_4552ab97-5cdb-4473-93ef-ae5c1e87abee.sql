-- Enhanced derivatives data table with better indexing
-- Add indexes for better performance on derivatives data queries
CREATE INDEX IF NOT EXISTS idx_derivatives_data_symbol_exchange ON derivatives_data(symbol, exchange);
CREATE INDEX IF NOT EXISTS idx_derivatives_data_timestamp ON derivatives_data(data_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_derivatives_data_created_at ON derivatives_data(created_at DESC);

-- Create a view for latest derivatives data by exchange
CREATE OR REPLACE VIEW latest_derivatives_data AS
SELECT DISTINCT ON (exchange) 
    *
FROM derivatives_data 
WHERE symbol = 'XRP'
ORDER BY exchange, data_timestamp DESC;

-- Create a function to get aggregated derivatives metrics
CREATE OR REPLACE FUNCTION get_aggregated_derivatives_metrics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
    total_oi NUMERIC;
    avg_lsr NUMERIC;
    avg_funding NUMERIC;
    total_liquidations NUMERIC;
    total_volume NUMERIC;
    estimated_float NUMERIC;
    leverage_multiplier NUMERIC;
BEGIN
    -- Get aggregated metrics from latest data
    SELECT 
        COALESCE(SUM(open_interest), 0),
        COALESCE(AVG(long_short_ratio), 1),
        COALESCE(AVG(funding_rate), 0),
        COALESCE(SUM(liquidations_24h), 0),
        COALESCE(SUM(volume_24h), 0)
    INTO 
        total_oi,
        avg_lsr,
        avg_funding,
        total_liquidations,
        total_volume
    FROM latest_derivatives_data;
    
    -- Estimate exchange float based on open interest
    -- Assumption: Exchange float is roughly 2-4x the total open interest
    estimated_float := total_oi * 3.0;
    
    -- Calculate leverage multiplier based on market conditions
    -- Higher funding rates and skewed long/short ratios increase multiplier
    leverage_multiplier := GREATEST(1.0, LEAST(3.0, 
        1.0 + ABS(avg_funding) * 500 + ABS(avg_lsr - 1.0) * 0.5
    ));
    
    result := jsonb_build_object(
        'totalOpenInterest', total_oi,
        'avgLongShortRatio', avg_lsr,
        'avgFundingRate', avg_funding,
        'totalLiquidations24h', total_liquidations,
        'totalVolume24h', total_volume,
        'estimatedFloat', estimated_float,
        'leverageMultiplier', leverage_multiplier,
        'lastUpdated', NOW()
    );
    
    RETURN result;
END;
$$;

-- Create market sentiment analysis function
CREATE OR REPLACE FUNCTION analyze_market_sentiment()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
    funding_pressure TEXT;
    liquidation_risk TEXT;
    overall_sentiment TEXT;
    avg_funding NUMERIC;
    total_liquidations NUMERIC;
BEGIN
    -- Get key metrics
    SELECT 
        COALESCE(AVG(funding_rate), 0),
        COALESCE(SUM(liquidations_24h), 0)
    INTO 
        avg_funding,
        total_liquidations
    FROM latest_derivatives_data;
    
    -- Analyze funding pressure
    IF avg_funding > 0.01 THEN
        funding_pressure := 'HIGH_BULLISH';
    ELSIF avg_funding > 0.005 THEN
        funding_pressure := 'MODERATE_BULLISH';
    ELSIF avg_funding > -0.005 THEN
        funding_pressure := 'NEUTRAL';
    ELSIF avg_funding > -0.01 THEN
        funding_pressure := 'MODERATE_BEARISH';
    ELSE
        funding_pressure := 'HIGH_BEARISH';
    END IF;
    
    -- Analyze liquidation risk
    IF total_liquidations > 100000000 THEN -- > 100M XRP
        liquidation_risk := 'HIGH';
    ELSIF total_liquidations > 50000000 THEN -- > 50M XRP
        liquidation_risk := 'MODERATE';
    ELSE
        liquidation_risk := 'LOW';
    END IF;
    
    -- Overall sentiment
    IF funding_pressure IN ('HIGH_BULLISH', 'MODERATE_BULLISH') AND liquidation_risk = 'LOW' THEN
        overall_sentiment := 'BULLISH';
    ELSIF funding_pressure IN ('HIGH_BEARISH', 'MODERATE_BEARISH') AND liquidation_risk = 'HIGH' THEN
        overall_sentiment := 'BEARISH';
    ELSE
        overall_sentiment := 'NEUTRAL';
    END IF;
    
    result := jsonb_build_object(
        'fundingPressure', funding_pressure,
        'liquidationRisk', liquidation_risk,
        'overallSentiment', overall_sentiment,
        'avgFundingRate', avg_funding,
        'totalLiquidations24h', total_liquidations,
        'lastUpdated', NOW()
    );
    
    RETURN result;
END;
$$;