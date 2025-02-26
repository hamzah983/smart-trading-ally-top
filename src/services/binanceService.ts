
import { supabase } from "@/integrations/supabase/client";

// أنواع البيانات
export interface BinanceOrder {
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'LIMIT' | 'MARKET' | 'STOP_LOSS' | 'STOP_LOSS_LIMIT' | 'TAKE_PROFIT' | 'TAKE_PROFIT_LIMIT';
  quantity: number;
  price?: number;
  timeInForce?: 'GTC' | 'IOC' | 'FOK';
  stopPrice?: number;
}

export interface BinanceBalance {
  asset: string;
  free: string;
  locked: string;
}

export interface BinanceAccountInfo {
  makerCommission: number;
  takerCommission: number;
  buyerCommission: number;
  sellerCommission: number;
  canTrade: boolean;
  canWithdraw: boolean;
  canDeposit: boolean;
  updateTime: number;
  accountType: string;
  balances: BinanceBalance[];
}

export interface BinancePrice {
  symbol: string;
  price: string;
}

export interface BinanceOrderResponse {
  symbol: string;
  orderId: number;
  orderListId: number;
  clientOrderId: string;
  transactTime: number;
  price: string;
  origQty: string;
  executedQty: string;
  cummulativeQuoteQty: string;
  status: string;
  timeInForce: string;
  type: string;
  side: string;
}

// استدعاء دالة Edge Function
async function callBinanceApi(accountId: string, action: string, params?: any) {
  try {
    const { data, error } = await supabase.functions.invoke('binance-api', {
      body: {
        accountId,
        action,
        params
      }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Binance API Error (${action}):`, error);
    throw error;
  }
}

// الحصول على معلومات الحساب
export async function getBinanceAccountInfo(accountId: string): Promise<BinanceAccountInfo> {
  return callBinanceApi(accountId, 'getAccountInfo');
}

// الحصول على أسعار العملات
export async function getBinancePrices(accountId: string, symbols?: string[]): Promise<BinancePrice[]> {
  return callBinanceApi(accountId, 'getPrices', { symbols });
}

// إنشاء طلب شراء/بيع جديد
export async function placeBinanceOrder(
  accountId: string,
  order: BinanceOrder,
  botId?: string
): Promise<BinanceOrderResponse> {
  return callBinanceApi(accountId, 'placeOrder', { order, botId });
}

// الحصول على حالة طلب
export async function getBinanceOrderStatus(
  accountId: string,
  symbol: string,
  orderId: number
): Promise<BinanceOrderResponse> {
  return callBinanceApi(accountId, 'getOrderStatus', { symbol, orderId });
}

// الحصول على الطلبات المفتوحة
export async function getBinanceOpenOrders(
  accountId: string,
  symbol?: string
): Promise<BinanceOrderResponse[]> {
  return callBinanceApi(accountId, 'getOpenOrders', { symbol });
}

// إلغاء طلب
export async function cancelBinanceOrder(
  accountId: string,
  symbol: string,
  orderId: number,
  botId?: string
): Promise<BinanceOrderResponse> {
  return callBinanceApi(accountId, 'cancelOrder', { symbol, orderId, botId });
}

// وظيفة مساعدة للحصول على رصيد عملة معينة
export function getAssetBalance(accountInfo: BinanceAccountInfo, asset: string): BinanceBalance | undefined {
  return accountInfo.balances.find(balance => balance.asset === asset);
}

// تحويل سعر العملة من نص إلى رقم
export function parsePrice(price: string): number {
  return parseFloat(price);
}

// تحويل كمية العملة من نص إلى رقم
export function parseQuantity(quantity: string): number {
  return parseFloat(quantity);
}

// حساب قيمة الصفقة بالدولار
export function calculateOrderValue(price: number, quantity: number): number {
  return price * quantity;
}

// حساب حجم الصفقة المناسب بناءً على نسبة المخاطرة من رأس المال
export function calculatePositionSize(
  availableBalance: number,
  currentPrice: number,
  riskPercentage: number,
  stopLossPrice?: number
): number {
  const riskAmount = availableBalance * (riskPercentage / 100);
  
  if (stopLossPrice) {
    // حساب حجم الصفقة بناءً على السعر الحالي ومستوى وقف الخسارة
    const priceDifference = Math.abs(currentPrice - stopLossPrice);
    const positionSize = riskAmount / priceDifference;
    return positionSize;
  } else {
    // حساب حجم الصفقة بناءً على نسبة المخاطرة فقط
    return riskAmount / currentPrice;
  }
}
