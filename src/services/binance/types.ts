
// Trading account types
export interface TradingAccount {
  id: string;
  user_id: string;
  name: string;
  platform: string;
  api_key?: string;
  api_secret?: string;
  is_active: boolean;
  created_at: string;
  balance?: number;
  currency?: string;
  account_type?: string;
  risk_level: 'low' | 'medium' | 'high';
  trading_mode: 'demo' | 'real';
  max_position_size?: number;
  leverage?: number;
  account_value?: number;
  
  // Added missing properties
  is_api_verified?: boolean;
  connection_status?: boolean;
  account_name?: string;
  equity?: number;
  last_sync_time?: string;
  max_drawdown?: number;
  daily_profit_target?: number;
  
  // Added auto-management properties
  auto_position_sizing?: boolean;
  auto_strategy_selection?: boolean;
  reinvest_profits?: boolean;
  max_trades_per_day?: number;
  
  // MT5 specific properties
  mt5_login?: string;
  mt5_password?: string;
  mt5_server?: string;
  mt5_connection_status?: boolean;
}

// Trading bot types
export interface TradingBot {
  id: string;
  name: string;
  account_id: string;
  strategy_type: 'trend_following' | 'mean_reversion' | 'breakout' | 'scalping' | 'smart_auto' | string;
  trading_pair: string;
  is_active: boolean;
  risk_level: 'low' | 'medium' | 'high';
  description?: string;
  settings?: Record<string, any>;
  risk_parameters?: Record<string, any>;
  performance_metrics?: {
    total_trades: number;
    profitable_trades: number;
    win_rate: number;
    profit_loss: number;
  };
  created_at: string;
  trading_mode: 'demo' | 'real';
  server_status?: 'running' | 'stopped' | 'error' | 'unknown';
  last_activity?: string;
  
  // Added missing properties
  strategy?: string;
  trading_pairs?: string[];
  max_open_trades?: number;
  
  // Added auto-management options
  auto_management?: boolean;
  auto_settings?: {
    smart_position_sizing: boolean;
    auto_strategy_rotation: boolean;
    capital_preservation: boolean;
    max_daily_trades: number;
    profit_reinvestment_rate: number;
    adaptive_risk_management: boolean;
  };
  multi_strategy?: boolean;
  strategies_rotation?: {
    enabled: boolean;
    time_interval?: number; // in hours
    performance_based?: boolean;
    strategies: string[];
  };
  
  // MT5 specific properties
  asset_class?: AssetClass;
  assets?: string[];
}

// Bot form for creating and updating bots
export interface BotForm {
  name: string;
  account_id: string;
  strategy_type: string;
  trading_pair: string;
  risk_level: 'low' | 'medium' | 'high';
  description?: string;
  trading_mode?: 'demo' | 'real';
  asset_class?: AssetClass;
  assets?: string[];
  trading_pairs?: string[];
  max_open_trades?: number;
  auto_management?: boolean;
  multi_strategy?: boolean;
}

// Market Asset Classes (for MT5 and other platforms)
export enum AssetClass {
  FOREX = 'forex',
  STOCKS = 'stocks',
  INDICES = 'indices',
  COMMODITIES = 'commodities',
  CRYPTOCURRENCIES = 'cryptocurrencies',
  BONDS = 'bonds',
  ETFS = 'etfs',
  FUTURES = 'futures'
}

// Trade types
export interface Trade {
  id: string;
  account_id: string;
  bot_id?: string;
  symbol: string;
  type: 'buy' | 'sell';
  entry_price: number;
  exit_price?: number;
  lot_size: number;
  stop_loss?: number;
  take_profit?: number;
  pnl?: number;
  status: 'open' | 'closed' | 'cancelled';
  created_at: string;
  closed_at?: string;
  metadata?: Record<string, any>;
  
  // Auto-trade properties
  auto_sized?: boolean;
  strategy_used?: string;
  market_conditions?: Record<string, any>;
  auto_adjusted?: boolean;
}

