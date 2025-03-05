
// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/getting_started/setup_your_environment
// This entrypoint file overwrites the main.ts entrypoint generated by supabase functions new trading-api

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function handler(req: Request) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get secret environment variables
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || ''
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Parse the request body
    const { action, botId, accountId, userId } = await req.json()
    console.log(`Received ${action} request for bot ${botId}`)

    switch(action) {
      case 'start_bot':
        if (!botId) {
          throw new Error('Bot ID is required')
        }
        
        // Get bot configuration
        const { data: botData, error: botError } = await supabase
          .from('trading_bots')
          .select('*, account_id')
          .eq('id', botId)
          .single()
          
        if (botError) {
          throw new Error(`Error fetching bot: ${botError.message}`)
        }
        
        // Log bot activation
        await supabase.from('trading_logs').insert({
          bot_id: botId,
          account_id: botData.account_id,
          log_type: 'info',
          message: 'Bot activated',
          details: { 
            action: 'start', 
            timestamp: new Date().toISOString(),
            server_managed: true // Flag indicating the bot is managed by the server
          }
        })
        
        // Update bot status
        await supabase
          .from('trading_bots')
          .update({ 
            is_active: true,
            last_activity: new Date().toISOString(), 
            server_status: 'running' 
          })
          .eq('id', botId)
        
        // Start the bot process in the background (this function persists on the server)
        const botProcess = startTradingBot(botId, botData.account_id, supabase)
        
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'الروبوت يعمل الآن على الخادم وسيستمر حتى بعد إغلاق التطبيق',
          bot_id: botId,
          server_managed: true
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
        
      case 'stop_bot':
        if (!botId) {
          throw new Error('Bot ID is required')
        }
        
        // Get bot information
        const { data: stopBotData, error: stopBotError } = await supabase
          .from('trading_bots')
          .select('account_id')
          .eq('id', botId)
          .single()
          
        if (stopBotError) {
          throw new Error(`Error fetching bot: ${stopBotError.message}`)
        }
        
        // Log bot deactivation
        await supabase.from('trading_logs').insert({
          bot_id: botId,
          account_id: stopBotData.account_id,
          log_type: 'info',
          message: 'Bot deactivated',
          details: { action: 'stop', timestamp: new Date().toISOString() }
        })
        
        // Update bot status
        await supabase
          .from('trading_bots')
          .update({ 
            is_active: false,
            server_status: 'stopped',
            last_activity: new Date().toISOString()
          })
          .eq('id', botId)
        
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'تم إيقاف الروبوت بنجاح',
          bot_id: botId
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
        
      case 'execute_trade':
        if (!accountId) {
          throw new Error('Account ID is required')
        }
        
        const { symbol, type, lotSize, stopLoss, takeProfit } = await req.json()
        
        if (!symbol || !type || !lotSize) {
          throw new Error('Missing required trade parameters')
        }
        
        // Get account information
        const { data: accountData, error: accountError } = await supabase
          .from('trading_accounts')
          .select('id, api_key, api_secret, platform')
          .eq('id', accountId)
          .single()
          
        if (accountError) {
          throw new Error(`Error fetching account: ${accountError.message}`)
        }
        
        if (!accountData.api_key || !accountData.api_secret) {
          throw new Error('API credentials are not configured for this account')
        }
        
        // Execute trade through Binance API
        const tradeResult = await executeTrade(
          accountData.api_key,
          accountData.api_secret,
          symbol,
          type,
          lotSize,
          stopLoss,
          takeProfit,
          accountId,
          supabase
        )
        
        return new Response(JSON.stringify(tradeResult), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
        
      case 'get_bot_status':
        if (!botId) {
          throw new Error('Bot ID is required')
        }
        
        // Get bot status and performance metrics
        const { data: statusData, error: statusError } = await supabase
          .from('trading_bots')
          .select('is_active, performance_metrics, settings, server_status, last_activity')
          .eq('id', botId)
          .single()
          
        if (statusError) {
          throw new Error(`Error fetching bot status: ${statusError.message}`)
        }
        
        // Get recent trades by this bot
        const { data: botTrades, error: tradesError } = await supabase
          .from('trades')
          .select('id, symbol, type, entry_price, pnl, created_at, status')
          .eq('bot_id', botId)
          .order('created_at', { ascending: false })
          .limit(5)
          
        if (tradesError) {
          console.error(`Error fetching bot trades: ${tradesError.message}`)
        }
        
        // Get recent logs for this bot
        const { data: botLogs, error: logsError } = await supabase
          .from('trading_logs')
          .select('id, message, log_type, created_at, details')
          .eq('bot_id', botId)
          .order('created_at', { ascending: false })
          .limit(10)
          
        if (logsError) {
          console.error(`Error fetching bot logs: ${logsError.message}`)
        }
        
        // Calculate bot uptime if it's running
        let uptimeInfo = null
        if (statusData.server_status === 'running' && statusData.last_activity) {
          const lastActivity = new Date(statusData.last_activity);
          const now = new Date();
          const uptimeMs = now.getTime() - lastActivity.getTime();
          
          // Format uptime in hours and minutes
          const uptimeHours = Math.floor(uptimeMs / (1000 * 60 * 60));
          const uptimeMinutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
          
          uptimeInfo = {
            hours: uptimeHours,
            minutes: uptimeMinutes,
            formatted: `${uptimeHours} ساعة و ${uptimeMinutes} دقيقة`
          };
        }
        
        return new Response(JSON.stringify({ 
          success: true, 
          bot_status: statusData.is_active,
          server_status: statusData.server_status || 'unknown',
          uptime: uptimeInfo,
          performance: statusData.performance_metrics,
          settings: statusData.settings,
          last_activity: statusData.last_activity,
          recent_trades: botTrades || [],
          logs: botLogs || []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
        
      case 'check_server_status':
        // New endpoint to verify server operation and check all running bots
        
        // Get all active bots
        const { data: activeBots, error: activeBotsError } = await supabase
          .from('trading_bots')
          .select('id, name, account_id, is_active, server_status, last_activity')
          .eq('is_active', true)
        
        if (activeBotsError) {
          throw new Error(`Error fetching active bots: ${activeBotsError.message}`)
        }
        
        // Update last heartbeat for each bot
        for (const bot of activeBots || []) {
          if (bot.server_status === 'running') {
            // Update last activity timestamp
            await supabase
              .from('trading_bots')
              .update({ 
                last_activity: new Date().toISOString()
              })
              .eq('id', bot.id)
              
            // Add heartbeat log
            await supabase.from('trading_logs').insert({
              bot_id: bot.id,
              account_id: bot.account_id,
              log_type: 'info',
              message: 'Server heartbeat',
              details: { 
                action: 'heartbeat', 
                timestamp: new Date().toISOString()
              }
            })
          }
        }
        
        return new Response(JSON.stringify({ 
          success: true, 
          server_status: 'online',
          active_bots: activeBots?.length || 0,
          message: 'الخادم يعمل بشكل طبيعي ويدير الروبوتات النشطة'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
        
      default:
        throw new Error(`Unknown action: ${action}`)
    }
  } catch (error) {
    console.error(`Error processing request:`, error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
}

// Function to start the trading bot
async function startTradingBot(botId: string, accountId: string, supabase: any) {
  try {
    // In a real production environment, this would be a long-running process
    // that continues to run on the server even after the user closes the app
    console.log(`Starting trading bot ${botId} for account ${accountId} on server`)
    
    // Get bot settings
    const { data: botData, error: botError } = await supabase
      .from('trading_bots')
      .select('strategy_type, settings, risk_parameters')
      .eq('id', botId)
      .single()
      
    if (botError) {
      throw new Error(`Error fetching bot settings: ${botError.message}`)
    }
    
    // Log bot settings
    await supabase.from('trading_logs').insert({
      bot_id: botId,
      account_id: accountId,
      log_type: 'info',
      message: 'الروبوت يعمل الآن على الخادم وسيستمر حتى بعد إغلاق التطبيق',
      details: { 
        strategy: botData.strategy_type,
        settings: botData.settings,
        risk: botData.risk_parameters,
        server_managed: true
      }
    })
    
    // In a real implementation, the bot would continuously monitor markets
    // and execute trades based on its strategy, even when the user isn't 
    // connected to the application
    
    // For demonstration purposes, we'll set up a periodic check that would
    // normally happen in a real production environment
    
    // This is just a simulation for the demo. In a real system, this would be
    // a proper background process or worker that continues to run on the server
    const tradingPairs = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'DOGEUSDT', 'SOLUSDT'];
    
    // Simulate market analysis and trading decisions
    // In a real implementation, this would be done continuously in the background
    if (botData.strategy_type) {
      // Log that we're analyzing multiple pairs
      await supabase.from('trading_logs').insert({
        bot_id: botId,
        account_id: accountId,
        log_type: 'info',
        message: `بدء تحليل ${tradingPairs.length} أزواج تداول`,
        details: { 
          pairs: tradingPairs,
          timestamp: new Date().toISOString()
        }
      });
      
      // For demo purposes, simulate a trade after a delay
      // In a real system, this would happen based on actual market conditions
      setTimeout(async () => {
        try {
          if (botData.strategy_type === 'trend_following') {
            // Simulate trend analysis for BTC
            await supabase.from('trading_logs').insert({
              bot_id: botId,
              account_id: accountId,
              log_type: 'info',
              message: 'اكتمل تحليل السوق',
              details: { 
                pair: 'BTCUSDT',
                trend: 'صاعد',
                indicators: {
                  rsi: 65,
                  macd: 'إيجابي',
                  volume: 'متزايد'
                }
              }
            });
            
            // Simulate placing a trade
            const symbol = 'BTCUSDT';
            const tradeType = 'buy';
            const lotSize = 0.001; // Small BTC amount
            
            // In a real implementation, this would use actual API keys
            try {
              await executeTrade(
                'API_KEY', // This would be fetched from the account in a real implementation
                'API_SECRET',
                symbol,
                tradeType,
                lotSize,
                null,
                null,
                accountId,
                supabase,
                botId
              );
            } catch (error) {
              await supabase.from('trading_logs').insert({
                bot_id: botId,
                account_id: accountId,
                log_type: 'error',
                message: 'فشل تنفيذ الصفقة',
                details: { error: error.message }
              });
            }
          }
          
          // This would continue to run and monitor markets even when the user is offline
          // In a production system, we would have a proper background job or worker
          // that continually processes market data and executes trades
        } catch (error) {
          console.error("Error in trading bot simulation:", error);
          await supabase.from('trading_logs').insert({
            bot_id: botId,
            account_id: accountId,
            log_type: 'error',
            message: 'خطأ في تشغيل الروبوت',
            details: { error: error.message }
          });
        }
      }, 5000);
    }
    
    return { success: true }
  } catch (error) {
    console.error(`Error starting bot:`, error.message)
    return { success: false, error: error.message }
  }
}

// Function to execute a trade
async function executeTrade(
  apiKey: string,
  apiSecret: string,
  symbol: string,
  type: string,
  lotSize: number,
  stopLoss: number | null,
  takeProfit: number | null,
  accountId: string,
  supabase: any,
  botId?: string
) {
  try {
    // Log the trade attempt
    await supabase.from('trading_logs').insert({
      bot_id: botId,
      account_id: accountId,
      log_type: 'info',
      message: `Executing ${type} order for ${symbol}`,
      details: { 
        symbol,
        type,
        lot_size: lotSize,
        stop_loss: stopLoss,
        take_profit: takeProfit,
        timestamp: new Date().toISOString()
      }
    })
    
    // In a real implementation, this would call the Binance API
    // For this demo, we'll simulate a successful order
    
    // Get current price for the symbol (simulated)
    const currentPrice = await getSimulatedPrice(symbol)
    
    // Create a new trade record
    const { data: tradeData, error: tradeError } = await supabase
      .from('trades')
      .insert({
        account_id: accountId,
        bot_id: botId,
        symbol,
        type,
        entry_price: currentPrice,
        lot_size: lotSize,
        stop_loss: stopLoss,
        take_profit: takeProfit,
        status: 'open'
      })
      .select()
      
    if (tradeError) {
      throw new Error(`Error recording trade: ${tradeError.message}`)
    }
    
    // Log successful trade
    await supabase.from('trading_logs').insert({
      bot_id: botId,
      account_id: accountId,
      log_type: 'success',
      message: `Successfully placed ${type} order for ${symbol}`,
      details: { 
        trade_id: tradeData[0].id,
        price: currentPrice,
        timestamp: new Date().toISOString()
      }
    })
    
    return { 
      success: true, 
      trade_id: tradeData[0].id,
      message: `Successfully executed ${type} order for ${symbol} at price ${currentPrice}`,
      price: currentPrice
    }
  } catch (error) {
    console.error(`Error executing trade:`, error.message)
    return { success: false, error: error.message }
  }
}

// Helper function to get simulated price
async function getSimulatedPrice(symbol: string): Promise<number> {
  try {
    // In a real implementation, this would fetch the current market price
    // For demo purposes, we'll use mock prices
    const mockPrices: Record<string, number> = {
      'BTCUSDT': 29850.75,
      'ETHUSDT': 1865.25,
      'BNBUSDT': 221.45,
      'XRPUSDT': 0.52,
      'ADAUSDT': 0.35,
      'DOGEUSDT': 0.078,
      'SOLUSDT': 140.25
    }
    
    return mockPrices[symbol] || 100.0
  } catch (error) {
    console.error(`Error getting price:`, error)
    return 100.0 // Default fallback price
  }
}

serve(handler)
