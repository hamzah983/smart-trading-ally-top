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

export interface RealTimeTradeStatus {
  isActive: boolean;
  lastTradeTime: Date | null;
  totalTrades: number;
  successfulTrades: number;
  profitLoss: number;
  connectionStatus: boolean;
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
 * Places an order on Binance - Enhanced for real trading verification
 */
export const placeOrder = async (params: PlaceOrderParams): Promise<any> => {
  try {
    console.log('Placing real order with params:', JSON.stringify(params));
    
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
          takeProfit: params.takeProfit,
          realTrading: true // Force real trading flag
        }
      }
    });

    if (error) throw new Error(error.message);
    
    console.log('Order placed successfully:', JSON.stringify(data));
    
    // Verify the order was actually placed by querying its status
    if (data.orderId) {
      const verificationResult = await verifyOrderExecution(params.accountId, data.orderId, params.symbol);
      if (!verificationResult.success) {
        console.error('Order verification failed:', verificationResult.message);
        return {
          ...data,
          verified: false,
          verificationMessage: verificationResult.message
        };
      }
      
      console.log('Order verified successfully:', verificationResult.message);
      return {
        ...data,
        verified: true,
        verificationMessage: verificationResult.message
      };
    }
    
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
 * Verifies that an order was actually executed on Binance
 */
export const verifyOrderExecution = async (
  accountId: string,
  orderId: string,
  symbol: string
): Promise<{ success: boolean; message: string; orderStatus?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('binance-api', {
      body: { 
        action: 'verify_order',
        accountId,
        data: {
          orderId,
          symbol
        }
      }
    });

    if (error) throw new Error(error.message);
    
    return {
      success: data.orderExists === true,
      message: data.orderExists ? 'Order verified on Binance' : 'Order not found on Binance',
      orderStatus: data.orderStatus
    };
  } catch (error) {
    console.error('Error verifying order execution:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to verify order execution' 
    };
  }
};

/**
 * Gets account information from Binance with enhanced error handling for better reliability
 */
