
import { supabase } from "@/integrations/supabase/client";
import { TradingBot, BotForm } from "./types";

/**
 * Get all trading bots for an account
 */
export const getBots = async (accountId: string): Promise<TradingBot[]> => {
  try {
    const { data, error } = await supabase
      .from('trading_bots')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Error fetching bots:", error);
    throw error;
  }
};

/**
 * Create a new trading bot
 */
export const createBot = async (botData: BotForm): Promise<TradingBot> => {
  try {
    // Add default values
    const newBot = {
      ...botData,
      is_active: false,
      server_status: 'stopped',
      created_at: new Date().toISOString(),
      performance_metrics: {
        total_trades: 0,
        profitable_trades: 0,
        win_rate: 0,
        profit_loss: 0
      }
    };
    
    const { data, error } = await supabase
      .from('trading_bots')
      .insert(newBot)
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Error creating bot:", error);
    throw error;
  }
};

/**
 * Delete a trading bot
 */
export const deleteBot = async (botId: string): Promise<void> => {
  try {
    // First stop the bot if it's running
    try {
      await stopBot(botId);
    } catch (stopError) {
      console.error("Error stopping bot before deletion:", stopError);
      // Continue with deletion even if stop fails
    }
    
    const { error } = await supabase
      .from('trading_bots')
      .delete()
      .eq('id', botId);
      
    if (error) throw error;
  } catch (error) {
    console.error("Error deleting bot:", error);
    throw error;
  }
};

/**
 * Start a trading bot
 */
export const startBot = async (botId: string): Promise<any> => {
  try {
    // Call the edge function to start the bot
    const { data, error } = await supabase.functions.invoke('trading-api', {
      body: { 
        action: 'start_bot', 
        botId 
      },
    });
    
    if (error) throw new Error(error.message);
    
    return data;
  } catch (error) {
    console.error("Error starting bot:", error);
    throw error;
  }
};

/**
 * Stop a trading bot
 */
export const stopBot = async (botId: string): Promise<any> => {
  try {
    // Call the edge function to stop the bot
    const { data, error } = await supabase.functions.invoke('trading-api', {
      body: { 
        action: 'stop_bot', 
        botId 
      },
    });
    
    if (error) throw new Error(error.message);
    
    return data;
  } catch (error) {
    console.error("Error stopping bot:", error);
    throw error;
  }
};

/**
 * Get the status and performance of a trading bot
 */
export const getBotStatus = async (botId: string): Promise<any> => {
  try {
    // Call the edge function to get bot status
    const { data, error } = await supabase.functions.invoke('trading-api', {
      body: { 
        action: 'get_bot_status', 
        botId 
      },
    });
    
    if (error) throw new Error(error.message);
    
    return data;
  } catch (error) {
    console.error("Error getting bot status:", error);
    throw error;
  }
};

/**
 * Check the server status and update all running bots
 */
export const checkServerStatus = async (): Promise<any> => {
  try {
    // Call the edge function to check server status
    const { data, error } = await supabase.functions.invoke('trading-api', {
      body: { 
        action: 'check_server_status'
      },
    });
    
    if (error) throw new Error(error.message);
    
    return data;
  } catch (error) {
    console.error("Error checking server status:", error);
    throw error;
  }
};
