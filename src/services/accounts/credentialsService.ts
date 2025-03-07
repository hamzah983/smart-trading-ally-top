
import { supabase, resetSupabaseHeaders } from "@/integrations/supabase/client";
import { verifyTradingPermissions } from './connectionService';

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
    
    // First, check if trading_mode column exists in the schema
    const { data: columns, error: schemaError } = await supabase
      .from('trading_accounts')
      .select('id')
      .eq('id', accountId)
      .limit(1);
      
    if (schemaError) {
      console.error('Schema error:', schemaError);
    }
    
    // Update the credentials in the database with regular client
    const updateData: Record<string, any> = {
      api_key: apiKey,
      api_secret: apiSecret,
      is_api_verified: false // Will be set to true after verification
    };
    
    // Only add trading_mode if we're confident the column exists
    try {
      const { data: account } = await supabase
        .from('trading_accounts')
        .select('trading_mode')
        .eq('id', accountId)
        .single();
        
      if (account && 'trading_mode' in account) {
        updateData.trading_mode = 'real'; // Set to real mode since we're using real API keys
      }
    } catch (err) {
      console.warn('trading_mode column may not exist:', err);
    }
    
    const { error: updateError } = await supabase
      .from('trading_accounts')
      .update(updateData)
      .eq('id', accountId);

    if (updateError) throw new Error(updateError.message);
    
    // Import needed functions from connectionService
    const { testConnection } = await import('./connectionService');
    
    // Now test the connection
    const connectionTest = await testConnection(accountId);
    
    // Verify trading permissions
    const tradingPermissions = await verifyTradingPermissions(accountId);
    
    // Update verification status based on test result
    const verifyData: Record<string, any> = {
      is_api_verified: connectionTest.success,
      connection_status: connectionTest.success
    };
    
    try {
      const { data: account } = await supabase
        .from('trading_accounts')
        .select('trading_mode')
        .eq('id', accountId)
        .single();
        
      if (account && 'trading_mode' in account) {
        verifyData.trading_mode = 'real'; // Set to real mode since we're using real API keys
      }
    } catch (err) {
      console.warn('trading_mode column may not exist:', err);
    }
    
    const { error: verifyError } = await supabase
      .from('trading_accounts')
      .update(verifyData)
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