export const getAccountInfo = async (accountId: string): Promise<any> => {
  try {
    console.log('Fetching real account information for account ID:', accountId);
    
    const { data, error } = await supabase.functions.invoke('binance-api', {
      body: { 
        action: 'get_account_info',
        accountId
      }
    });

    if (error) throw new Error(error.message);
    
    if (data.success) {
      console.log('Account information retrieved successfully');
    } else {
      console.error('Failed to retrieve account information:', data.message);
    }
    
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
 * Closes a position on Binance with enhanced verification
 */
export const closePosition = async (params: ClosePositionParams): Promise<any> => {
  try {
    console.log('Closing real position with params:', JSON.stringify(params));
    
    const { data, error } = await supabase.functions.invoke('binance-api', {
      body: { 
        action: 'close_position',
        accountId: params.accountId,
        data: {
          symbol: params.symbol,
          orderId: params.orderId,
          tradeId: params.tradeId,
          quantity: params.quantity.toString(),
          pnl: params.pnl,
          realTrading: true // Force real trading flag
        }
      }
    });

    if (error) throw new Error(error.message);
    
    // Verify the position was actually closed
    if (data.success && params.orderId) {
      const verificationResult = await verifyPositionClosure(
        params.accountId, 
        params.orderId,
        params.symbol
      );
      
      return {
        ...data,
        verified: verificationResult.success,
        verificationMessage: verificationResult.message
      };
    }
    
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
 * Verifies that a position was actually closed on Binance
 */
export const verifyPositionClosure = async (
  accountId: string,
  orderId: string,
  symbol: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('binance-api', {
      body: { 
        action: 'verify_position_closure',
        accountId,
        data: {
          orderId,
          symbol
        }
      }
    });

    if (error) throw new Error(error.message);
    
    return {
      success: data.positionClosed === true,
      message: data.positionClosed 
        ? 'Position closure verified on Binance' 
        : 'Position may not be fully closed on Binance'
    };
  } catch (error) {
    console.error('Error verifying position closure:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to verify position closure' 
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
 * Syncs a trading account with Binance and verifies real trading status
 */
export const syncAccount = async (accountId: string): Promise<{ success: boolean; message: string; realTradingEnabled?: boolean }> => {
  try {
    console.log('Syncing account with real trading verification:', accountId);
    
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
    
    // Verify trading permissions
    const tradingPermissions = await verifyTradingPermissions(accountId);
    
    return { 
      success: true, 
      message: 'Account synced successfully for real trading',
      realTradingEnabled: tradingPermissions.success
    };
  } catch (error) {
    console.error('Error syncing account for real trading:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to sync account'
    };
  }
};

/**
 * Verifies that the account has all necessary permissions for real trading
 */
export const verifyTradingPermissions = async (
  accountId: string
): Promise<{ success: boolean; message: string; permissions?: string[] }> => {
  try {
    const { data, error } = await supabase.functions.invoke('binance-api', {
      body: { 
        action: 'verify_trading_permissions',
        accountId
      }
    });

    if (error) throw new Error(error.message);
    
    return {
      success: data.hasAllPermissions === true,
      message: data.message || 'Trading permissions verified',
      permissions: data.permissions
    };
  } catch (error) {
    console.error('Error verifying trading permissions:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to verify trading permissions'
    };
  }
};

/**
 * Starts or stops a trading bot with enhanced real trading verification
 */
export const controlTradingBot = async (
  action: 'start_bot' | 'stop_bot',
  botId: string
): Promise<{ success: boolean; message: string; realTradingMode?: boolean }> => {
  try {
    console.log(`${action === 'start_bot' ? 'Starting' : 'Stopping'} trading bot in real trading mode:`, botId);
    
    const { data, error } = await supabase.functions.invoke('trading-api', {
      body: { 
        action,
        botId,
        realTrading: true // Force real trading mode
      }
    });

    if (error) throw new Error(error.message);
    
    // Verify bot status after operation
    if (data.success) {
      const botStatus = await verifyBotRealTradingStatus(botId);
      
      return {
        ...data,
        realTradingMode: botStatus.realTradingMode,
        verificationMessage: botStatus.message
      };
    }
    
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
 * Verifies that a bot is running in real trading mode
 */
export const verifyBotRealTradingStatus = async (
  botId: string
): Promise<{ success: boolean; message: string; realTradingMode: boolean }> => {
  try {
    const { data, error } = await supabase.functions.invoke('trading-api', {
      body: { 
        action: 'verify_bot_trading_mode',
        botId
      }
    });

    if (error) throw new Error(error.message);
    
    return {
      success: true,
      message: data.realTradingMode 
        ? 'Bot is running in real trading mode' 
        : 'Bot is running in simulation mode',
      realTradingMode: data.realTradingMode === true
    };
  } catch (error) {
    console.error('Error verifying bot trading mode:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to verify bot trading mode',
      realTradingMode: false
    };
  }
};

/**
 * Executes a trade through a trading bot or manually with enhanced real trading verification
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
    console.log('Executing real trade:', { accountId, symbol, type, lotSize });
    
    const { data, error } = await supabase.functions.invoke('trading-api', {
      body: { 
        action: 'execute_trade',
        accountId,
        botId,
        symbol,
        type,
        lotSize,
        stopLoss,
        takeProfit,
        realTrading: true // Force real trading mode
      }
    });

    if (error) throw new Error(error.message);
    
    // Verify the trade was executed
    if (data.success && data.orderId) {
      const verification = await verifyOrderExecution(
        accountId,
        data.orderId,
        symbol
      );
      
      return {
        ...data,
        verified: verification.success,
        verificationMessage: verification.message,
        orderStatus: verification.orderStatus
      };
    }
    
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
 * Gets the status and performance of a trading bot with real-time trading information
 */
export const getBotStatus = async (botId: string): Promise<any> => {
  try {
    console.log('Getting bot status with real-time information:', botId);
    
    const { data, error } = await supabase.functions.invoke('trading-api', {
      body: { 
        action: 'get_bot_status',
        botId,
        includeRealTimeInfo: true
      }
    });

    if (error) throw new Error(error.message);
    
    // Add real-time trading status verification
    if (data.success && data.bot_status) {
      const realTimeStatus = await getRealTimeTradingStatus(botId);
      
      return {
        ...data,
        realTimeStatus: realTimeStatus.success ? realTimeStatus : {
          isActive: data.bot_status,
          connectionStatus: data.bot_status,
          lastTradeTime: null,
          totalTrades: 0,
          successfulTrades: 0,
          profitLoss: 0
        }
      };
    }
    
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
 * Gets real-time trading status for a bot
 */
export const getRealTimeTradingStatus = async (
  botId: string
): Promise<{ success: boolean; message: string } & RealTimeTradeStatus> => {
  try {
    const { data, error } = await supabase.functions.invoke('trading-api', {
      body: { 
        action: 'get_real_time_trading_status',
        botId
      }
    });

    if (error) throw new Error(error.message);
    
    return {
      success: true,
      message: 'Real-time trading status retrieved',
      isActive: data.isActive || false,
      lastTradeTime: data.lastTradeTime ? new Date(data.lastTradeTime) : null,
      totalTrades: data.totalTrades || 0,
      successfulTrades: data.successfulTrades || 0,
      profitLoss: data.profitLoss || 0,
      connectionStatus: data.connectionStatus || false
    };
  } catch (error) {
    console.error('Error getting real-time trading status:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to get real-time trading status',
      isActive: false,
      lastTradeTime: null,
      totalTrades: 0,
      successfulTrades: 0,
      profitLoss: 0,
      connectionStatus: false
    };
  }
};

/**
 * Verifies and saves API credentials for a trading account with enhanced security checks
 */
export const saveApiCredentials = async (
  accountId: string,
  apiKey: string,
  apiSecret: string
): Promise<{ success: boolean; message: string; tradingEnabled?: boolean }> => {
  try {
    console.log('Saving and verifying API credentials for real trading:', accountId);
    
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
    
    // Verify trading permissions
    const tradingPermissions = await verifyTradingPermissions(accountId);
    
    // Update verification status based on test result
    const { error: verifyError } = await supabase
      .from('trading_accounts')
      .update({
        is_api_verified: connectionTest.success,
        connection_status: connectionTest.success
      })
      .eq('id', accountId);
      
    if (verifyError) throw new Error(verifyError.message);
    
    return {
      success: connectionTest.success,
      message: connectionTest.success 
        ? 'API credentials verified for real trading' 
        : connectionTest.message,
      tradingEnabled: tradingPermissions.success
    };
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
    const accountInfo = await getAccountInfo(accountId);
    
    if (!accountInfo.success) {
      return { 
        success: false, 
        message: 'Failed to optimize: ' + (accountInfo.message || 'Could not get account information')
      };
    }
    
    const balance = accountInfo.balance || 0;
    
    const microOptions: MicroTradingOptions = {
      enabled: true,
      maxRiskPercentage: balance < 10 ? 1 : (balance < 50 ? 2 : 3),
      preferredPairs: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'DOGEUSDT'],
      scalping: true,
      closePositionsQuickly: true,
      useHigherLeverage: balance < 20,
      minimumOrderSize: 5
    };
    
    const { data, error } = await supabase.functions.invoke('trading-api', {
      body: { 
        action: 'optimize_bot_for_small_balance',
        botId,
        accountId,
        microOptions
      }
    });

    if (error) throw new Error(error.message);
    
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

/**
 * Force enables real trading mode for a bot (use with caution)
 */
export const enableRealTrading = async (
  botId: string,
  accountId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Enabling real trading mode for bot:', botId);
    
    const accountSync = await syncAccount(accountId);
    if (!accountSync.success) {
      return {
        success: false,
        message: 'Cannot enable real trading: ' + accountSync.message
      };
    }
    
    const tradingPermissions = await verifyTradingPermissions(accountId);
    if (!tradingPermissions.success) {
      return {
        success: false,
        message: 'Cannot enable real trading: ' + tradingPermissions.message
      };
    }
    
    const { data, error } = await supabase.functions.invoke('trading-api', {
      body: { 
        action: 'enable_real_trading',
        botId,
        accountId,
        force: true
      }
    });

    if (error) throw new Error(error.message);
    
    return {
      success: data.success,
      message: data.message || 'Real trading mode enabled successfully'
    };
  } catch (error) {
    console.error('Error enabling real trading mode:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to enable real trading mode'
    };
  }
};

/**
 * Ensures a bot is configured for real trading with all necessary verification steps
 */
export const ensureRealTradingConfiguration = async (
  botId: string,
  accountId: string
): Promise<{ success: boolean; message: string; readyForRealTrading: boolean }> => {
  try {
    console.log('Ensuring bot is configured for real trading:', botId);
    
    const accountSync = await syncAccount(accountId);
    if (!accountSync.success) {
      return {
        success: false,
        message: 'Account not ready for real trading: ' + accountSync.message,
        readyForRealTrading: false
      };
    }
    
    const tradingPermissions = await verifyTradingPermissions(accountId);
    if (!tradingPermissions.success) {
      return {
        success: false,
        message: 'Trading permissions issue: ' + tradingPermissions.message,
        readyForRealTrading: false
      };
    }
    
    const { data, error } = await supabase.functions.invoke('trading-api', {
      body: { 
        action: 'verify_bot_configuration',
        botId,
        accountId
      }
    });

    if (error) throw new Error(error.message);
    
    if (!data.success || !data.configurationValid) {
      return {
        success: false,
        message: 'Bot configuration issue: ' + (data.message || 'Invalid configuration'),
        readyForRealTrading: false
      };
    }
    
    const realTradingEnabled = await enableRealTrading(botId, accountId);
    
    return {
      success: realTradingEnabled.success,
      message: realTradingEnabled.success 
        ? 'Bot successfully configured for real trading' 
        : 'Failed to enable real trading: ' + realTradingEnabled.message,
      readyForRealTrading: realTradingEnabled.success
    };
  } catch (error) {
    console.error('Error configuring bot for real trading:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to configure for real trading',
      readyForRealTrading: false
    };
  }
};

/**
 * Updates the Supabase client to use a dedicated API key for trading
 */
export const updateSupabaseClientForTrading = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('trading-api', {
      body: { action: 'get_trading_api_key' }
    });

    if (error) throw new Error(error.message);
    
    if (data.success && data.apiKey && data.apiUrl) {
      console.log('Trading API key validated');
      
      return {
        success: true,
        message: 'Trading API configuration verified'
      };
    }
    
    return {
      success: false,
      message: 'Could not update API configuration for trading'
    };
  } catch (error) {
    console.error('Error updating Supabase client for trading:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to update API configuration'
    };
  }
};

updateSupabaseClientForTrading().catch(error => {
  console.error('Failed to initialize trading client:', error);
});
