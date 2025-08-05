// ============================================================================
// CALCULATOR CONFIGURATION CONSTANTS
// ============================================================================
// This file centralizes all hardcoded values and magic numbers used across
// the calculator components for maintainability and consistency.

// ============================================================================
// MARKET DATA CONSTANTS
// ============================================================================

export const MARKET_DATA = {
  // XRP Supply and defaults
  XRP_TOTAL_SUPPLY: 99987000000, // ~99.987 billion XRP in circulation
  DEFAULT_XRP_PRICE: 0.60, // Fallback price when live data unavailable
  DEFAULT_XRP_PRICE_ENHANCED: 3.00, // Enhanced fallback price for enhanced calculator
  
  // Default market cap values for fallback data
  DEFAULT_MARKET_CAP: 170000000000, // $170B default market cap
  
  // Fallback crypto prices for market data
  FALLBACK_PRICES: {
    BTC: 42000,
    ETH: 2500,
    XRP: 3.08
  },
  
  // Fallback market caps
  FALLBACK_MARKET_CAPS: {
    BTC: 800000000000, // $800B
    ETH: 300000000000, // $300B
    XRP: 181720000000  // $181.72B
  }
} as const;

// ============================================================================
// CALCULATOR DEFAULT VALUES
// ============================================================================

export const CALCULATOR_DEFAULTS = {
  // Enhanced XRP Market Cap Visualizer
  XRP_FLOAT: 8000000000, // 8B XRP default exchange float
  BUY_ORDER_SIZE: 100000000, // 100M XRP default order size
  LEVERAGE_AMPLIFIER: 2.0,
  UPDATE_FREQUENCY: 300, // 5 minutes in seconds
  
  // Classic XRP Market Cap Visualizer  
  CLASSIC_XRP_FLOAT: 5000000000, // 5B XRP default (5% of total supply)
  CLASSIC_BUY_ORDER_SIZE: 40000000, // $40M default to match Coinglass example
  
  // Leverage Calculator
  LEVERAGE_DEFAULT: 1,
  FEE_PERCENT_DEFAULT: 0.1, // 0.1% default trading fee
  LIQUIDATION_BUFFER: 0.8, // 80% of margin before liquidation
  
  // Market Cap Settings
  DATA_SOURCE: 'coinglass',
  MANUAL_FLOAT_OVERRIDE: false,
  TEST_MODE: false
} as const;

// ============================================================================
// SLIDER CONFIGURATIONS
// ============================================================================

export const SLIDER_CONFIGS = {
  // XRP Float slider (Enhanced Calculator)
  XRP_FLOAT: {
    MIN: 1000000000, // 1B XRP
    MAX: 20000000000, // 20B XRP
    STEP: 100000000, // 100M XRP steps
    DYNAMIC_STEPS: {
      SMALL: 1000000, // 1M steps for < 10M
      MEDIUM: 5000000, // 5M steps for < 100M
      LARGE: 10000000, // 10M steps for < 1B
      EXTRA_LARGE: 50000000 // 50M steps for > 1B
    }
  },
  
  // Buy Order Size slider (Enhanced Calculator)
  BUY_ORDER_ENHANCED: {
    MIN: 100000, // 100K XRP minimum
    MAX: 50000000000, // 50B XRP maximum (will be dynamically limited)
    STEP: 100000, // 100K XRP default step
    DYNAMIC_THRESHOLDS: {
      MICRO: 1000000, // 1M XRP
      SMALL: 10000000, // 10M XRP
      MEDIUM: 100000000, // 100M XRP
      LARGE: 1000000000, // 1B XRP
      XLARGE: 10000000000 // 10B XRP
    },
    DYNAMIC_STEPS: {
      MICRO_STEP: 10000, // 10K steps below 1M
      SMALL_STEP: 100000, // 100K steps 1M-10M
      MEDIUM_STEP: 1000000, // 1M steps 10M-100M
      LARGE_STEP: 10000000, // 10M steps 100M-1B
      XLARGE_STEP: 100000000, // 100M steps 1B-10B
      HUGE_STEP: 1000000000 // 1B steps above 10B
    },
    // Float consumption warning thresholds
    WARNING_THRESHOLDS: {
      CAUTION: 0.25, // 25% of float consumed
      WARNING: 0.5, // 50% of float consumed
      DANGER: 0.75, // 75% of float consumed
      EXTREME: 1.0 // 100% of float consumed
    }
  },
  
  // Buy Order Size slider (Classic Calculator)
  BUY_ORDER_CLASSIC: {
    MIN: 1000000, // $1M
    MAX: 50000000000, // $50B
    STEP: 1000000 // $1M steps
  }
} as const;

