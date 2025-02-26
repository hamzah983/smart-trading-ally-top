
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
const handleCors = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  return null;
};

// Create a Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Log trading activity
const logTradingActivity = async (accountId: string, botId: string | null, logType: string, message: string, details: any = {}) => {
  try {
    await supabase.from('trading_logs').insert({
      account_id: accountId,
      bot_id: botId,
      log_type: logType,
      message: message,
      details: details
    });
  } catch (error) {
    console.error("Error logging activity:", error);
  }
};

// Authentication middleware
const authenticate = async (req: Request) => {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization header');
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) throw new Error('Invalid credentials');
    
    return user;
  } catch (error) {
    throw new Error('Authentication failed: ' + error.message);
  }
};

// Get account by ID with authorization check
const getAccountWithAuth = async (accountId: string, userId: string) => {
  const { data, error } = await supabase
    .from('trading_accounts')
    .select('*')
    .eq('id', accountId)
    .eq('user_id', userId)
    .single();
  
  if (error) throw new Error('Account not found or access denied');
  return data;
};

// Connect to MetaTrader platform
const connectToMetaTrader = async (account: any) => {
  try {
    // This would be a real connection to MetaTrader API
    console.log(`Connecting to MetaTrader for account ${account.id}...`);
    
    // Simulate API connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // If we get here, connection was successful
    return {
      success: true,
      accountInfo: {
        balance: Math.random() * 10000 + 1000,
        equity: Math.random() * 10000 + 900,
        margin: Math.random() * 500,
        marginLevel: Math.random() * 100 + 50,
        openPositions: Math.floor(Math.random() * 5)
      }
    };
  } catch (error) {
    throw new Error('MetaTrader connection error: ' + error.message);
  }
};

// Connect to Binance platform
const connectToBinance = async (account: any) => {
  try {
    // This would be a real connection to Binance API
    console.log(`Connecting to Binance for account ${account.id}...`);
    
    // Simulate API connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // If we get here, connection was successful
    return {
      success: true,
      accountInfo: {
        balance: Math.random() * 5000 + 500,
        availableBalance: Math.random() * 4500 + 400,
        totalBTC: Math.random() * 1,
        totalUSDT: Math.random() * 5000 + 500,
        openOrders: Math.floor(Math.random() * 3)
      }
    };
  } catch (error) {
    throw new Error('Binance connection error: ' + error.message);
  }
};

// Execute trade
const executeTrade = async (account: any, tradeParams: any) => {
  // This would execute a real trade through the broker's API
  console.log(`Executing trade for account ${account.id}:`, tradeParams);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simulate trade execution
  const orderId = Math.random().toString(36).substring(2, 15);
  return {
    success: true,
    orderId: orderId,
    executionPrice: tradeParams.price || (Math.random() * 10 + 90),
    executionTime: new Date().toISOString(),
    status: 'FILLED'
  };
};

