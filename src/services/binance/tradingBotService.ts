
import { supabase } from "@/integrations/supabase/client";
import { RealTimeTradeStatus, MicroTradingOptions } from "./types";
import { enableMicroTrading } from "./accountService";
import { getAccountInfo } from "./accountService";

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
 * Force enables real trading mode for a bot (use with caution)
 */
export const enableRealTrading = async (
  botId: string,
  accountId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Enabling real trading mode for bot:', botId);
    
    const { data: accountSync } = await supabase.functions.invoke('binance-api', {
      body: { 
        action: 'sync_account',
        accountId
      }
    });
    
    if (!accountSync.success) {
      return {
        success: false,
        message: 'Cannot enable real trading: ' + accountSync.message
      };
    }
    
    const { data: permissions, error: permissionsError } = await supabase.functions.invoke('binance-api', {
      body: { 
        action: 'verify_trading_permissions',
        accountId
      }
    });
    
    if (permissionsError) throw new Error(permissionsError.message);
    if (!permissions.success) {
      return {
        success: false,
        message: 'Cannot enable real trading: ' + permissions.message
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
    
    const { data: accountSync, error: syncError } = await supabase.functions.invoke('binance-api', {
      body: { 
        action: 'sync_account',
        accountId
      }
    });
    
    if (syncError || !accountSync.success) {
      return {
        success: false,
        message: 'Account not ready for real trading: ' + (accountSync?.message || 'Sync failed'),
        readyForRealTrading: false
      };
    }
    
    const { data: permissions, error: permissionsError } = await supabase.functions.invoke('binance-api', {
      body: { 
        action: 'verify_trading_permissions',
        accountId
      }
    });
    
    if (permissionsError || !permissions.success) {
      return {
        success: false,
        message: 'Trading permissions issue: ' + (permissions?.message || 'Permission check failed'),
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