// ============================================================================
// REALISTIC MARKET SIMULATOR CONSTANTS
// ============================================================================

export const MARKET_SIMULATOR = {
  // Market Microstructure percentages - increased to better reflect real market depth
  IMMEDIATE_DEPTH_PERCENT: 0.15, // 15% of float immediately available
  MARKET_MAKER_RESPONSE_PERCENT: 0.25, // 25% from algorithmic MM
  CROSS_EXCHANGE_ARB_PERCENT: 0.35, // 35% from arbitrage flows
  
  // Derivatives impact factors
  DERIVATIVES_FLOAT_MULTIPLIER: 0.7, // Conservative derivatives impact
  DERIVATIVES_OI_DIVISOR: 10, // Market cap divisor for OI impact
  
  // Conservative leverage multiplier limits
  LEVERAGE_MULTIPLIER: {
    BASE: 1.05, // 5% base amplification when no derivatives data
    MAX_FUNDING_IMPACT: 0.3, // Maximum 30% funding rate impact
    FUNDING_MULTIPLIER: 10, // Amplify funding rate by 10x
    RATIO_THRESHOLD: 0.6, // Long/short ratio threshold
    RATIO_MULTIPLIER: 0.5 // Long/short ratio impact multiplier
  },
  
  // Synthetic demand calculation
  SYNTHETIC_DEMAND: {
    MAX_MULTIPLIER: 0.2, // Maximum 20% synthetic demand
    OI_THRESHOLD: 10000000000, // $10B OI threshold
    LOG_MULTIPLIER: 0.1 // Logarithmic scaling factor
  },
  
  // Market Psychology thresholds and factors
  PSYCHOLOGY: {
    MOMENTUM_THRESHOLD: 50000000, // $50M triggers momentum
    MOMENTUM_MAX: 0.15, // Maximum 15% momentum factor
    MOMENTUM_MULTIPLIER: 0.05, // Momentum scaling factor
    
    LIQUIDITY_PANIC_THRESHOLD: 200000000, // $200M causes liquidity panic
    LIQUIDITY_PANIC_BASE: 0.8, // 80% liquidity retention
    LIQUIDITY_PANIC_DECAY: 500000000, // $500M decay factor
    
    FOMO_THRESHOLD: 100000000, // $100M triggers FOMO
    FOMO_MAX: 1.2, // Maximum 20% FOMO buying
    FOMO_DIVISOR: 500000000, // $500M FOMO scaling
    
    WHALE_ALERT_THRESHOLD: 50000000, // $50M triggers whale alert
    WHALE_ALERT_MAX: 0.1, // Maximum 10% whale alert multiplier
    WHALE_ALERT_MULTIPLIER: 0.02 // Whale alert scaling factor
  },
  
  // Price impact factors for different phases
  PRICE_IMPACT: {
    IMMEDIATE_FACTOR: 0.0005, // 0.05% immediate impact per depth ratio
    MARKET_MAKER_FACTOR: 0.003, // 0.3% MM price impact
    ARBITRAGE_FACTOR: 0.008, // 0.8% arbitrage price impact
    EXHAUSTION_POWER: 1.2, // Exponential exhaustion factor
    EXHAUSTION_MAX: 0.05, // Maximum 5% exhaustion impact
    CALIBRATION_FACTOR: 0.002 // 0.2% phase calibration impact
  },
  
  // Amplification limits
  AMPLIFICATION: {
    DERIVATIVES_MAX: 1.5, // Maximum 1.5x derivatives amplification
    PSYCHOLOGY_MAX: 1.3, // Maximum 1.3x psychology amplification
    PANIC_MAX: 0.1 // Maximum 10% panic amplification
  },
  
  // Float and execution calculations
  EXECUTION: {
    MIN_FLOAT_PERCENT: 0.1, // Minimum 10% float remaining
    EFFECTIVE_FLOAT_REDUCTION: 0.05 // 5% synthetic demand impact on float
  }
} as const;

