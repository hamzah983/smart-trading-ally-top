import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  RefreshCw, 
  Loader2, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Clock,
  CheckCircle, 
  AlertCircle 
} from "lucide-react";

import { 
  getAccountInfo, 
  placeOrder, 
  TradingAccount,
  PlaceOrderParams
} from "@/services/binanceService";
import { supabase } from "@/integrations/supabase/client";

interface BinanceTradingProps {
  accountId: string;
}

interface BinanceAccountInfo {
  success: boolean;
  totalBalance?: number;
  totalEquity?: number;
  balances?: Array<{
    asset: string;
    free: string;
    locked: string;
  }>;
  positions?: any[];
  message?: string;
}

interface BinancePrice {
  symbol: string;
  price: string;
}

interface BinanceOrderResponse {
  orderId: number;
  symbol: string;
  side: string;
  type: string;
  price: string;
  origQty: string;
  status: string;
}

const commonPairs = [
  "BTCUSDT", "ETHUSDT", "BNBUSDT", "ADAUSDT", "DOGEUSDT", 
  "XRPUSDT", "DOTUSDT", "SOLUSDT", "MATICUSDT", "LINKUSDT"
];

const BinanceTrading: React.FC<BinanceTradingProps> = ({ accountId }) => {
  const [accountInfo, setAccountInfo] = useState<BinanceAccountInfo | null>(null);
  const [prices, setPrices] = useState<BinancePrice[]>([]);
  const [openOrders, setOpenOrders] = useState<BinanceOrderResponse[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");
  const [orderType, setOrderType] = useState<"MARKET" | "LIMIT">("MARKET");
  const [orderSide, setOrderSide] = useState<"BUY" | "SELL">("BUY");
  const [orderQuantity, setOrderQuantity] = useState("");
  const [orderPrice, setOrderPrice] = useState("");
  const [activeTab, setActiveTab] = useState("market");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState({
    account: false,
    prices: false,
    orders: false
  });
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    if (accountId) {
      fetchAccountInfo();
      fetchPrices();
      fetchOpenOrders();
      
      const priceInterval = setInterval(() => {
        fetchPrices();
      }, 10000);
      
      return () => clearInterval(priceInterval);
    }
  }, [accountId]);

  const fetchAccountInfo = async () => {
    try {
      setError(null);
      setRefreshing(prev => ({ ...prev, account: true }));
      const data = await getAccountInfo(accountId);
      setAccountInfo(data);
    } catch (error: any) {
      console.error("Binance Account Info Error:", error);
      setError(`خطأ في جلب معلومات الحساب: ${error.message || 'Edge Function returned a non-2xx status code'}`);
      toast({
        variant: "destructive",
        title: "خطأ في جلب معلومات الحساب",
        description: error.message || "تحقق من اتصال API وصلاحيات المفاتيح"
      });
    } finally {
      setRefreshing(prev => ({ ...prev, account: false }));
    }
  };

  const fetchPrices = async () => {
    try {
      setRefreshing(prev => ({ ...prev, prices: true }));
      
      const response = await fetch('https://api.binance.com/api/v3/ticker/price');
      if (!response.ok) {
        throw new Error('Failed to fetch prices from Binance API');
      }
      
      const allPrices = await response.json();
      
      const filteredPrices = allPrices.filter((price: BinancePrice) => 
        commonPairs.includes(price.symbol)
      );
      
      setPrices(filteredPrices);
    } catch (error: any) {
      console.error("Binance Prices Error:", error);
      toast({
        variant: "destructive",
        title: "خطأ في جلب الأسعار",
        description: error.message || "تحقق من اتصال API"
      });
    } finally {
      setRefreshing(prev => ({ ...prev, prices: false }));
    }
  };

  const fetchOpenOrders = async () => {
    try {
      setRefreshing(prev => ({ ...prev, orders: true }));
      
      const { data, error } = await supabase.functions.invoke('binance-api', {
        body: { 
          action: 'get_open_orders',
          accountId
        }
      });
      
      if (error) throw new Error(error.message);
      
      if (data.success && data.orders) {
        setOpenOrders(data.orders);
      } else {
        throw new Error(data.message || 'Failed to fetch open orders');
      }
    } catch (error: any) {
      console.error("Binance Open Orders Error:", error);
      toast({
        variant: "destructive",
        title: "خطأ في جلب الطلبات المفتوحة",
        description: error.message || "تحقق من اتصال API"
      });
    } finally {
      setRefreshing(prev => ({ ...prev, orders: false }));
    }
  };

  const submitOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!orderQuantity || parseFloat(orderQuantity) <= 0) {
        throw new Error("الرجاء إدخال كمية صحيحة");
      }
      
      if (orderType === "LIMIT" && (!orderPrice || parseFloat(orderPrice) <= 0)) {
        throw new Error("الرجاء إدخال سعر صحيح للطلب المحدد");
      }
      
      const params: PlaceOrderParams = {
        accountId,
        symbol: selectedSymbol,
        side: orderSide.toLowerCase() as 'buy' | 'sell',
        type: orderType.toLowerCase() as 'market' | 'limit',
        quantity: parseFloat(orderQuantity)
      };
      
      if (orderType === "LIMIT" && orderPrice) {
        params.price = parseFloat(orderPrice);
      }
      
      const response = await placeOrder(params);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to place order');
      }
      
      toast({
        title: "تم إرسال الطلب بنجاح",
        description: `رقم الطلب: ${response.orderId}`
      });
      
      setOrderQuantity("");
      setOrderPrice("");
      
      fetchAccountInfo();
      fetchOpenOrders();
    } catch (error: any) {
      console.error("Submit Order Error:", error);
      setError(`خطأ في إرسال الطلب: ${error.message || "تحقق من إعدادات API"}`);
      toast({
        variant: "destructive",
        title: "خطأ في إرسال الطلب",
        description: error.message || "تحقق من صلاحيات API للتداول"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (symbol: string, orderId: number) => {
    try {
      setError(null);
      
      const { data, error } = await supabase.functions.invoke('binance-api', {
        body: { 
          action: 'cancel_order',
          accountId,
          data: {
            symbol,
            orderId
          }
        }
      });
      
      if (error) throw new Error(error.message);
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to cancel order');
      }
      
      toast({
        title: "تم إلغاء الطلب بنجاح"
      });
      
      fetchOpenOrders();
    } catch (error: any) {
      console.error("Cancel Order Error:", error);
      toast({
        variant: "destructive",
        title: "خطأ في إلغاء الطلب",
        description: error.message || "تعذر إلغاء الطلب"
      });
    }
  };

  const getCurrentPrice = (symbol: string): string => {
    const priceInfo = prices.find(p => p.symbol === symbol);
    return priceInfo ? priceInfo.price : "0";
  };

  const calculateTotalOrderValue = (): string => {
    const price = orderType === "LIMIT" 
      ? parseFloat(orderPrice || "0") 
      : parseFloat(getCurrentPrice(selectedSymbol));
    
    const quantity = parseFloat(orderQuantity || "0");
    
    if (price && quantity) {
      return (price * quantity).toFixed(2);
    }
    
    return "0";
  };

  const usePercentageOfBalance = (percentage: number) => {
    if (!accountInfo || !accountInfo.balances) return;
    
    const baseAsset = selectedSymbol.replace("USDT", "");
    
    let balance;
    if (orderSide === "BUY") {
      balance = accountInfo.balances.find(b => b.asset === "USDT");
    } else {
      balance = accountInfo.balances.find(b => b.asset === baseAsset);
    }
    
    if (balance) {
      const availableAmount = parseFloat(balance.free);
      const currentPrice = parseFloat(getCurrentPrice(selectedSymbol));
      
      if (orderSide === "BUY") {
        const amount = availableAmount * (percentage / 100);
        const quantity = amount / currentPrice;
        setOrderQuantity(quantity.toFixed(6));
      } else {
        const quantity = availableAmount * (percentage / 100);
        setOrderQuantity(quantity.toFixed(6));
      }
    }
  };

  useEffect(() => {
    if (orderType === "LIMIT") {
      const currentPrice = getCurrentPrice(selectedSymbol);
      setOrderPrice(currentPrice);
    }
  }, [selectedSymbol, orderType]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">منصة التداول على Binance</h2>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <Button variant="outline" size="sm" onClick={fetchAccountInfo} disabled={refreshing.account}>
            {refreshing.account ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="mr-2">تحديث الحساب</span>
          </Button>
          <Button variant="outline" size="sm" onClick={fetchPrices} disabled={refreshing.prices}>
            {refreshing.prices ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="mr-2">تحديث الأسعار</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 mt-0.5 mr-2" />
            <span>{error}</span>
          </div>
          <div className="mt-2 text-sm">
            <p>تأكد من:</p>
            <ul className="list-disc list-inside pl-2">
              <li>صلاحية مفاتيح API</li>
              <li>تفعيل صلاحيات القراءة والتداول</li>
              <li>إضافة عنوان IP الحالي إلى القائمة البيضاء</li>
            </ul>
          </div>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">معلومات الحساب</CardTitle>
        </CardHeader>
        <CardContent>
          {accountInfo && accountInfo.success ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">USDT متاح</p>
                  <p className="text-xl font-semibold">
                    {accountInfo.balances?.find(b => b.asset === "USDT")?.free || "0"} USDT
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">BTC متاح</p>
                  <p className="text-xl font-semibold">
                    {accountInfo.balances?.find(b => b.asset === "BTC")?.free || "0"} BTC
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">ETH متاح</p>
                  <p className="text-xl font-semibold">
                    {accountInfo.balances?.find(b => b.asset === "ETH")?.free || "0"} ETH
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">الأصول الأخرى</p>
                <div className="grid grid-cols-4 gap-2">
                  {accountInfo.balances
                    ?.filter(balance => 
                      parseFloat(balance.free) > 0 && 
                      !["USDT", "BTC", "ETH"].includes(balance.asset)
                    )
                    .slice(0, 8)
                    .map(balance => (
                      <div key={balance.asset} className="bg-gray-50 p-2 rounded">
                        <p className="font-medium">{balance.asset}</p>
                        <p className="text-sm">{balance.free}</p>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              {refreshing.account ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p>جاري تحميل معلومات الحساب...</p>
                </>
              ) : (
                <>
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <p>لم يتم العثور على معلومات الحساب. اضغط على زر "تحديث الحساب" للمحاولة مرة أخرى.</p>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">أسعار العملات الرقمية</CardTitle>
        </CardHeader>
        <CardContent>
          {prices.length > 0 ? (
            <div className="grid grid-cols-5 gap-4">
              {prices.map(price => (
                <div 
                  key={price.symbol} 
                  className={`p-3 rounded-lg cursor-pointer border-2 transition-all
                    ${selectedSymbol === price.symbol 
                      ? 'border-hamzah-500 bg-hamzah-50' 
                      : 'border-transparent hover:bg-gray-50'
                    }`}
                  onClick={() => setSelectedSymbol(price.symbol)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{price.symbol.replace("USDT", "")}</span>
                    <span className="text-xs text-gray-500">USDT</span>
                  </div>
                  <p className="text-lg font-bold mt-1">{parseFloat(price.price).toFixed(2)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              {refreshing.prices ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p>جاري تحميل الأسعار...</p>
                </>
              ) : (
                <>
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <p>لم يتم العثور على أسعار. اضغط على زر "تحديث الأسعار" للمحاولة مرة أخرى.</p>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">إنشاء طلب جديد</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="market">أمر سوق</TabsTrigger>
              <TabsTrigger value="limit">أمر محدد</TabsTrigger>
            </TabsList>
            
            <TabsContent value="market">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="symbol">الزوج</Label>
                    <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الزوج" />
                      </SelectTrigger>
                      <SelectContent>
                        {commonPairs.map(pair => (
                          <SelectItem key={pair} value={pair}>{pair}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="side">نوع الأمر</Label>
                    <div className="flex mt-1">
                      <Button
                        type="button"
                        variant={orderSide === "BUY" ? "success" : "outline"}
                        className="w-1/2"
                        onClick={() => setOrderSide("BUY")}
                      >
                        شراء
                      </Button>
                      <Button
                        type="button"
                        variant={orderSide === "SELL" ? "destructive" : "outline"}
                        className="w-1/2"
                        onClick={() => setOrderSide("SELL")}
                      >
                        بيع
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="price">السعر الحالي</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      id="price"
                      value={getCurrentPrice(selectedSymbol)}
                      readOnly
                      className="pl-8"
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="quantity">الكمية</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.000001"
                    value={orderQuantity}
                    onChange={e => setOrderQuantity(e.target.value)}
                    placeholder={`أدخل كمية ${selectedSymbol.replace("USDT", "")}`}
                  />
                  <div className="flex space-x-1 rtl:space-x-reverse mt-1">
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => usePercentageOfBalance(25)}>25%</Button>
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => usePercentageOfBalance(50)}>50%</Button>
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => usePercentageOfBalance(75)}>75%</Button>
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => usePercentageOfBalance(100)}>100%</Button>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-gray-600">إجمالي القيمة:</span>
                    <span className="font-bold">{calculateTotalOrderValue()} USDT</span>
                  </div>
                </div>
                
                <Button
                  variant={orderSide === "BUY" ? "success" : "destructive"}
                  className="w-full"
                  onClick={() => {
                    setOrderType("MARKET");
                    submitOrder();
                  }}
                  disabled={loading || !accountInfo}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {orderSide === "BUY" ? "شراء" : "بيع"} {selectedSymbol.replace("USDT", "")}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="limit">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="symbol">الزوج</Label>
                    <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الزوج" />
                      </SelectTrigger>
                      <SelectContent>
                        {commonPairs.map(pair => (
                          <SelectItem key={pair} value={pair}>{pair}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="side">نوع الأمر</Label>
                    <div className="flex mt-1">
                      <Button
                        type="button"
                        variant={orderSide === "BUY" ? "success" : "outline"}
                        className="w-1/2"
                        onClick={() => setOrderSide("BUY")}
                      >
                        شراء
                      </Button>
                      <Button
                        type="button"
                        variant={orderSide === "SELL" ? "destructive" : "outline"}
                        className="w-1/2"
                        onClick={() => setOrderSide("SELL")}
                      >
                        بيع
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="limitPrice">السعر المطلوب</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      id="limitPrice"
                      type="number"
                      step="0.01"
                      value={orderPrice}
                      onChange={e => setOrderPrice(e.target.value)}
                      className="pl-8"
                      placeholder="أدخل السعر المطلوب"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>السعر الحالي: {parseFloat(getCurrentPrice(selectedSymbol)).toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="quantity">الكمية</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.000001"
                    value={orderQuantity}
                    onChange={e => setOrderQuantity(e.target.value)}
                    placeholder={`أدخل كمية ${selectedSymbol.replace("USDT", "")}`}
                  />
                  <div className="flex space-x-1 rtl:space-x-reverse mt-1">
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => usePercentageOfBalance(25)}>25%</Button>
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => usePercentageOfBalance(50)}>50%</Button>
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => usePercentageOfBalance(75)}>75%</Button>
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => usePercentageOfBalance(100)}>100%</Button>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-gray-600">إجمالي القيمة:</span>
                    <span className="font-bold">{calculateTotalOrderValue()} USDT</span>
                  </div>
                </div>
                
                <Button
                  variant={orderSide === "BUY" ? "success" : "destructive"}
                  className="w-full"
                  onClick={() => {
                    setOrderType("LIMIT");
                    submitOrder();
                  }}
                  disabled={loading || !accountInfo}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {orderSide === "BUY" ? "شراء" : "بيع"} بسعر محدد
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">الطلبات المفتوحة</CardTitle>
          <Button variant="outline" size="sm" onClick={fetchOpenOrders} disabled={refreshing.orders}>
            {refreshing.orders ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="mr-2">تحديث</span>
          </Button>
        </CardHeader>
        <CardContent>
          {openOrders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الزوج</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>السعر</TableHead>
                  <TableHead>الكمية</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {openOrders.map(order => (
                  <TableRow key={order.orderId}>
                    <TableCell className="font-medium">{order.symbol}</TableCell>
                    <TableCell>
                      <Badge variant={order.side === "BUY" ? "success" : "destructive"}>
                        {order.side === "BUY" ? "شراء" : "بيع"}
                      </Badge>
                    </TableCell>
                    <TableCell>{parseFloat(order.price).toFixed(2)}</TableCell>
                    <TableCell>{parseFloat(order.origQty).toFixed(6)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleCancelOrder(order.symbol, order.orderId)}
                      >
                        إلغاء
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {refreshing.orders ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p>جاري تحميل الطلبات...</p>
                </>
              ) : (
                "لا توجد طلبات مفتوحة حالياً"
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BinanceTrading;
