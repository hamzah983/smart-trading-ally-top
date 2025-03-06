import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Plus,
  ArrowUp,
  ArrowDown,
  X,
  Filter,
  RefreshCw,
  AlertTriangle,
  DollarSign,
  BarChart3,
  Search,
  Calendar,
  TrendingUp,
  TrendingDown,
  PieChart,
  Download
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { performRealTradingAnalysis } from "@/services/binance/accountService";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import TradeStatistics from "./components/TradeStatistics";
import FilterControls from "./components/FilterControls";
import TradeTable from "./components/TradeTable";
import TradeChart from "./components/TradeChart";

interface Trade {
  id: string;
  account_id: string;
  symbol: string;
  type: string;
  entry_price: number;
  lot_size: number;
  stop_loss: number | null;
  take_profit: number | null;
  status: string;
  pnl: number | null;
  created_at: string;
  closed_at: string | null;
}

interface TradingAccount {
  id: string;
  account_name: string;
  platform: string;
}

const TradesPage = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [filteredTrades, setFilteredTrades] = useState<Trade[]>([]);
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [openNewTradeDialog, setOpenNewTradeDialog] = useState(false);
  const [isRealTrading, setIsRealTrading] = useState(false);
  const [tradingAnalysis, setTradingAnalysis] = useState<any>(null);
  const [activeView, setActiveView] = useState<'table' | 'chart'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [symbolFilter, setSymbolFilter] = useState('all');
  const { toast } = useToast();

  const [newTrade, setNewTrade] = useState({
    account_id: "",
    symbol: "EURUSD",
    type: "buy",
    entry_price: 0,
    lot_size: 0.01,
    stop_loss: null as number | null,
    take_profit: null as number | null,
  });

  const fetchAccounts = async () => {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      if (!sessionData.session?.user) {
        return;
      }
      
      const { data, error } = await supabase
        .from("trading_accounts")
        .select("id, account_name, platform")
        .eq("user_id", sessionData.session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      setAccounts(data || []);
      if (data && data.length > 0 && !selectedAccount) {
        setSelectedAccount(data[0].id);
        setNewTrade(prev => ({ ...prev, account_id: data[0].id }));
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ في جلب الحسابات",
        description: error.message,
      });
    }
  };

  const fetchTrades = async () => {
    if (!selectedAccount) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .eq("account_id", selectedAccount)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTrades(data || []);
      
      checkRealTradingStatus(selectedAccount);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ في جلب الصفقات",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const checkRealTradingStatus = async (accountId: string) => {
    try {
      const analysis = await performRealTradingAnalysis(accountId);
      setTradingAnalysis(analysis);
      setIsRealTrading(analysis.isRealTrading && analysis.affectsRealMoney);
      
      if (analysis.isRealTrading && analysis.affectsRealMoney) {
        toast({
          variant: "destructive",
          title: "تنبيه: تداول حقيقي",
          description: "هذا الحساب يستخدم التداول الحقيقي ويؤثر على أموالك الفعلية!",
          duration: 10000,
        });
      }
    } catch (error) {
      console.error("Error checking real trading status:", error);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      fetchTrades();
      setNewTrade(prev => ({ ...prev, account_id: selectedAccount }));
    }
  }, [selectedAccount]);

  useEffect(() => {
    if (!trades.length) {
      setFilteredTrades([]);
      return;
    }

    let result = [...trades];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(trade => 
        trade.symbol.toLowerCase().includes(query) || 
        trade.type.toLowerCase().includes(query)
      );
    }

    if (symbolFilter !== 'all') {
      result = result.filter(trade => trade.symbol === symbolFilter);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const dayInMs = 24 * 60 * 60 * 1000;
      
      switch (dateFilter) {
        case 'today':
          const startOfDay = new Date(now.setHours(0, 0, 0, 0)).getTime();
          result = result.filter(trade => new Date(trade.created_at).getTime() >= startOfDay);
          break;
        case 'yesterday':
          const startOfYesterday = new Date(now.setHours(0, 0, 0, 0) - dayInMs).getTime();
          const endOfYesterday = new Date(now.setHours(23, 59, 59, 999) - dayInMs).getTime();
          result = result.filter(trade => {
            const tradeTime = new Date(trade.created_at).getTime();
            return tradeTime >= startOfYesterday && tradeTime <= endOfYesterday;
          });
          break;
        case 'week':
          const startOfWeek = new Date(now.getTime() - 7 * dayInMs).getTime();
          result = result.filter(trade => new Date(trade.created_at).getTime() >= startOfWeek);
          break;
        case 'month':
          const startOfMonth = new Date(now.getTime() - 30 * dayInMs).getTime();
          result = result.filter(trade => new Date(trade.created_at).getTime() >= startOfMonth);
          break;
      }
    }

    setFilteredTrades(result);
  }, [trades, searchQuery, dateFilter, symbolFilter]);

  const uniqueSymbols = trades.length 
    ? ['all', ...new Set(trades.map(trade => trade.symbol))]
    : ['all'];

  const currencyPairs = [
    "EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCHF", 
    "USDCAD", "NZDUSD", "EURGBP", "EURJPY", "GBPJPY"
  ];

  const tradeStats = {
    totalTrades: trades.length,
    openTrades: trades.filter(t => t.status === 'open').length,
    closedTrades: trades.filter(t => t.status === 'closed').length,
    profitableTrades: trades.filter(t => t.status === 'closed' && (t.pnl || 0) > 0).length,
    totalProfit: trades.filter(t => t.status === 'closed')
      .reduce((sum, trade) => sum + (trade.pnl || 0), 0),
    winRate: trades.filter(t => t.status === 'closed').length
      ? (trades.filter(t => t.status === 'closed' && (t.pnl || 0) > 0).length / 
         trades.filter(t => t.status === 'closed').length * 100).toFixed(1)
      : "0",
  };

  const chartData = trades
    .filter(t => t.status === 'closed' && t.pnl !== null)
    .map(trade => ({
      id: trade.id,
      symbol: trade.symbol,
      date: new Date(trade.closed_at || trade.created_at).toLocaleDateString('ar-SA'),
      profit: trade.pnl || 0,
      isProfit: (trade.pnl || 0) >= 0
    }));

  const exportToCsv = () => {
    if (!filteredTrades.length) return;
    
    const headers = [
      'الرمز', 'النوع', 'سعر الدخول', 'حجم العقد', 
      'وقف الخسارة', 'جني الربح', 'الحالة', 
      'الربح/الخسارة', 'تاريخ الإنشاء', 'تاريخ الإغلاق'
    ];
    
    const dataRows = filteredTrades.map(trade => [
      trade.symbol,
      trade.type === 'buy' ? 'شراء' : 'بيع',
      trade.entry_price,
      trade.lot_size,
      trade.stop_loss || '-',
      trade.take_profit || '-',
      trade.status === 'open' ? 'مفتوحة' : 'مغلقة',
      trade.pnl !== null ? trade.pnl : '-',
      new Date(trade.created_at).toLocaleDateString('ar-SA'),
      trade.closed_at ? new Date(trade.closed_at).toLocaleDateString('ar-SA') : '-'
    ]);
    
    let csvContent = headers.join(',') + '\n';
    dataRows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `trades_export_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "تم تصدير البيانات بنجاح",
      description: "تم تصدير بيانات الصفقات بتنسيق CSV"
    });
  };

  const handleCreateTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from("trades").insert({
        ...newTrade,
        entry_price: Number(newTrade.entry_price),
        lot_size: Number(newTrade.lot_size),
        stop_loss: newTrade.stop_loss ? Number(newTrade.stop_loss) : null,
        take_profit: newTrade.take_profit ? Number(newTrade.take_profit) : null,
      });

      if (error) throw error;

      toast({
        title: "تم إنشاء الصفقة بنجاح",
      });
      
      setOpenNewTradeDialog(false);
      setNewTrade({
        account_id: selectedAccount,
        symbol: "EURUSD",
        type: "buy",
        entry_price: 0,
        lot_size: 0.01,
        stop_loss: null,
        take_profit: null,
      });
      
      fetchTrades();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ في إنشاء الصفقة",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseTrade = async (tradeId: string) => {
    if (!confirm("هل أنت متأكد من إغلاق هذه الصفقة؟")) return;
    
    setLoading(true);
    try {
      const randomPnl = Math.floor(Math.random() * 200) - 100;
      
      const { error } = await supabase
        .from("trades")
        .update({
          status: "closed",
          closed_at: new Date().toISOString(),
          pnl: randomPnl
        })
        .eq("id", tradeId);

      if (error) throw error;

      toast({
        title: "تم إغلاق الصفقة بنجاح",
      });
      
      fetchTrades();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ في إغلاق الصفقة",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">الصفقات والتداول</h1>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <Button 
            variant="outline" 
            size="icon"
            className="hover:bg-hamzah-100 dark:hover:bg-hamzah-800"
            onClick={exportToCsv}
            disabled={!filteredTrades.length}
          >
            <Download className="w-4 h-4" />
          </Button>
          <Dialog open={openNewTradeDialog} onOpenChange={setOpenNewTradeDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-hamzah-500 to-hamzah-600 hover:from-hamzah-600 hover:to-hamzah-700">
                <Plus className="w-4 h-4 mr-2" />
                صفقة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>إنشاء صفقة جديدة</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTrade} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="account">الحساب</Label>
                  <Select
                    value={newTrade.account_id}
                    onValueChange={(value) =>
                      setNewTrade({ ...newTrade, account_id: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الحساب" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.account_name} ({account.platform === "mt4" ? "MT4" : "MT5"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="symbol">زوج العملات</Label>
                    <Select
                      value={newTrade.symbol}
                      onValueChange={(value) =>
                        setNewTrade({ ...newTrade, symbol: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر زوج العملات" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencyPairs.map((pair) => (
                          <SelectItem key={pair} value={pair}>
                            {pair}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">نوع الصفقة</Label>
                    <Select
                      value={newTrade.type}
                      onValueChange={(value) =>
                        setNewTrade({ ...newTrade, type: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع الصفقة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buy">شراء</SelectItem>
                        <SelectItem value="sell">بيع</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="entry_price">سعر الدخول</Label>
                    <Input
                      id="entry_price"
                      type="number"
                      step="0.00001"
                      value={newTrade.entry_price || ""}
                      onChange={(e) =>
                        setNewTrade({ ...newTrade, entry_price: parseFloat(e.target.value) || 0 })
                      }
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lot_size">حجم العقد</Label>
                    <Input
                      id="lot_size"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={newTrade.lot_size || ""}
                      onChange={(e) =>
                        setNewTrade({ ...newTrade, lot_size: parseFloat(e.target.value) || 0.01 })
                      }
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stop_loss">وقف الخسارة (اختياري)</Label>
                    <Input
                      id="stop_loss"
                      type="number"
                      step="0.00001"
                      value={newTrade.stop_loss ?? ""}
                      onChange={(e) =>
                        setNewTrade({ 
                          ...newTrade, 
                          stop_loss: e.target.value ? parseFloat(e.target.value) : null 
                        })
                      }
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="take_profit">جني الربح (اختياري)</Label>
                    <Input
                      id="take_profit"
                      type="number"
                      step="0.00001"
                      value={newTrade.take_profit ?? ""}
                      onChange={(e) =>
                        setNewTrade({ 
                          ...newTrade, 
                          take_profit: e.target.value ? parseFloat(e.target.value) : null 
                        })
                      }
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpenNewTradeDialog(false)}
                  >
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    إنشاء الصفقة
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isRealTrading && (
        <Alert 
          className="mb-6 bg-red-50 border-red-300 text-red-900 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"
        >
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="font-bold">تنبيه: تداول حقيقي يؤثر على أموالك الفعلية!</AlertTitle>
          <AlertDescription>
            هذا الحساب متصل ونشط للتداول الحقيقي. أي صفقات يتم إنشاؤها ستستخدم أموالك الحقيقية.
            يرجى توخي الحذر عند إنشاء صفقات جديدة أو إغلاق الصفقات الحالية.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">عدد الصفقات</p>
                <h3 className="text-2xl font-bold">{tradeStats.totalTrades}</h3>
              </div>
              <div className="bg-hamzah-100 dark:bg-hamzah-800 p-3 rounded-full">
                <BarChart3 className="w-5 h-5 text-hamzah-600 dark:text-hamzah-300" />
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500">مفتوحة: </span>
                <span className="text-sm font-medium">{tradeStats.openTrades}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500">مغلقة: </span>
                <span className="text-sm font-medium">{tradeStats.closedTrades}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">الصفقات الرابحة</p>
                <h3 className="text-2xl font-bold">{tradeStats.profitableTrades}</h3>
              </div>
              <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-gray-500">نسبة الربح: </span>
              <span className="text-sm font-medium">{tradeStats.winRate}%</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">الصفقات الخاسرة</p>
                <h3 className="text-2xl font-bold">{tradeStats.closedTrades - tradeStats.profitableTrades}</h3>
              </div>
              <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-full">
                <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-gray-500">نسبة الخسارة: </span>
              <span className="text-sm font-medium">
                {tradeStats.closedTrades 
                  ? (100 - parseFloat(tradeStats.winRate as string)).toFixed(1) 
                  : "0"}%
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">إجمالي الربح</p>
                <h3 className={`text-2xl font-bold ${
                  tradeStats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {tradeStats.totalProfit.toFixed(2)}$
                </h3>
              </div>
              <div className={`${
                tradeStats.totalProfit >= 0 
                  ? 'bg-green-100 dark:bg-green-900/20' 
                  : 'bg-red-100 dark:bg-red-900/20'
                } p-3 rounded-full`}>
                <DollarSign className={`w-5 h-5 ${
                  tradeStats.totalProfit >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`} />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-gray-500">متوسط الربح للصفقة: </span>
              <span className="text-sm font-medium">
                {tradeStats.closedTrades 
                  ? (tradeStats.totalProfit / tradeStats.closedTrades).toFixed(2) 
                  : "0"}$
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">إدارة الصفقات</h2>
                <p className="text-sm text-gray-500">
                  قم بإدارة صفقاتك ومتابعة أدائها
                </p>
              </div>
              
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <div className="relative w-full md:w-auto flex items-center">
                  <Search className="absolute right-3 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="بحث عن صفقة..."
                    className="pr-10 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                    <SelectTrigger className="w-full md:w-[220px]">
                      <SelectValue placeholder="اختر الحساب" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.account_name} ({account.platform === "mt4" ? "MT4" : "MT5"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={fetchTrades} title="تحديث البيانات">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <Select value={symbolFilter} onValueChange={setSymbolFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="جميع الرموز" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الرموز</SelectItem>
                  {uniqueSymbols.filter(s => s !== 'all').map((symbol) => (
                    <SelectItem key={symbol} value={symbol}>{symbol}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="فترة التداول" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الفترات</SelectItem>
                  <SelectItem value="today">اليوم</SelectItem>
                  <SelectItem value="yesterday">الأمس</SelectItem>
                  <SelectItem value="week">آخر أسبوع</SelectItem>
                  <SelectItem value="month">آخر شهر</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex-grow"></div>
              
              <div className="bg-hamzah-100 dark:bg-hamzah-800 rounded-md p-1 flex">
                <Button 
                  variant={activeView === 'table' ? 'default' : 'ghost'} 
                  size="sm"
                  className={activeView === 'table' ? '' : 'text-gray-500'}
                  onClick={() => setActiveView('table')}
                >
                  <BarChart3 className="w-4 h-4 mr-1" />
                  جدول
                </Button>
                <Button 
                  variant={activeView === 'chart' ? 'default' : 'ghost'} 
                  size="sm"
                  className={activeView === 'chart' ? '' : 'text-gray-500'}
                  onClick={() => setActiveView('chart')}
                >
                  <PieChart className="w-4 h-4 mr-1" />
                  رسم بياني
                </Button>
              </div>
            </div>

            {isRealTrading && (
              <div className="mb-4 flex items-center p-2 border border-red-300 rounded bg-red-50 text-red-800 dark:bg-red-900/10 dark:border-red-800 dark:text-red-300">
                <DollarSign className="h-5 w-5 ml-2 flex-shrink-0" />
                <span className="text-sm font-medium">هذا حساب تداول حقيقي يؤثر على أموالك الفعلية</span>
              </div>
            )}

            {activeView === 'table' ? (
              <Tabs defaultValue="open">
                <TabsList className="mb-4">
                  <TabsTrigger value="open">الصفقات المفتوحة</TabsTrigger>
                  <TabsTrigger value="closed">الصفقات المغلقة</TabsTrigger>
                  <TabsTrigger value="all">جميع الصفقات</TabsTrigger>
                </TabsList>
                
                <TabsContent value="open">
                  <TradeTable 
                    trades={filteredTrades.filter(t => t.status === 'open')} 
                    loading={loading}
                    onCloseTrade={handleCloseTrade} 
                  />
                </TabsContent>
                
                <TabsContent value="closed">
                  <TradeTable 
                    trades={filteredTrades.filter(t => t.status === 'closed')} 
                    loading={loading}
                    showCloseButton={false}
                  />
                </TabsContent>
                
                <TabsContent value="all">
                  <TradeTable 
                    trades={filteredTrades} 
                    loading={loading}
                    onCloseTrade={handleCloseTrade} 
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="mt-6">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : chartData.length > 0 ? (
                  <div className="space-y-6">
                    <div className="h-80">
                      <h3 className="text-lg font-medium mb-2">تحليل الأرباح والخسائر</h3>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={chartData}
                          margin={{
                            top: 5,
                            right: 10,
                            left: 10,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="profit" stroke="#8884d8" name="الربح/الخسارة" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="h-80">
                      <h3 className="text-lg font-medium mb-2">تصنيف الصفقات</h3>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData}
                          margin={{
                            top: 5,
                            right: 10,
                            left: 10,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="profit" name="الربح/الخسارة">
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.isProfit ? '#4ade80' : '#f87171'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    لا توجد بيانات كافية للعرض
                  </div>
                )}
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TradesPage;