// ============================================================================
// CALIBRATION DISPLAY CONSTANTS
// ============================================================================

export const CALIBRATION = {
  // Coinglass reference data (real market example)
  COINGLASS: {
    ORDER_SIZE: 40000000, // $40M reference order
    MARKET_CAP_INCREASE: 20900000000, // $20.9B market cap movement
    MULTIPLIER: 522, // 522x multiplier reference
    SCALING_FACTOR: 0.8 // Power law scaling factor
  },
  
  // Accuracy thresholds
  ACCURACY: {
    EXCELLENT_THRESHOLD: 0.2, // < 20% variance = excellent
    GOOD_THRESHOLD: 0.5 // < 50% variance = good
  }
} as const;

// ============================================================================
// DERIVATIVES DATA CONSTANTS
// ============================================================================

export const DERIVATIVES = {
  // Default values when no data available
  DEFAULTS: {
    TOTAL_OPEN_INTEREST: 0,
    AVG_LONG_SHORT_RATIO: 1,
    AVG_FUNDING_RATE: 0,
    TOTAL_LIQUIDATIONS_24H: 0,
    TOTAL_VOLUME_24H: 0,
    EXCHANGE_COUNT: 0,
    ESTIMATED_FLOAT: 8000000000, // 8B XRP
    LEVERAGE_MULTIPLIER: 1,
    WEIGHTED_FUNDING_RATE: 0,
    MARKET_MOOD_SCORE: 0.5,
    FLOAT_RANGE_MIN: 6000000000, // 6B XRP
    FLOAT_RANGE_MAX: 12000000000 // 12B XRP
  },
  
  // Funding rate thresholds
  FUNDING_THRESHOLDS: {
    BULLISH: 0.0005, // > 0.05% = bullish
    BEARISH: -0.0005 // < -0.05% = bearish
  },
  
  // Long/short ratio thresholds
  RATIO_THRESHOLDS: {
    LONG_DOMINANT: 1.3, // > 1.3 = long dominant
    SHORT_DOMINANT: 0.7 // < 0.7 = short dominant
  },
  
  // Market mood calculation factors
  MOOD_CALCULATION: {
    FUNDING_COMPONENT_WEIGHT: 0.6,
    RATIO_COMPONENT_WEIGHT: 0.4,
    FUNDING_RANGE: 0.002, // ±0.1% funding rate range
    FUNDING_OFFSET: 0.001, // 0.05% funding rate offset
    RATIO_RANGE: 2.0, // Long/short ratio scaling range
    RATIO_OFFSET: 0.5 // Long/short ratio offset
  },
  
  // Float estimation parameters
  FLOAT_ESTIMATION: {
    AVERAGE_LEVERAGE: 4, // Assume 4x average leverage
    VOLUME_DAYS: 2.5, // Exchanges hold 2.5 days of volume
    FUNDING_MULTIPLIER: 50000000000, // $50B funding impact scaling
    MAX_FLOAT: 15000000000, // 15B XRP maximum
    MIN_FLOAT: 3000000000, // 3B XRP minimum
    VARIANCE_PERCENT: 0.3 // ±30% float variance
  },
  
  // Leverage multiplier calculation
  LEVERAGE_CALC: {
    FUNDING_PRESSURE_MULTIPLIER: 500,
    RATIO_IMBALANCE_MULTIPLIER: 0.5,
    LIQUIDATION_DIVISOR: 100000000, // $100M liquidation scaling
    LIQUIDATION_MAX_INFLUENCE: 0.5, // Maximum 50% liquidation influence
    MIN_MULTIPLIER: 0.5, // Minimum 0.5x multiplier
    MAX_MULTIPLIER: 4.0 // Maximum 4x multiplier
  }
} as const;

