
export interface TradingAccount {
  id: string;
  account_name: string;
  broker_name?: string;
  api_key?: string;
  api_secret?: string;
  platform: string;
  balance?: number;
  equity?: number;
  connection_status?: boolean;
  is_api_verified?: boolean;
  is_active?: boolean;
  user_id?: string;
  trading_mode?: 'real' | 'demo' | 'paper';
  created_at?: string;
  updated_at?: string;
  leverage?: number;
  last_sync_time?: string;
  risk_level?: 'low' | 'medium' | 'high';
  max_drawdown?: number;
  daily_profit_target?: number;
}

export interface PlaceOrderParams {
  accountId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT';
  quantity: number;
  price?: number;
  stopLoss?: number;
  takeProfit?: number;
}

export interface ClosePositionParams {
  accountId: string;
  symbol: string;
  orderId: string;
  tradeId: string;
  quantity: number;
  pnl?: number;
}

export interface UpdateStopLossParams {
  accountId: string;
  symbol: string;
  orderId: string;
  tradeId: string;
  stopPrice: number;
}

export interface MicroTradingOptions {
  enabled: boolean;
  maxRiskPercentage: number;
  preferredPairs: string[];
  scalping: boolean;
  closePositionsQuickly: boolean;
  useHigherLeverage: boolean;
  minimumOrderSize: number;
}

export interface RealTimeTradeStatus {
  isActive: boolean;
  lastTradeTime: Date | null;
  totalTrades: number;
  successfulTrades: number;
  profitLoss: number;
  connectionStatus: boolean;
}

export interface AccountAnalysisResult {
  success: boolean;
  message: string;
  isRealTrading: boolean;
  affectsRealMoney: boolean;
  tradingPermissions?: string[];
  recommendedSettings?: {
    maxRiskPerTrade: number;
    recommendedPairs: string[];
  };
  warnings?: string[];
}

export interface TradingBot {
  id: string;
  name: string;
  description?: string;
  account_id: string;
  strategy: string;
  status: 'active' | 'paused' | 'stopped' | 'error';
  trading_pairs: string[];
  risk_level: number;
  max_open_trades: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  profit_loss?: number;
  win_rate?: number;
  total_trades?: number;
  trading_mode: 'real' | 'demo';
}

export interface BotSettings {
  takeProfit: number;
  stopLoss: number;
  timeframe: string;
  maxDrawdown: number;
  trailingStop: boolean;
  martingale: boolean;
  martingaleMultiplier?: number;
  tradingHours?: {
    start: string;
    end: string;
  }[];
  indicators: {
    name: string;
    parameters: Record<string, any>;
  }[];
}

export interface Trade {
  id: string;
  account_id: string;
  bot_id?: string;
  symbol: string;
  type: 'buy' | 'sell';
  status: 'open' | 'closed' | 'canceled' | 'error';
  entry_price: number;
  exit_price?: number;
  quantity: number;
  pnl?: number;
  stop_loss?: number;
  take_profit?: number;
  created_at: string;
  closed_at?: string;
  closing_reason?: string;
  order_id?: string;
}

export interface TradingPlatform {
  id: string;
  name: string;
  logo: string;
  description: string;
  url: string;
  supported: boolean;
}
