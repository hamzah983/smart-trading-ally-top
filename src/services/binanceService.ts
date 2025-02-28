
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