// ============================================================================
// LEVERAGE SENTIMENT CONSTANTS
// ============================================================================

export const LEVERAGE_SENTIMENT = {
  // Long/short ratio bar positioning
  BAR_POSITION: {
    MIN_RATIO: 0.5,
    SCALING_FACTOR: 2.0,
    CENTER_OFFSET: 50 // Center position percentage
  },
  
  // Multiplier impact color thresholds
  IMPACT_COLORS: {
    HIGH_THRESHOLD: 1.5, // > 1.5x = orange
    MEDIUM_THRESHOLD: 1.2 // > 1.2x = yellow, else green
  },
  
  // Market mood score thresholds
  MOOD_THRESHOLDS: {
    BULLISH: 0.7, // > 70% = green
    NEUTRAL: 0.3 // > 30% = yellow, else red
  }
} as const;

// ============================================================================
// FUNDING RATE PANEL CONSTANTS
// ============================================================================

export const FUNDING_RATE = {
  // Funding rate calculation
  FUNDING_SCHEDULE: {
    TIMES_PER_DAY: 3, // Funding happens every 8 hours
    DAYS_PER_YEAR: 365
  },
  
  // Impact level thresholds (absolute values)
  IMPACT_LEVELS: {
    HIGH_THRESHOLD: 0.001, // > 0.1% = high impact
    MODERATE_THRESHOLD: 0.0005 // > 0.05% = moderate impact
  },
  
  // Funding rate difference threshold for highlighting
  DIFFERENCE_THRESHOLD: 0.0001 // 0.01% difference threshold
} as const;

// ============================================================================
// EXCHANGE FLOAT ESTIMATOR CONSTANTS
// ============================================================================

export const EXCHANGE_FLOAT = {
  // Confidence level thresholds based on exchange count
  CONFIDENCE: {
    HIGH_THRESHOLD: 15, // >= 15 exchanges = high confidence
    MEDIUM_THRESHOLD: 8 // >= 8 exchanges = medium confidence
  },
  
  // Visual range bar positioning
  RANGE_BAR: {
    LEFT_PERCENT: 20,
    WIDTH_PERCENT: 60
  },
  
  // Top exchanges to display
  TOP_EXCHANGES_COUNT: 3
} as const;

// ============================================================================
// MARKET CAP SETTINGS CONSTANTS
// ============================================================================

export const MARKET_CAP_SETTINGS = {
  // Update frequency options (in seconds)
  UPDATE_FREQUENCIES: {
    ONE_MINUTE: 60,
    FIVE_MINUTES: 300,
    FIFTEEN_MINUTES: 900,
    ONE_HOUR: 3600
  },
  
  // Leverage amplifier options
  LEVERAGE_AMPLIFIERS: {
    CONSERVATIVE: 1.0,
    MODERATE: 1.5,
    STANDARD: 2.0,
    AGGRESSIVE: 2.5,
    MAXIMUM: 3.0
  },
  
  // Data source options
  DATA_SOURCES: {
    COINGLASS: 'coinglass',
    SIMULATION: 'simulation',
    CACHED: 'cached'
  }
} as const;

// ============================================================================
// LEVERAGE CALCULATOR CONSTANTS
// ============================================================================

export const LEVERAGE_CALCULATOR = {
  // Fee calculation
  FEE_MULTIPLIER: 2, // Entry + Exit fees
  
  // Input step values
  STEPS: {
    PRICE: 0.01,
    FEE: 0.01
  },
  
  // Default fee range
  FEE_RANGE: {
    TYPICAL_MIN: 0.1, // 0.1%
    TYPICAL_MAX: 0.2  // 0.2%
  }
} as const;

// ============================================================================
// LIVE EXCHANGE FLOAT ESTIMATOR CONSTANTS
// ============================================================================

