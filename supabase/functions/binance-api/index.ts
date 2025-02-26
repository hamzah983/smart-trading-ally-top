
// Binance API Integration for Trading Bot
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create a Supabase client with the service role key
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

interface BinanceCredentials {
  apiKey: string;
  apiSecret: string;
}

interface Order {
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'LIMIT' | 'MARKET' | 'STOP_LOSS' | 'STOP_LOSS_LIMIT' | 'TAKE_PROFIT' | 'TAKE_PROFIT_LIMIT';
  quantity: number;
  price?: number;
  timeInForce?: 'GTC' | 'IOC' | 'FOK';
  stopPrice?: number;
}

// Get Binance credentials for a user
async function getBinanceCredentials(userId: string, accountId: string): Promise<BinanceCredentials | null> {
  const { data, error } = await supabaseAdmin
    .from('trading_accounts')
    .select('api_key, api_secret')
    .eq('user_id', userId)
    .eq('id', accountId)
    .eq('platform', 'binance')
    .single();

  if (error || !data) {
    console.error('Error fetching Binance credentials:', error);
    return null;
  }

  return {
    apiKey: data.api_key,
    apiSecret: data.api_secret
  };
}

// Generate signature for Binance API requests
function generateBinanceSignature(queryString: string, apiSecret: string): Promise<string> {
  const encoder = new TextEncoder();
  const secretKeyData = encoder.encode(apiSecret);
  const signatureData = encoder.encode(queryString);
  const signature = crypto.subtle.sign(
    { name: 'HMAC', hash: 'SHA-256' },
    secretKeyData,
    signatureData
  );
  
  return signature.then(sig => {
    return Array.from(new Uint8Array(sig))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  });
}

// Get account information from Binance
async function getBinanceAccountInfo(credentials: BinanceCredentials): Promise<Response> {
  const timestamp = Date.now();
  const queryString = `timestamp=${timestamp}`;
  const signature = await generateBinanceSignature(queryString, credentials.apiSecret);
  
  const url = `https://api.binance.com/api/v3/account?${queryString}&signature=${signature}`;
  
  return fetch(url, {
    method: 'GET',
    headers: {
      'X-MBX-APIKEY': credentials.apiKey,
      ...corsHeaders
    }
  });
}

// Get current prices from Binance
async function getBinancePrices(credentials: BinanceCredentials, symbols?: string[]): Promise<Response> {
  let url = 'https://api.binance.com/api/v3/ticker/price';
  
  if (symbols && symbols.length > 0) {
    const symbolsParam = symbols.map(s => `"${s}"`).join(',');
    url += `?symbols=[${symbolsParam}]`;
  }
  
  return fetch(url, {
    method: 'GET',
    headers: {
      'X-MBX-APIKEY': credentials.apiKey,
      ...corsHeaders
    }
  });
}

// Place an order on Binance
async function placeBinanceOrder(credentials: BinanceCredentials, order: Order): Promise<Response> {
  const timestamp = Date.now();
  
  let queryParams = new URLSearchParams();
  queryParams.append('symbol', order.symbol);
  queryParams.append('side', order.side);
  queryParams.append('type', order.type);
  queryParams.append('quantity', order.quantity.toString());
  
  if (order.price && (order.type !== 'MARKET')) {
    queryParams.append('price', order.price.toString());
  }
  
  if (order.timeInForce && order.type !== 'MARKET') {
    queryParams.append('timeInForce', order.timeInForce);
  }
  
  if (order.stopPrice && (order.type === 'STOP_LOSS' || order.type === 'STOP_LOSS_LIMIT' || order.type === 'TAKE_PROFIT' || order.type === 'TAKE_PROFIT_LIMIT')) {
    queryParams.append('stopPrice', order.stopPrice.toString());
  }
  
  queryParams.append('timestamp', timestamp.toString());
  
  const queryString = queryParams.toString();
  const signature = await generateBinanceSignature(queryString, credentials.apiSecret);
  
  const url = `https://api.binance.com/api/v3/order?${queryString}&signature=${signature}`;
  
  return fetch(url, {
    method: 'POST',
    headers: {
      'X-MBX-APIKEY': credentials.apiKey,
      ...corsHeaders
    }
  });
}

// Get order status from Binance
async function getBinanceOrderStatus(credentials: BinanceCredentials, symbol: string, orderId: number): Promise<Response> {
  const timestamp = Date.now();
  const queryString = `symbol=${symbol}&orderId=${orderId}&timestamp=${timestamp}`;
  const signature = await generateBinanceSignature(queryString, credentials.apiSecret);
  
  const url = `https://api.binance.com/api/v3/order?${queryString}&signature=${signature}`;
  
  return fetch(url, {
    method: 'GET',
    headers: {
      'X-MBX-APIKEY': credentials.apiKey,
      ...corsHeaders
    }
  });
}

