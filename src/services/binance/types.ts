
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