// Market data types
export interface MarketData {
  symbol: string;
  price: number;
  change_24h: number;
  volume_24h: number;
  high_24h: number;
  low_24h: number;
  timestamp: string;
}

// Order parameters types - updated to include all required properties
export interface PlaceOrderParams {
  accountId: string;
  symbol: string;
  side: 'buy' | 'sell';  // Must be lowercase
  type: 'market' | 'limit';  // Must be lowercase
  quantity: number;
  price?: number;
  stopPrice?: number;
  timeInForce?: 'GTC' | 'IOC' | 'FOK';
  reduceOnly?: boolean;
  closePosition?: boolean;
  stopLoss?: number;  // Added missing property
  takeProfit?: number;  // Added missing property
  
  // Auto trade options
  isAutoOrder?: boolean;
  autoAdjust?: boolean;
  strategyId?: string;
}

export interface ClosePositionParams {
  accountId: string;
  symbol: string;
  positionId?: string;
  quantity?: number;
  orderId?: string;  // Added missing property
  tradeId?: string;  // Added missing property
  pnl?: number;      // Added missing property
}

export interface UpdateStopLossParams {
  accountId: string;
  symbol: string;
  positionId?: string;
  stopLossPrice: number;
  orderId?: string;  // Added missing property
  tradeId?: string;  // Added missing property
  stopPrice?: number; // Added missing property for consistency with usage
}

// Micro trading options
export interface MicroTradingOptions {
  enabledPairs: string[];
  maxLeverage: number;
  maxPositionSize: number;
  riskPerTrade: number;
}

// Trading platform
export interface TradingPlatform {
  id: string;
  name: string;
  logo: string;
  description: string;
  url: string;
  supported: boolean;
  // Added MT5 specific properties
  supports_forex: boolean;
  supports_stocks: boolean;
  supports_indices: boolean;
  supports_commodities: boolean;
  supports_crypto: boolean;
  supports_bonds: boolean;
  supports_etfs: boolean;
  supports_futures: boolean;
  connection_method: 'api' | 'websocket' | 'mt_protocol' | 'direct' | string;
}

// Account analysis result
export interface AccountAnalysisResult {
  success: boolean;
  message: string;
  isRealTrading: boolean;
  affectsRealMoney: boolean;
  accountId?: string;
  tradingPermissions?: string[];
  recommendedSettings?: {
    maxRiskPerTrade: number;
    recommendedPairs: string[];
  };
  warnings: string[];
}

// Smart strategy selection interface
export interface SmartStrategyOptions {
  capitalPreservation: boolean;
  growthFocus: boolean;
  adaptToMarketConditions: boolean;
  preferredStrategies?: string[];
  excludedStrategies?: string[];
  maxDrawdownAllowed: number;
  profitTarget: number;
}

// Auto-management settings interface
export interface AutoManagementSettings {
  enabled: boolean;
  smartPositionSizing: boolean;
  autoStrategyRotation: boolean;
  adaptiveRiskManagement: boolean;
  profitReinvestmentRate: number;
  capitalPreservation: boolean;
  maxDailyTrades: number;
}

// MT5 Connection Parameters
export interface MT5ConnectionParams {
  login: string;
  password: string;
  server: string;
  enableDemo?: boolean;
}

// MT5 Asset Types (expanded)
export interface MT5Asset {
  symbol: string;
  name: string;
  assetClass: AssetClass;
  pip?: number;
  lotSize?: number;
  minLot?: number;
  maxLot?: number;
  commission?: number;
  spread?: number;
  leverage?: number;
  tradingHours?: string;
  description?: string;
}

// MT5 Market Data
export interface MT5MarketData extends MarketData {
  assetClass: AssetClass;
  bid?: number;
  ask?: number;
  lotSize?: number;
  contractSize?: number;
  point?: number;
  tickValue?: number;
  marginRequired?: number;
}