export const LIVE_FLOAT_ESTIMATOR = {
  // Update frequency
  UPDATE_INTERVAL_MINUTES: 5,
  
  // Range bar visual positioning
  RANGE_CALCULATION: {
    LEFT_POSITION: 20, // 20% from left
    TOTAL_WIDTH: 60 // 60% total width
  }
} as const;

// ============================================================================
// FORMATTING CONSTANTS
// ============================================================================

export const FORMATTING = {
  // Currency formatting thresholds
  CURRENCY: {
    TRILLION: 1e12,
    BILLION: 1e9,
    MILLION: 1e6,
    THOUSAND: 1e3
  },
  
  // Price formatting
  PRICE_DECIMALS: 4,
  
  // Percentage formatting
  PERCENTAGE_DECIMALS: 2,
  
  // XRP value formatting thresholds
  XRP_VALUE: {
    BILLION: 1e9,
    MILLION: 1e6,
    THOUSAND: 1e3
  }
} as const;

// ============================================================================
// QUERY AND CACHING CONSTANTS
// ============================================================================

export const QUERY_CONFIG = {
  // React Query intervals
  REFETCH_INTERVAL: 5 * 60 * 1000, // 5 minutes
  STALE_TIME: 2 * 60 * 1000, // 2 minutes
  
  // Retry configuration
  RETRY_COUNT: 3,
  RETRY_DELAY_BASE: 1000, // 1 second base
  RETRY_DELAY_MAX: 30000, // 30 seconds max
  RETRY_DELAY_MULTIPLIER: 2 // Exponential backoff
} as const;

// ============================================================================
// UI/UX CONSTANTS
// ============================================================================

export const UI_CONFIG = {
  // Loading states
  SKELETON_ITEMS: 4,
  
  // Grid configurations
  GRID_BREAKPOINTS: {
    MOBILE: 1,
    TABLET: 2,
    DESKTOP: 3,
    LARGE: 4
  },
  
  // Animation and transition
  SMOOTH_TRANSITION_DURATION: 300, // milliseconds
  
  // Mobile breakpoint
  MOBILE_BREAKPOINT: 768, // pixels
  
  // Toast configuration
  TOAST_LIMIT: 1,
  TOAST_REMOVE_DELAY: 1000000 // microseconds
} as const;

// ============================================================================
// ORDER BOOK CONSTANTS (Classic Calculator)
// ============================================================================

export const ORDER_BOOK = {
  // Order book generation parameters
  GENERATION: {
    MAX_PRICE: 1000, // Generate up to $1000 XRP
    PRICE_STEP: 0.01, // $0.01 price increments
    BASE_SIZE_MULTIPLIER: 0.01, // 1% of float per level
    PRICE_DECAY_FACTOR: 0.3, // Exponential decay rate
    MIN_SIZE: 100000, // Minimum order size
    RANDOMNESS_RANGE: 0.6, // ±60% randomness
    RANDOMNESS_BASE: 0.7 // 70% base + randomness
  },
  
  // Price jump thresholds for performance
  PRICE_JUMPS: {
    TIER_1_THRESHOLD: 10, // > $10
    TIER_1_JUMP: 0.04, // $0.04 increments
    
    TIER_2_THRESHOLD: 50, // > $50  
    TIER_2_JUMP: 0.20, // $0.20 increments
    
    TIER_3_THRESHOLD: 100, // > $100
    TIER_3_JUMP: 1.00 // $1.00 increments
  }
} as const;

// ============================================================================
// TYPE EXPORTS FOR TYPE SAFETY
// ============================================================================

export type MarketDataDefaults = typeof MARKET_DATA;
export type CalculatorDefaults = typeof CALCULATOR_DEFAULTS;
export type SliderConfigs = typeof SLIDER_CONFIGS;
export type MarketSimulatorConfig = typeof MARKET_SIMULATOR;
export type CalibrationConfig = typeof CALIBRATION;
export type DerivativesConfig = typeof DERIVATIVES;
export type FormattingConfig = typeof FORMATTING;
export type QueryConfig = typeof QUERY_CONFIG;
export type UIConfig = typeof UI_CONFIG;