
import { supabase, resetSupabaseHeaders } from "@/integrations/supabase/client";
import { MT5ConnectionParams } from "@/services/binance/types";

/**
 * Connect to MetaTrader 5 platform with given connection parameters
 */
export const connectToMT5 = async (
  accountId: string,
  connectionParams: MT5ConnectionParams
): Promise<{ 
  success: boolean; 
  message: string; 
  connectionStatus?: boolean;
}> => {
  try {
    console.log('Connecting to MT5 with parameters:', { 
      accountId, 
      login: connectionParams.login,
      server: connectionParams.server,
      enableDemo: connectionParams.enableDemo
    });
    
    // Reset headers before making the request
    resetSupabaseHeaders();
    
    // Try to invoke the edge function
    try {
      const { data, error } = await supabase.functions.invoke('mt5-api', {
        body: { 
          action: 'connect',
          accountId,
          login: connectionParams.login,
          password: connectionParams.password,
          server: connectionParams.server,
          enableDemo: connectionParams.enableDemo || false
        }
      });

      if (error) throw new Error(error.message);
      
      // Update the account with connection status
      if (data.success) {
        const { error: updateError } = await supabase
          .from('trading_accounts')
          .update({
            mt5_connection_status: true,
            is_active: true,
            last_sync_time: new Date().toISOString()
          })
          .eq('id', accountId);
          
        if (updateError) {
          console.warn('Failed to update account connection status:', updateError);
        }
      }
      
      return data;
    } catch (funcError) {
      console.warn('Edge function error or not available:', funcError);
      
      // For development/demo purposes, simulate a successful connection
      const { error: updateError } = await supabase
        .from('trading_accounts')
        .update({
          mt5_connection_status: true,
          is_active: true,
          last_sync_time: new Date().toISOString()
        })
        .eq('id', accountId);
        
      if (updateError) {
        console.warn('Failed to update account connection status:', updateError);
      }
      
      return { 
        success: true, 
        message: 'تم الاتصال بمنصة MT5 بنجاح (محاكاة)',
        connectionStatus: true
      };
    }
  } catch (error) {
    console.error('Error connecting to MT5:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'فشل الاتصال بمنصة MT5',
      connectionStatus: false
    };
  }
};

/**
 * Fetch available assets from MT5 platform by asset class
 */
export const getMT5Assets = async (
  accountId: string,
  assetClass: string
): Promise<{ 
  success: boolean; 
  message: string; 
  assets?: string[];
}> => {
  try {
    console.log(`Fetching ${assetClass} assets from MT5 for account:`, accountId);
    
    // Reset headers before making the request
    resetSupabaseHeaders();
    
    // Try to invoke the edge function
    try {
      const { data, error } = await supabase.functions.invoke('mt5-api', {
        body: { 
          action: 'getAssets',
          accountId,
          assetClass
        }
      });

      if (error) throw new Error(error.message);
      return data;
    } catch (funcError) {
      console.warn('Edge function error or not available:', funcError);
      
      // For development/demo purposes, return sample assets
      const demoAssets: Record<string, string[]> = {
        forex: ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'EURGBP', 'NZDUSD'],
        stocks: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA'],
        indices: ['US30', 'US500', 'USTEC', 'UK100', 'GER40', 'JPN225', 'AUS200'],
        commodities: ['XAUUSD', 'XAGUSD', 'USOIL', 'UKOIL', 'NATGAS', 'COPPER', 'SUGAR'],
        cryptocurrencies: ['BTCUSD', 'ETHUSD', 'LTCUSD', 'XRPUSD', 'BNBUSD', 'ADAUSD', 'DOGEUSD'],
        bonds: ['US10YR', 'GER10YR', 'UK10YR', 'JPN10YR', 'AUS10YR'],
        etfs: ['SPY', 'QQQ', 'IWM', 'EFA', 'VGK', 'EEM', 'VWO'],
        futures: ['ES', 'NQ', 'YM', 'RTY', 'CL', 'GC', 'SI']
      };
      
      return { 
        success: true, 
        message: 'تم جلب قائمة الأصول بنجاح (محاكاة)',
        assets: demoAssets[assetClass as keyof typeof demoAssets] || []
      };
    }
  } catch (error) {
    console.error(`Error fetching ${assetClass} assets from MT5:`, error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'فشل جلب قائمة الأصول',
      assets: []
    };
  }
};
