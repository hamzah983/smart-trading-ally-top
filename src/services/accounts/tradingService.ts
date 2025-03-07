
import { supabase } from "@/integrations/supabase/client";
import { MicroTradingOptions } from "@/services/binance/types";
import { getClientWithTradingMode } from './connectionService';
import { verifyTradingPermissions } from './connectionService';

/**
 * Enable micro-trading for accounts with low balance
 */
export const enableMicroTrading = async (
  accountId: string,
  options: MicroTradingOptions
): Promise<{ success: boolean; message: string }> => {
  try {
    // Reset headers before making the request
    const { resetSupabaseHeaders } = await import("@/integrations/supabase/client");
    resetSupabaseHeaders();
    
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
 * Changes the trading mode for an account between real trading and demo mode
 */
export const changeTradingMode = async (
  accountId: string,
  mode: 'real' | 'demo'
): Promise<{ success: boolean; message: string }> => {
  try {
    console.log(`Changing trading mode to ${mode} for account:`, accountId);
    
    // Check if trading_mode column exists
    let columnExists = false;
    try {
      const { data: account } = await supabase
        .from('trading_accounts')
        .select('trading_mode')
        .eq('id', accountId)
        .single();
        
      columnExists = account !== null && 'trading_mode' in account;
    } catch (err) {
      console.warn('Error checking trading_mode column:', err);
    }
    
    if (!columnExists) {
      console.warn('trading_mode column does not exist, cannot update trading mode');
      return {
        success: false,
        message: 'لا يمكن تغيير وضع التداول. يرجى التواصل مع مدير النظام.'
      };
    }
    
    // Update the trading mode in the database
    const { error: updateError } = await supabase
      .from('trading_accounts')
      .update({
        trading_mode: mode
      })
      .eq('id', accountId);

    if (updateError) throw new Error(updateError.message);
    
    // Create a client with the appropriate trading mode
    const client = getClientWithTradingMode(mode);
    
    // Try to invoke the edge function, but don't fail if it's not available
    try {
      const { data, error } = await client.functions.invoke('binance-api', {
        body: { 
          action: 'set_trading_mode',
          accountId,
          mode
        }
      });

      if (error) {
        console.warn('Edge function error (non-fatal):', error);
      }
    } catch (error) {
      console.warn('Failed to invoke edge function (non-fatal):', error);
    }
    
    if (mode === 'real') {
      // If switching to real mode, verify trading permissions
      const tradingPermissions = await verifyTradingPermissions(accountId);
      
      if (!tradingPermissions.success) {
        return {
          success: true,
          message: `تم تغيير وضع التداول إلى ${mode === 'real' ? 'التداول الحقيقي' : 'وضع المحاكاة'}, ولكن قد تكون هناك قيود على الصلاحيات: ${tradingPermissions.message}`
        };
      }
    }
    
    return {
      success: true,
      message: `تم تغيير وضع التداول إلى ${mode === 'real' ? 'التداول الحقيقي' : 'وضع المحاكاة'} بنجاح`
    };
  } catch (error) {
    console.error('Error changing trading mode:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to change trading mode'
    };
  }
};
