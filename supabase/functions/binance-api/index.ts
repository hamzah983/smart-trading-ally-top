
// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

serve(async (req) => {
  // معالجة طلبات CORS المبدئية
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // الحصول على بيانات الطلب
    const { accountId, action, params } = await req.json();
    
    // إنشاء اتصال بقاعدة البيانات
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // التحقق من accountId
    if (!accountId || accountId.trim() === '') {
      throw new Error("معرف الحساب مطلوب");
    }
    
    console.log(`Processing Binance API request: action=${action}, accountId=${accountId}`);
    
    // الحصول على بيانات الحساب من قاعدة البيانات
    const { data: accountData, error: accountError } = await supabase
      .from('trading_accounts')
      .select('api_key, api_secret, broker_name, platform')
      .eq('id', accountId)
      .single();
    
    if (accountError) {
      console.error('Error fetching account data:', accountError);
      throw new Error(`خطأ في الحصول على بيانات الحساب: ${accountError.message}`);
    }
    
    if (!accountData) {
      throw new Error("لم يتم العثور على الحساب");
    }
    
    // التحقق من مفاتيح API
    if (!accountData.api_key || !accountData.api_secret) {
      throw new Error("لم يتم تكوين مفاتيح API لهذا الحساب");
    }
    
    // تجهيز المتغيرات
    const apiKey = accountData.api_key;
    const apiSecret = accountData.api_secret;
    const platform = accountData.platform?.toLowerCase() || 'binance';
    
    // التحقق من أن الحساب هو حساب Binance
    if (platform !== 'binance') {
      throw new Error("هذا الحساب ليس حساب Binance");
    }
    
    // معالجة الإجراء المطلوب
    let data;
    switch (action) {
      case 'getAccountInfo':
        data = await getBinanceAccountInfo(apiKey, apiSecret);
        break;
      case 'getPrices':
        data = await getBinancePrices(apiKey, apiSecret, params?.symbols);
        break;
      case 'getOpenOrders':
        data = await getBinanceOpenOrders(apiKey, apiSecret, params?.symbol);
        break;
      case 'placeOrder':
        data = await placeBinanceOrder(apiKey, apiSecret, params?.order, params?.botId, supabase, accountId);
        break;
      case 'getOrderStatus':
        data = await getBinanceOrderStatus(apiKey, apiSecret, params?.symbol, params?.orderId);
        break;
      case 'cancelOrder':
        data = await cancelBinanceOrder(apiKey, apiSecret, params?.symbol, params?.orderId, params?.botId, supabase, accountId);
        break;
      default:
        throw new Error(`الإجراء غير معروف: ${action}`);
    }
    
    console.log(`Successfully processed Binance API request: action=${action}`);
    
    // إرجاع النتيجة
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
    
  } catch (error) {
    console.error('Binance API Error:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'حدث خطأ في معالجة الطلب',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

// دالة للحصول على توقيع HMAC
function getSignature(queryString: string, apiSecret: string): string {
  const encoder = new TextEncoder();
  const key = encoder.encode(apiSecret);
  const message = encoder.encode(queryString);
  
  const cryptoKey = crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  return cryptoKey.then((key) =>
    crypto.subtle.sign("HMAC", key, message)
  ).then((signature) =>
    Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  );
}

// دالة مساعدة لطلبات Binance API
async function makeSignedRequest(
  endpoint: string,
  apiKey: string,
  apiSecret: string,
  params: Record<string, any> = {},
  method = 'GET'
) {
  const baseUrl = 'https://api.binance.com';
  const timestamp = Date.now();
  const recvWindow = 60000; // نافذة استقبال طويلة نسبياً للتعامل مع التأخير
  
  // إضافة المعلمات الإلزامية
  const queryParams = new URLSearchParams({
    ...params,
    timestamp: timestamp.toString(),
    recvWindow: recvWindow.toString(),
  });
  
  // الحصول على التوقيع
  const signature = await getSignature(queryParams.toString(), apiSecret);
  queryParams.append('signature', signature);
  
  // بناء URL
  const url = `${baseUrl}${endpoint}?${queryParams.toString()}`;
  
  // إرسال الطلب
  const response = await fetch(url, {
    method,
    headers: {
      'X-MBX-APIKEY': apiKey,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  
  // التحقق من الاستجابة
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Binance API Error Response:', errorData);
    
    throw new Error(`خطأ في Binance API: ${errorData.msg || response.statusText}`);
  }
  
  return response.json();
}

// دوال خدمة Binance API
async function getBinanceAccountInfo(apiKey: string, apiSecret: string) {
  return makeSignedRequest('/api/v3/account', apiKey, apiSecret);
}

async function getBinancePrices(apiKey: string, apiSecret: string, symbols?: string[]) {
  // هذا لا يحتاج إلى توقيع
  const url = 'https://api.binance.com/api/v3/ticker/price';
  
  const response = await fetch(url, {
    headers: {
      'X-MBX-APIKEY': apiKey,
    },
  });
  
  if (!response.ok) {
    throw new Error(`Error fetching prices: ${response.statusText}`);
  }
  
  let prices = await response.json();
  
  // تصفية الأسعار إذا تم تحديد الرموز
  if (symbols && symbols.length > 0) {
    prices = prices.filter((price: any) => symbols.includes(price.symbol));
  }
  
  return prices;
}

async function getBinanceOpenOrders(apiKey: string, apiSecret: string, symbol?: string) {
  const params: Record<string, any> = {};
  if (symbol) params.symbol = symbol;
  
  return makeSignedRequest('/api/v3/openOrders', apiKey, apiSecret, params);
}

async function placeBinanceOrder(
  apiKey: string, 
  apiSecret: string, 
  order: any, 
  botId?: string,
  supabase?: any,
  accountId?: string
) {
  // التحقق من صحة الطلب
  if (!order || !order.symbol || !order.side || !order.type || !order.quantity) {
    throw new Error("بيانات الطلب غير كاملة");
  }
  
  // تكوين معلمات الطلب
  const orderParams: Record<string, any> = {
    symbol: order.symbol,
    side: order.side,
    type: order.type,
    quantity: order.quantity.toString(),
  };
  
  // إضافة معلمات إضافية حسب نوع الطلب
  if (order.price) orderParams.price = order.price.toString();
  if (order.timeInForce) orderParams.timeInForce = order.timeInForce;
  if (order.stopPrice) orderParams.stopPrice = order.stopPrice.toString();
  
  // إرسال الطلب
  const result = await makeSignedRequest(
    '/api/v3/order',
    apiKey,
    apiSecret,
    orderParams,
    'POST'
  );
  
  // تسجيل الطلب في قاعدة البيانات (اختياري)
  if (supabase && accountId) {
    try {
      await supabase.from("trading_orders").insert({
        account_id: accountId,
        bot_id: botId,
        order_id: result.orderId.toString(),
        symbol: result.symbol,
        side: result.side,
        type: result.type,
        quantity: parseFloat(result.origQty),
        price: parseFloat(result.price),
        status: result.status,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error logging order to database:', error);
      // لا نريد أن نفشل العملية إذا كان هناك خطأ في التسجيل
    }
  }
  
  return result;
}

async function getBinanceOrderStatus(apiKey: string, apiSecret: string, symbol: string, orderId: number) {
  if (!symbol || !orderId) {
    throw new Error("الرمز ومعرف الطلب مطلوبان");
  }
  
  return makeSignedRequest('/api/v3/order', apiKey, apiSecret, {
    symbol,
    orderId,
  });
}

async function cancelBinanceOrder(
  apiKey: string, 
  apiSecret: string, 
  symbol: string, 
  orderId: number,
  botId?: string,
  supabase?: any,
  accountId?: string
) {
  if (!symbol || !orderId) {
    throw new Error("الرمز ومعرف الطلب مطلوبان");
  }
  
  // إلغاء الطلب
  const result = await makeSignedRequest(
    '/api/v3/order',
    apiKey,
    apiSecret,
    { symbol, orderId },
    'DELETE'
  );
  
  // تحديث حالة الطلب في قاعدة البيانات (اختياري)
  if (supabase && accountId) {
    try {
      await supabase
        .from("trading_orders")
        .update({ status: "CANCELED", updated_at: new Date().toISOString() })
        .eq("account_id", accountId)
        .eq("order_id", orderId.toString());
    } catch (error) {
      console.error('Error updating order status in database:', error);
    }
  }
  
  return result;
}
