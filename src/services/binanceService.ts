
import { supabase } from "@/integrations/supabase/client";

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

/**
 * Tests the connection to the Binance API with the provided credentials
 */
export const testConnection = async (accountId: string): Promise<{ success: boolean; message: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('binance-api', {
      body: { 
        action: 'test_connection',
        accountId
      }
    });

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Error testing Binance connection:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

/**
 * Places an order on Binance
 */
export const placeOrder = async (params: PlaceOrderParams): Promise<any> => {
  try {
    const { data, error } = await supabase.functions.invoke('binance-api', {
      body: { 
        action: 'place_order',
        accountId: params.accountId,
        data: {
          symbol: params.symbol,
          side: params.side,
          type: params.type,
          quantity: params.quantity.toString(),
          price: params.price?.toString(),
          stopLoss: params.stopLoss,
          takeProfit: params.takeProfit
        }
      }
    });

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Error placing Binance order:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to place order' 
    };
  }
};

/**
 * Gets account information from Binance
 */
export const getAccountInfo = async (accountId: string): Promise<any> => {
  try {
    const { data, error } = await supabase.functions.invoke('binance-api', {
      body: { 
        action: 'get_account_info',
        accountId
      }
    });

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Error getting Binance account info:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to get account info' 
    };
  }
};

/**
 * Closes a position on Binance
 */
export const closePosition = async (params: ClosePositionParams): Promise<any> => {
  try {
    const { data, error } = await supabase.functions.invoke('binance-api', {
      body: { 
        action: 'close_position',
        accountId: params.accountId,
        data: {
          symbol: params.symbol,
          orderId: params.orderId,
          tradeId: params.tradeId,
          quantity: params.quantity.toString(),
          pnl: params.pnl
        }
      }
    });

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Error closing Binance position:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to close position' 
    };
  }
};

/**
 * Updates the stop loss for a position on Binance
 */
export const updateStopLoss = async (params: UpdateStopLossParams): Promise<any> => {
  try {
    const { data, error } = await supabase.functions.invoke('binance-api', {
      body: { 
        action: 'update_stop_loss',
        accountId: params.accountId,
        data: {
          symbol: params.symbol,
          orderId: params.orderId,
          tradeId: params.tradeId,
          stopPrice: params.stopPrice.toString()
        }
      }
    });

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Error updating Binance stop loss:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to update stop loss' 
    };
  }
};

/**
 * Syncs a trading account with Binance
 */
export const syncAccount = async (accountId: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Start by testing the connection
    const connectionTest = await testConnection(accountId);
    if (!connectionTest.success) {
      return connectionTest;
    }
    
    // Fetch and update account info
    const accountInfo = await getAccountInfo(accountId);
    if (!accountInfo.success) {
      return { 
        success: false, 
        message: 'Failed to sync account: ' + (accountInfo.message || 'Unknown error') 
      };
    }
    
    return { 
      success: true, 
      message: 'Account synced successfully'
    };
  } catch (error) {
    console.error('Error syncing account:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to sync account'
    };
  }
};

/**
 * Starts or stops a trading bot
 */
export const controlTradingBot = async (
  action: 'start_bot' | 'stop_bot',
  botId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('trading-api', {
      body: { 
        action,
        botId
      }
    });

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error(`Error ${action === 'start_bot' ? 'starting' : 'stopping'} trading bot:`, error);
    return { 
      success: false, 
      message: error instanceof Error 
        ? error.message 
        : `Failed to ${action === 'start_bot' ? 'start' : 'stop'} trading bot`
    };
  }
};

/**
 * Executes a trade through a trading bot or manually
 */
export const executeTrade = async (
  accountId: string,
  symbol: string,
  type: 'buy' | 'sell',
  lotSize: number,
  stopLoss?: number,
  takeProfit?: number,
  botId?: string
): Promise<any> => {
  try {
    const { data, error } = await supabase.functions.invoke('trading-api', {
      body: { 
        action: 'execute_trade',
        accountId,
        botId,
        symbol,
        type,
        lotSize,
        stopLoss,
        takeProfit
      }
    });

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Error executing trade:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to execute trade'
    };
  }
};

/**
 * Gets the status and performance of a trading bot
 */
export const getBotStatus = async (botId: string): Promise<any> => {
  try {
    const { data, error } = await supabase.functions.invoke('trading-api', {
      body: { 
        action: 'get_bot_status',
        botId
      }
    });

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Error getting bot status:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to get bot status',
      bot_status: false,
      performance: {},
      recent_trades: [],
      logs: []
    };
  }
};

/**
 * Verifies and saves API credentials for a trading account
 */
