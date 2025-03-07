
import { supabase, resetSupabaseHeaders } from "@/integrations/supabase/client";
import { AccountAnalysisResult } from "@/services/binance/types";
import { getRecommendedPairsForSmallBalance } from './platformService';

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
    // Reset headers before making the request
    resetSupabaseHeaders();
    
    // Import getAccountInfo from connectionService
    const { getAccountInfo } = await import('./connectionService');
    
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
    
    // Import needed functions
    const { testConnection, verifyTradingPermissions, getAccountInfo } = await import('./connectionService');
    const { analyzeAccountForOptimization } = await import('./analysisService');
    
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
    
    // Check current trading mode from database
    let isRealTradingMode = true;
    try {
      const { data: account } = await supabase
        .from('trading_accounts')
        .select('trading_mode')
        .eq('id', accountId)
        .single();
        
      if (account && account.trading_mode === 'demo') {
        isRealTradingMode = false;
      }
    } catch (err) {
      console.warn('Error checking trading mode:', err);
    }
    
    // Determine if the account is ready for real trading
    const isRealTrading = connectionTest.success && permissionsCheck.success && isRealTradingMode;
    
    return {
      success: true,
      message: isRealTrading 
        ? 'الحساب جاهز للتداول الحقيقي. سيتم استخدام أموالك الفعلية للتداول!'
        : 'الحساب غير جاهز للتداول الحقيقي بعد.',
      isRealTrading,
      affectsRealMoney: isRealTrading && hasBalance,
      tradingPermissions: permissionsCheck.permissions,
      accountId, // Add accountId to the result
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