// Create or update a trading bot
const updateBotPerformance = async (botId: string, performanceData: any) => {
  try {
    const { error } = await supabase
      .from('trading_bots')
      .update({
        performance_metrics: performanceData
      })
      .eq('id', botId);
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    throw new Error('Error updating bot performance: ' + error.message);
  }
};

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  
  try {
    // Authenticate the request
    let user;
    try {
      user = await authenticate(req);
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();
    
    // Parse request body
    let reqBody;
    try {
      reqBody = await req.json();
    } catch (e) {
      reqBody = {};
    }
    
    let result;
    
    // Handle different API endpoints
    switch (action) {
      case 'connect':
        {
          const accountId = reqBody.accountId;
          if (!accountId) {
            return new Response(
              JSON.stringify({ error: 'Account ID is required' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          const account = await getAccountWithAuth(accountId, user.id);
          let connectionResult;
          
          // Connect to the appropriate platform
          if (account.broker_name?.includes('MetaTrader')) {
            connectionResult = await connectToMetaTrader(account);
          } else if (account.broker_name?.includes('Binance')) {
            connectionResult = await connectToBinance(account);
          } else {
            throw new Error('Unsupported broker platform');
          }
          
          // Update account with connection results
          await supabase
            .from('trading_accounts')
            .update({
              connection_status: true,
              balance: connectionResult.accountInfo.balance,
              equity: connectionResult.accountInfo.equity || connectionResult.accountInfo.availableBalance,
              last_sync_time: new Date().toISOString()
            })
            .eq('id', accountId);
          
          await logTradingActivity(
            accountId,
            null,
            'connection',
            `Connected to ${account.broker_name}`,
            connectionResult
          );
          
          result = {
            success: true,
            message: `Successfully connected to ${account.broker_name}`,
            accountInfo: connectionResult.accountInfo
          };
        }
        break;
        
      case 'execute-trade':
        {
          const { accountId, botId, symbol, type, lotSize, price, stopLoss, takeProfit } = reqBody;
          
          if (!accountId || !symbol || !type || !lotSize) {
            return new Response(
              JSON.stringify({ error: 'Missing required trade parameters' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          const account = await getAccountWithAuth(accountId, user.id);
          
          if (!account.connection_status) {
            throw new Error('Account is not connected to trading platform');
          }
          
          const tradeResult = await executeTrade(account, {
            symbol,
            type,
            lotSize,
            price,
            stopLoss,
            takeProfit
          });
          
          // Record the trade in the database
          const { data: newTrade, error: tradeError } = await supabase
            .from('trades')
            .insert({
              account_id: accountId,
              symbol: symbol,
              type: type,
              entry_price: tradeResult.executionPrice,
              lot_size: lotSize,
              stop_loss: stopLoss,
              take_profit: takeProfit,
              status: 'open'
            })
            .select()
            .single();
          
          if (tradeError) throw tradeError;
          
          await logTradingActivity(
            accountId,
            botId,
            'trade',
            `Executed ${type} trade for ${symbol}`,
            { trade: newTrade, executionDetails: tradeResult }
          );
          
          result = {
            success: true,
            message: `Successfully executed ${type} trade for ${symbol}`,
            trade: newTrade,
            executionDetails: tradeResult
          };
        }
        break;
        
      case 'bot-performance':
        {
          const { botId, performanceData } = reqBody;
          
          if (!botId || !performanceData) {
            return new Response(
              JSON.stringify({ error: 'Bot ID and performance data are required' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          // Get the bot to verify ownership
          const { data: bot, error: botError } = await supabase
            .from('trading_bots')
            .select('account_id')
            .eq('id', botId)
            .single();
          
          if (botError) throw new Error('Bot not found');
          
          // Verify account ownership
          await getAccountWithAuth(bot.account_id, user.id);
          
          await updateBotPerformance(botId, performanceData);
          
          await logTradingActivity(
            bot.account_id,
            botId,
            'performance_update',
            'Bot performance updated',
            performanceData
          );
          
          result = {
            success: true,
            message: 'Bot performance updated successfully'
          };
        }
        break;
        
      case 'account-status':
        {
          const accountId = reqBody.accountId;
          
          if (!accountId) {
            return new Response(
              JSON.stringify({ error: 'Account ID is required' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          const account = await getAccountWithAuth(accountId, user.id);
          
          // Get recent trading activity
          const { data: recentLogs } = await supabase
            .from('trading_logs')
            .select('*')
            .eq('account_id', accountId)
            .order('created_at', { ascending: false })
            .limit(10);
          
          // Get bot statistics
          const { data: bots } = await supabase
            .from('trading_bots')
            .select('*')
            .eq('account_id', accountId);
          
          // Get active trades
          const { data: activeTrades } = await supabase
            .from('trades')
            .select('*')
            .eq('account_id', accountId)
            .eq('status', 'open');
          
          result = {
            success: true,
            account: {
              id: account.id,
              name: account.account_name,
              platform: account.platform,
              broker: account.broker_name,
              balance: account.balance,
              equity: account.equity,
              isConnected: account.connection_status,
              isTradingEnabled: account.trading_enabled,
              lastSync: account.last_sync_time
            },
            tradingActivity: {
              recentLogs,
              activeBotCount: bots.filter(b => b.is_active).length,
              totalBotCount: bots.length,
              activeTradeCount: activeTrades.length
            }
          };
        }
        break;
        
      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
    
    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('API error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