export const saveApiCredentials = async (
  accountId: string,
  apiKey: string,
  apiSecret: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // First update the credentials in the database
    const { error: updateError } = await supabase
      .from('trading_accounts')
      .update({
        api_key: apiKey,
        api_secret: apiSecret,
        is_api_verified: false // Will be set to true after verification
      })
      .eq('id', accountId);

    if (updateError) throw new Error(updateError.message);
    
    // Now test the connection
    const connectionTest = await testConnection(accountId);
    
    // Update verification status based on test result
    const { error: verifyError } = await supabase
      .from('trading_accounts')
      .update({
        is_api_verified: connectionTest.success,
        connection_status: connectionTest.success
      })
      .eq('id', accountId);
      
    if (verifyError) throw new Error(verifyError.message);
    
    return connectionTest;
  } catch (error) {
    console.error('Error saving API credentials:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to save API credentials'
    };
  }
};

/**
 * Enable micro-trading for accounts with low balance
 */
export const enableMicroTrading = async (
  accountId: string,
  options: MicroTradingOptions
): Promise<{ success: boolean; message: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('binance-api', {
      body: { 
        action: 'enable_micro_trading',
        accountId,
        options
      }
    });

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Error enabling micro trading:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to enable micro trading'
    };
  }
};

/**
 * Sets optimal trading parameters for small balance accounts
 */
export const optimizeForSmallBalance = async (
  botId: string, 
  accountId: string
): Promise<{ success: boolean; message: string, settings?: any }> => {
  try {
    // First get the account info to check the balance
    const accountInfo = await getAccountInfo(accountId);
    
    if (!accountInfo.success) {
      return { 
        success: false, 
        message: 'Failed to optimize: ' + (accountInfo.message || 'Could not get account information')
      };
    }
    
    // Calculate appropriate settings based on the balance
    const balance = accountInfo.balance || 0;
    
    // Default micro-trading options
    const microOptions: MicroTradingOptions = {
      enabled: true,
      maxRiskPercentage: balance < 10 ? 1 : (balance < 50 ? 2 : 3),
      preferredPairs: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'DOGEUSDT'],
      scalping: true,
      closePositionsQuickly: true,
      useHigherLeverage: balance < 20,
      minimumOrderSize: 5
    };
    
    // Apply these settings to the bot
    const { data, error } = await supabase.functions.invoke('trading-api', {
      body: { 
        action: 'optimize_bot_for_small_balance',
        botId,
        accountId,
        microOptions
      }
    });

    if (error) throw new Error(error.message);
    
    // Also enable micro trading mode on the account
    await enableMicroTrading(accountId, microOptions);
    
    return {
      success: true,
      message: 'Bot optimized for small balance account',
      settings: microOptions
    };
  } catch (error) {
    console.error('Error optimizing bot for small balance:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to optimize bot for small balance'
    };
  }
};

/**
 * Gets the recommended trading pairs for small balance accounts
 */
export const getRecommendedPairsForSmallBalance = async (): Promise<string[]> => {
  // These are pairs that typically have lower minimum trade requirements
  // and good liquidity even for small trades
  return [
    'BTCUSDT',  // Bitcoin
    'ETHUSDT',  // Ethereum
    'BNBUSDT',  // Binance Coin
    'ADAUSDT',  // Cardano
    'DOGEUSDT', // Dogecoin
    'XRPUSDT',  // Ripple
    'TRXUSDT',  // TRON
    'LTCUSDT',  // Litecoin
    'DOTUSDT',  // Polkadot
    'MATICUSDT' // Polygon
  ];
};

/**
 * Analyzes account balance and provides optimization recommendations
 */
export const analyzeAccountForOptimization = async (
  accountId: string
): Promise<{
  success: boolean;
  message: string;
  recommendations?: {
    isSmallBalance: boolean;
    recommendedPairs: string[];
    maxRiskPerTrade: number;
    recommendedLeverage: number;
    takeProfit: number;
    stopLoss: number;
    minOrderSize: number;
  }
}> => {
  try {
    const accountInfo = await getAccountInfo(accountId);
    
    if (!accountInfo.success) {
      return { 
        success: false, 
        message: 'Failed to analyze account: ' + (accountInfo.message || 'Could not get account information')
      };
    }
    
    const balance = accountInfo.balance || 0;
    const isSmallBalance = balance < 100;
    
    // Generate recommendations based on balance
    const recommendations = {
      isSmallBalance,
      recommendedPairs: await getRecommendedPairsForSmallBalance(),
      maxRiskPerTrade: balance < 10 ? 1 : (balance < 50 ? 2 : 3),
      recommendedLeverage: balance < 20 ? 5 : (balance < 50 ? 3 : 2),
      takeProfit: balance < 50 ? 1.5 : 2.5,
      stopLoss: balance < 50 ? 1 : 2,
      minOrderSize: 5
    };
    
    return {
      success: true,
      message: `Account analyzed successfully. ${isSmallBalance ? 'This is a small balance account and has been optimized for micro-trading.' : 'This account has sufficient balance for standard trading.'}`,
      recommendations
    };
  } catch (error) {
    console.error('Error analyzing account for optimization:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to analyze account'
    };
  }
};

