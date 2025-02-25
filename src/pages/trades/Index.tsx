
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
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
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [openNewTradeDialog, setOpenNewTradeDialog] = useState(false);
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

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      fetchTrades();
      setNewTrade(prev => ({ ...prev, account_id: selectedAccount }));
    }
  }, [selectedAccount]);

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
      // في البيئة الحقيقية، سيتم حساب الربح أو الخسارة بناءً على سعر الإغلاق الحالي
      // وهنا نستخدم قيمة عشوائية للتوضيح فقط
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

  const currencyPairs = [
    "EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCHF", 
    "USDCAD", "NZDUSD", "EURGBP", "EURJPY", "GBPJPY"
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">الصفقات والتداول</h1>
        <Dialog open={openNewTradeDialog} onOpenChange={setOpenNewTradeDialog}>
          <DialogTrigger asChild>
            <Button>
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

      <div className="mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">إدارة الصفقات</h2>
                <p className="text-sm text-gray-500">
                  قم بإدارة صفقاتك ومتابعة أدائها
                </p>
              </div>
              <div className="flex space-x-2 rtl:space-x-reverse">
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger className="w-[220px]">
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
                <Button variant="outline" size="icon" onClick={fetchTrades}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Tabs defaultValue="open">
              <TabsList className="mb-4">
                <TabsTrigger value="open">الصفقات المفتوحة</TabsTrigger>
                <TabsTrigger value="closed">الصفقات المغلقة</TabsTrigger>
                <TabsTrigger value="all">جميع الصفقات</TabsTrigger>
              </TabsList>
              
              <TabsContent value="open">
                <TradeTable 
                  trades={trades.filter(t => t.status === 'open')} 
                  loading={loading}
                  onCloseTrade={handleCloseTrade} 
                />
              </TabsContent>
              
              <TabsContent value="closed">
                <TradeTable 
                  trades={trades.filter(t => t.status === 'closed')} 
                  loading={loading}
                  showCloseButton={false}
                />
              </TabsContent>
              
              <TabsContent value="all">
                <TradeTable 
                  trades={trades} 
                  loading={loading}
                  onCloseTrade={handleCloseTrade} 
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface TradeTableProps {
  trades: Trade[];
  loading: boolean;
  showCloseButton?: boolean;
  onCloseTrade?: (id: string) => void;
}

const TradeTable = ({ trades, loading, showCloseButton = true, onCloseTrade }: TradeTableProps) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }
  
  if (trades.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        لا توجد صفقات للعرض
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>الرمز</TableHead>
            <TableHead>النوع</TableHead>
            <TableHead>سعر الدخول</TableHead>
            <TableHead>حجم العقد</TableHead>
            <TableHead>وقف الخسارة</TableHead>
            <TableHead>جني الربح</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>الربح/الخسارة</TableHead>
            <TableHead>التاريخ</TableHead>
            {showCloseButton && <TableHead></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((trade) => (
            <TableRow key={trade.id}>
              <TableCell className="font-medium">{trade.symbol}</TableCell>
              <TableCell>
                {trade.type === 'buy' ? (
                  <span className="flex items-center text-green-600">
                    <ArrowUp className="w-4 h-4 mr-1" /> شراء
                  </span>
                ) : (
                  <span className="flex items-center text-red-600">
                    <ArrowDown className="w-4 h-4 mr-1" /> بيع
                  </span>
                )}
              </TableCell>
              <TableCell>{trade.entry