// Get open orders from Binance
async function getBinanceOpenOrders(credentials: BinanceCredentials, symbol?: string): Promise<Response> {
  const timestamp = Date.now();
  let queryString = `timestamp=${timestamp}`;
  
  if (symbol) {
    queryString += `&symbol=${symbol}`;
  }
  
  const signature = await generateBinanceSignature(queryString, credentials.apiSecret);
  
  const url = `https://api.binance.com/api/v3/openOrders?${queryString}&signature=${signature}`;
  
  return fetch(url, {
    method: 'GET',
    headers: {
      'X-MBX-APIKEY': credentials.apiKey,
      ...corsHeaders
    }
  });
}

// Cancel an order on Binance
async function cancelBinanceOrder(credentials: BinanceCredentials, symbol: string, orderId: number): Promise<Response> {
  const timestamp = Date.now();
  const queryString = `symbol=${symbol}&orderId=${orderId}&timestamp=${timestamp}`;
  const signature = await generateBinanceSignature(queryString, credentials.apiSecret);
  
  const url = `https://api.binance.com/api/v3/order?${queryString}&signature=${signature}`;
  
  return fetch(url, {
    method: 'DELETE',
    headers: {
      'X-MBX-APIKEY': credentials.apiKey,
      ...corsHeaders
    }
  });
}

// Log trading activity in our database
async function logTradingActivity(userId: string, accountId: string, botId: string | null, action: string, details: any) {
  try {
    await supabaseAdmin.from('trading_logs').insert({
      user_id: userId,
      account_id: accountId,
      bot_id: botId,
      log_type: 'trading',
      message: action,
      details: details
    });
    console.log(`Logged trading activity: ${action}`);
  } catch (error) {
    console.error('Error logging trading activity:', error);
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Get the authorization header
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'No authorization header' }), { 
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Verify the JWT
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), { 
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // Get the request body
    const requestData = await req.json();
    const { accountId, action, params } = requestData;
    
    if (!accountId || !action) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get Binance credentials
    const credentials = await getBinanceCredentials(user.id, accountId);
    if (!credentials) {
      return new Response(JSON.stringify({ error: 'Binance credentials not found' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let response;
    
    // Perform the requested action
    switch (action) {
      case 'getAccountInfo':
        console.log('Getting account info for user:', user.id);
        response = await getBinanceAccountInfo(credentials);
        break;
      
      case 'getPrices':
        console.log('Getting prices for symbols:', params?.symbols || 'all');
        response = await getBinancePrices(credentials, params?.symbols);
        break;
      
      case 'placeOrder':
        console.log('Placing order:', params?.order);
        if (!params?.order) {
          return new Response(JSON.stringify({ error: 'Order parameters are required' }), { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        response = await placeBinanceOrder(credentials, params.order);
        
        // Log the order
        await logTradingActivity(
          user.id, 
          accountId, 
          params.botId || null, 
          `Place ${params.order.side} order for ${params.order.symbol}`, 
          params.order
        );
        break;
      
      case 'getOrderStatus':
        console.log('Getting order status for:', params?.symbol, params?.orderId);
        if (!params?.symbol || !params?.orderId) {
          return new Response(JSON.stringify({ error: 'Symbol and orderId are required' }), { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        response = await getBinanceOrderStatus(credentials, params.symbol, params.orderId);
        break;
      
      case 'getOpenOrders':
        console.log('Getting open orders for symbol:', params?.symbol || 'all');
        response = await getBinanceOpenOrders(credentials, params?.symbol);
        break;
      
      case 'cancelOrder':
        console.log('Cancelling order:', params?.symbol, params?.orderId);
        if (!params?.symbol || !params?.orderId) {
          return new Response(JSON.stringify({ error: 'Symbol and orderId are required' }), { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        response = await cancelBinanceOrder(credentials, params.symbol, params.orderId);
        
        // Log the cancellation
        await logTradingActivity(
          user.id, 
          accountId, 
          params.botId || null, 
          `Cancel order for ${params.symbol}`, 
          { symbol: params.symbol, orderId: params.orderId }
        );
        break;
      
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    // Parse and return the response from Binance
    const responseData = await response.json();
    
    return new Response(JSON.stringify(responseData), { 
      status: response.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
