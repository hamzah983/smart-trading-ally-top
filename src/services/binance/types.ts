
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
}

// Trading bot types
export interface TradingBot {
  id: string;
  name: string;
  account_id: string;
  strategy_type: 'trend_following' | 'mean_reversion' | 'breakout' | 'scalping' | string;
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
}

export interface BotForm {
  name: string;
  account_id: string;
  strategy_type: 'trend_following' | 'mean_reversion' | 'breakout' | 'scalping' | string;
  trading_pair: string;
  description?: string;
  risk_level: 'low' | 'medium' | 'high';
  settings?: Record<string, any>;
  risk_parameters?: Record<string, any>;
  trading_mode: 'demo' | 'real';
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
