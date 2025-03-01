import { supabase } from "@/integrations/supabase/client";
import { TradingAccount, MicroTradingOptions, AccountAnalysisResult } from "./types";

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
 * Performs a complete analysis of the trading account to verify if it's ready for real trading
 * and warns the user that their real money will be used for trading
 */
export const performRealTradingAnalysis = async (accountId: string): Promise<AccountAnalysisResult> => {
  try {
    console.log('Analyzing account for real trading readiness:', accountId);
    
    // Test API connection
    const connectionTest = await testConnection(accountId);
    if (!connectionTest.success) {
      return {
        success: false,
        message: 'الاتصال بمنصة التداول غير متاح. يرجى التحقق من مفاتيح API.',
        isRealTrading: false,
        affectsRealMoney: false,
        warnings: ['فشل الاتصال بمنصة التداول']
      };
    }
    
    // Verify trading permissions
    const permissionsCheck = await verifyTradingPermissions(accountId);
    
    // Get account information
    const accountInfo = await getAccountInfo(accountId);
    const hasBalance = (accountInfo.balance || 0) > 0;
    
    // Get account optimization recommendations
    const optimization = await analyzeAccountForOptimization(accountId);
    
    // Determine if the account is ready for real trading
    const isRealTrading = connectionTest.success && permissionsCheck.success;
    
    return {
      success: true,
      message: isRealTrading 
        ? 'الحساب جاهز للتداول الحقيقي. سيتم استخدام أموالك الفعلية للتداول!'
        : 'الحساب غير جاهز للتداول الحقيقي بعد.',
      isRealTrading,
      affectsRealMoney: isRealTrading && hasBalance,
      tradingPermissions: permissionsCheck.permissions,
      recommendedSettings: optimization.success ? {
        maxRiskPerTrade: optimization.recommendations?.maxRiskPerTrade || 2,
        recommendedPairs: optimization.recommendations?.recommendedPairs || []
      } : undefined,
      warnings: isRealTrading ? [
        'تنبيه: هذا تداول حقيقي وسيؤثر على أموالك الفعلية!',
        'تأكد من ضبط مستويات المخاطرة المناسبة قبل تفعيل التداول الآلي.',
        'نوصي بالبدء بمبلغ صغير للتأكد من سلوك الروبوت.'
      ] : [
        'الحساب غير مهيأ للتداول الحقيقي حاليًا.'
      ]
    };
  } catch (error) {
    console.error('Error analyzing real trading readiness:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'حدث خطأ أثناء تحليل الحساب',
      isRealTrading: false,
      affectsRealMoney: false,
      warnings: ['فشل تحليل جاهزية الحساب للتداول الحقيقي']
    };
  }
};
