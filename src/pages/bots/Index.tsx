
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { 
  Loader2, Plus, Power, LineChart, Activity, Settings2, AlertTriangle, 
  CheckCircle2, Play, Pause, Trash2, BarChart4, BrainCircuit, Clock, 
  Calendar, TrendingUp, Info, HelpCircle, ArrowUpRight, X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

interface TradingBot {
  id: string;
  name: string;
  strategy_type: string;
  is_active: boolean;
  account_id: string;
  settings: any;
  risk_parameters: any;
  performance_metrics: any;
  created_at: string;
  updated_at: string;
}

interface TradingAccount {
  id: string;
  account_name: string;
  platform: string;
}

const BotsPage = () => {
  const navigate = useNavigate();
  const [bots, setBots] = useState<TradingBot[]>([]);
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [openNewBotDialog, setOpenNewBotDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{open: boolean, botId: string | null, action: 'delete' | 'toggle'}>({
    open: false,
    botId: null,
    action: 'delete'
  });
  const { toast } = useToast();

  const [newBot, setNewBot] = useState({
    name: "",
    strategy_type: "",
    account_id: "",
    risk_level: "medium",
    max_daily_trades: 5,
    use_stop_loss: true,
    stop_loss_percentage: 2,
    use_take_profit: true,
    take_profit_percentage: 5,
    trading_hours: {
      start: "00:00",
      end: "23:59"
    },
    max_risk_per_trade: 1,
    preferred_pairs: ["EURUSD", "GBPUSD"]
  });

  // الاستراتيجيات المتاحة للروبوتات
  const botStrategies = [
    { id: "trend_following", name: "متابعة الترند", description: "استراتيجية تتبع الاتجاه العام للسوق" },
    { id: "breakout_strategy", name: "اختراق المستويات", description: "تداول عند اختراق مستويات الدعم والمقاومة" },
    { id: "mean_reversion", name: "العودة للمتوسط", description: "تداول عندما يبتعد السعر كثيراً عن المتوسط" },
    { id: "grid_trading", name: "التداول الشبكي", description: "تنفيذ صفقات عند مستويات سعرية محددة مسبقاً" },
    { id: "scalping", name: "سكالبينج", description: "تداول سريع للحصول على أرباح صغيرة متكررة" },
  ];

  // أزواج العملات المتاحة
  const availablePairs = [
    "EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCHF", "USDCAD", "NZDUSD",
    "EURGBP", "EURJPY", "GBPJPY", "AUDJPY", "EURAUD", "EURCHF", "GBPCAD"
  ];

  // الرسوم البيانية العشوائية للعرض فقط - في التطبيق الحقيقي ستكون مبنية على بيانات فعلية
  const randomPerformance = () => {
    const winRate = 55 + Math.floor(Math.random() * 25); // 55%-80%
    const totalTrades = 10 + Math.floor(Math.random() * 90); // 10-100
    const profitFactor = (1 + Math.random() * 1.5).toFixed(2); // 1.00-2.50
    const averageProfit = (5 + Math.random() * 20).toFixed(2); // $5-$25
    const drawdown = (5 + Math.random() * 10).toFixed(2); // 5%-15%
    
    return {
      winRate,
      totalTrades,
      profitFactor,
      averageProfit,
      drawdown
    };
  };

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
      if (data && data.length > 0) {
        setNewBot(prev => ({ ...prev, account_id: data[0].id }));
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ في جلب الحسابات",
        description: error.message,
      });
    }
  };

  const fetchBots = async () => {
    setLoading(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      if (!sessionData.session?.user) {
        return;
      }
      
      // أولاً نجلب الحسابات للمستخدم الحالي
      const { data: accountsData, error: accountsError } = await supabase
        .from("trading_accounts")
        .select("id")
        .eq("user_id", sessionData.session.user.id);

      if (accountsError) throw accountsError;
      
      if (!accountsData || accountsData.length === 0) {
        setBots([]);
        setLoading(false);
        return;
      }
      
      // ثم نجلب الروبوتات المرتبطة بتلك الحسابات
      const accountIds = accountsData.map(acc => acc.id);
      const { data, error } = await supabase
        .from("trading_bots")
        .select("*")
        .in("account_id", accountIds)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBots(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ في جلب الروبوتات",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchBots();
  }, []);

  const handleCreateBot = async () => {
    setLoading(true);
    try {
      // إعداد بيانات الروبوت
      const botData = {
        name: newBot.name,
        strategy_type: newBot.strategy_type,
        account_id: newBot.account_id,
        is_active: false,
        settings: {
          max_daily_trades: newBot.max_daily_trades,
          trading_hours: newBot.trading_hours,
          preferred_pairs: newBot.preferred_pairs
        },
        risk_parameters: {
          risk_level: newBot.risk_level,
          max_risk_per_trade: newBot.max_risk_per_trade,
          use_stop_loss: newBot.use_stop_loss,
          stop_loss_percentage: newBot.stop_loss_percentage,
          use_take_profit: newBot.use_take_profit,
          take_profit_percentage: newBot.take_profit_percentage
        },
        performance_metrics: {
          total_trades: 0,
          winning_trades: 0,
          losing_trades: 0,
          profit_factor: 0,
          total_profit: 0,
          max_drawdown: 0
        }
      };

      const { error } = await supabase.from("trading_bots").insert(botData);

      if (error) throw error;

      toast({
        title: "تم إنشاء الروبوت بنجاح",
        description: "يمكنك الآن تفعيله لبدء التداول"
      });
      
      setOpenNewBotDialog(false);
      setNewBot({
        name: "",
        strategy_type: "",
        account_id: accounts.length > 0 ? accounts[0].id : "",
        risk_level: "medium",
        max_daily_trades: 5,
        use_stop_loss: true,
        stop_loss_percentage: 2,
        use_take_profit: true,
        take_profit_percentage: 5,
        trading_hours: {
          start: "00:00",
          end: "23:59"
        },
        max_risk_per_trade: 1,
        preferred_pairs: ["EURUSD", "GBPUSD"]
      });
      
      fetchBots();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ في إنشاء الروبوت",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBot = async (botId: string, currentState: boolean) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("trading_bots")
        .update({ is_active: !currentState })
        .eq("id", botId);

      if (error) throw error;

      toast({
        title: `تم ${!currentState ? 'تفعيل' : 'إيقاف'} الروبوت بنجاح`,
      });
      
      fetchBots();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: `خطأ في ${!currentState ? 'تفعيل' : 'إيقاف'} الروبوت`,
        description: error.message,
      });
    } finally {
      setLoading(false);
      setConfirmDialog({ open: false, botId: null, action: 'delete' });
    }
  };

  const handleDeleteBot = async (botId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("trading_bots")
        .delete()
        .eq("id", botId);

      if (error) throw error;

      toast({
        title: "تم حذف الروبوت بنجاح",
      });
      
      fetchBots();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ في حذف الروبوت",
        description: error.message,
      });
    } finally {
      setLoading(false);
      setConfirmDialog({ open: false, botId: null, action: 'delete' });
    }
  };

  const getAccountById = (accountId: string) => {
    return accounts.find(account => account.id === accountId);
  };
  
  const getStrategyNameById = (strategyId: string) => {
    const strategy = botStrategies.find(strategy => strategy.id === strategyId);
    return strategy ? strategy.name : strategyId;
  };

  const handleConfirmAction = () => {
    if (!confirmDialog.botId) return;
    
    if (confirmDialog.action === 'delete') {
      handleDeleteBot(confirmDialog.botId);
    } else if (confirmDialog.action === 'toggle') {
      const bot = bots.find(b => b.id === confirmDialog.botId);
      if (bot) {
        handleToggleBot(confirmDialog.botId, bot.is_active);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">روبوتات التداول الآلي</h1>
          <p className="text-gray-500 mt-1">أتمتة استراتيجيات التداول الخاصة بك</p>
        </div>
        <Dialog open={openNewBotDialog} onOpenChange={setOpenNewBotDialog}>
          <DialogTrigger asChild>
            <Button disabled={accounts.length === 0}>
              <Plus className="w-4 h-4 mr-2" />
              إنشاء روبوت جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>إنشاء روبوت تداول جديد</DialogTitle>
              <DialogDescription>
                قم بتكوين روبوت التداول الآلي الخاص بك لتنفيذ استراتيجيتك
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="basic" className="mt-4">
              <TabsList className="mb-4 w-full">
                <TabsTrigger value="basic" className="flex-1">المعلومات الأساسية</TabsTrigger>
                <TabsTrigger value="strategy" className="flex-1">الاستراتيجية</TabsTrigger>
                <TabsTrigger value="risk" className="flex-1">إدارة المخاطر</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">اسم الروبوت</Label>
                  <Input
                    id="name"
                    value={newBot.name}
                    onChange={(e) => setNewBot({ ...newBot, name: e.target.value })}
                    placeholder="أدخل اسماً وصفياً للروبوت"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="account">حساب التداول</Label>
                  <Select
                    value={newBot.account_id}
                    onValueChange={(value) => setNewBot({ ...newBot, account_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر حساب التداول" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.account_name} ({account.platform === "mt4" ? "MT4" : account.platform === "mt5" ? "MT5" : account.platform.toUpperCase()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="strategy_type">نوع الاستراتيجية</Label>
                  <Select
                    value={newBot.strategy_type}
                    onValueChange={(value) => setNewBot({ ...newBot, strategy_type: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع استراتيجية التداول" />
                    </SelectTrigger>
                    <SelectContent>
                      {botStrategies.map((strategy) => (
                        <SelectItem key={strategy.id} value={strategy.id}>
                          {strategy.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {newBot.strategy_type && (
                    <p className="text-sm text-gray-500 mt-1">
                      {botStrategies.find(s => s.id === newBot.strategy_type)?.description}
                    </p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="strategy" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="max_daily_trades">
                    <div className="flex items-center gap-1">
                      الحد الأقصى للصفقات اليومية
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-4 w-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-[250px] text-sm">أقصى عدد من الصفقات التي يمكن للروبوت تنفيذها في اليوم الواحد</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </Label>
                  <div className="flex gap-2 items-center">
                    <Slider
                      min={1}
                      max={20}
                      step={1}
                      value={[newBot.max_daily_trades]}
                      onValueChange={(value) => setNewBot({ ...newBot, max_daily_trades: value[0] })}
                      className="flex-1"
                    />
                    <span className="w-10 text-center">{newBot.max_daily_trades}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="trading_hours">ساعات التداول</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_time" className="text-sm">وقت البدء</Label>
                      <Input
                        id="start_time"
                        type="time"
                        value={newBot.trading_hours.start}
                        onChange={(e) => setNewBot({ 
                          ...newBot, 
                          trading_hours: { ...newBot.trading_hours, start: e.target.value } 
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_time" className="text-sm">وقت الانتهاء</Label>
                      <Input
                        id="end_time"
                        type="time"
                        value={newBot.trading_hours.end}
                        onChange={(e) => setNewBot({ 
                          ...newBot, 
                          trading_hours: { ...newBot.trading_hours, end: e.target.value } 
                        })}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="preferred_pairs">
                    <div className="flex items-center gap-1">
                      أزواج العملات المفضلة
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-4 w-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-[250px] text-sm">أزواج العملات التي سيتداول عليها الروبوت</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder={`${newBot.preferred_pairs.length} أزواج مختارة`} />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePairs.map((pair) => (
                        <div key={pair} className="flex items-center space-x-2 p-2 rtl:space-x-reverse">
                          <input
                            type="checkbox"
                            id={`pair-${pair}`}
                            checked={newBot.preferred_pairs.includes(pair)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewBot({
                                  ...newBot,
                                  preferred_pairs: [...newBot.preferred_pairs, pair]
                                });
                              } else {
                                setNewBot({
                                  ...newBot,
                                  preferred_pairs: newBot.preferred_pairs.filter(p => p !== pair)
                                });
                              }
                            }}
                            className="mr-2 rtl:ml-2"
                          />
                          <label htmlFor={`pair-${pair}`}>{pair}</label>
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newBot.preferred_pairs.map(pair => (
                      <Badge key={pair} variant="secondary" className="px-2 py-1 flex items-center">
                        {pair}
                        <button 
                          onClick={() => setNewBot({
                            ...newBot,
                            preferred_pairs: newBot.preferred_pairs.filter(p => p !== pair)
                          })}
                          className="ml-2 text-gray-500 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="risk" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="risk_level">مستوى المخاطرة</Label>
                  <Select
                    value={newBot.risk_level}
                    onValueChange={(value) => setNewBot({ ...newBot, risk_level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر مستوى المخاطرة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">منخفض (متحفظ)</SelectItem>
                      <SelectItem value="medium">متوسط (متوازن)</SelectItem>
                      <SelectItem value="high">مرتفع (جريء)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max_risk_per_trade">
                    <div className="flex items-center gap-1">
                      الحد الأقصى للمخاطرة بكل صفقة (% من الرصيد)
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-4 w-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-[250px] text-sm">النسبة المئوية التي يمكن للروبوت أن يخاطر بها في كل صفقة</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </Label>
                  <div className="flex gap-2 items-center">
                    <Slider
                      min={0.5}
                      max={5}
                      step={0.5}
                      value={[newBot.max_risk_per_trade]}
                      onValueChange={(value) => setNewBot({ ...newBot, max_risk_per_trade: value[0] })}
                      className="flex-1"
                    />
                    <span className="w-10 text-center">{newBot.max_risk_per_trade}%</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="use_stop_loss">استخدام وقف الخسارة</Label>
                      <p className="text-sm text-muted-foreground">تحديد نقطة خروج تلقائية لتقليل الخسائر</p>
                    </div>
                    <Switch
                      checked={newBot.use_stop_loss}
                      onCheckedChange={(checked) => setNewBot({ ...newBot, use_stop_loss: checked })}
                    />
                  </div>
                  
                  {newBot.use_stop_loss && (
                    <div className="space-y-2">
                      <Label htmlFor="stop_loss_percentage">نسبة وقف الخسارة (%)</Label>
                      <div className="flex gap-2 items-center">
                        <Slider
                          min={0.5}
                          max={5}
                          step={0.5}
                          value={[newBot.stop_loss_percentage]}
                          onValueChange={(value) => setNewBot({ ...newBot, stop_loss_percentage: value[0] })}
                          className="flex-1"
                        />
                        <span className="w-10 text-center">{newBot.stop_loss_percentage}%</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="use_take_profit">استخدام جني الأرباح</Label>
                      <p className="text-sm text-muted-foreground">تحديد نقطة خروج تلقائية لتأمين الأرباح</p>
                    </div>
                    <Switch
                      checked={newBot.use_take_profit}
                      onCheckedChange={(checked) => setNewBot({ ...newBot, use_take_profit: checked })}
                    />
                  </div>
                  
                  {newBot.use_take_profit && (
                    <div className="space-y-2">
                      <Label htmlFor="take_profit_percentage">نسبة جني الأرباح (%)</Label>
                      <div className="flex gap-2 items-center">
                        <Slider
                          min={1}
                          max={10}
                          step={0.5}
                          value={[newBot.take_profit_percentage]}
                          onValueChange={(value) => setNewBot({ ...newBot, take_profit_percentage: value[0] })}
                          className="flex-1"
                        />
                        <span className="w-10 text-center">{newBot.take_profit_percentage}%</span>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setOpenNewBotDialog(false)}>
                إلغاء
              </Button>
              <Button type="button" onClick={handleCreateBot} disabled={!newBot.name || !newBot.strategy_type || !newBot.account_id || loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                إنشاء الروبوت
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {accounts.length === 0 ? (
        <Card className="my-8 p-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">لا توجد حسابات تداول</h2>
            <p className="text-gray-500 mb-6">
              يجب عليك إضافة حساب تداول قبل أن تتمكن من إنشاء روبوتات تداول آلية.
            </p>
            <Button onClick={() => navigate('/accounts')}>
              إضافة حساب تداول
            </Button>
          </div>
        </Card>
      ) : loading && bots.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : bots.length === 0 ? (
        <Card className="my-8 p-6">
          <div className="text-center">
            <BrainCircuit className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">لا توجد روبوتات بعد</h2>
            <p className="text-gray-500 mb-6">
              قم بإنشاء روبوت تداول جديد للبدء في التداول الآلي.
            </p>
            <Button onClick={() => setOpenNewBotDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              إنشاء روبوت جديد
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <Tabs defaultValue="all">
            <TabsList className="mb-6">
              <TabsTrigger value="all">جميع الروبوتات</TabsTrigger>
              <TabsTrigger value="active">الروبوتات النشطة</TabsTrigger>
              <TabsTrigger value="inactive">الروبوتات المتوقفة</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {bots.map((bot) => (
                  <BotCard 
                    key={bot.id} 
                    bot={bot} 
                    accounts={accounts} 
                    botStrategies={botStrategies}
                    onToggle={() => setConfirmDialog({ 
                      open: true, 
                      botId: bot.id, 
                      action: 'toggle' 
                    })}
                    onDelete={() => setConfirmDialog({ 
                      open: true, 
                      botId: bot.id, 
                      action: 'delete' 
                    })}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="active">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {bots.filter(bot => bot.is_active).map((bot) => (
                  <BotCard 
                    key={bot.id} 
                    bot={bot} 
                    accounts={accounts} 
                    botStrategies={botStrategies}
                    onToggle={() => setConfirmDialog({ 
                      open: true, 
                      botId: bot.id, 
                      action: 'toggle' 
                    })}
                    onDelete={() => setConfirmDialog({ 
                      open: true, 
                      botId: bot.id, 
                      action: 'delete' 
                    })}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="inactive">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {bots.filter(bot => !bot.is_active).map((bot) => (
                  <BotCard 
                    key={bot.id} 
                    bot={bot} 
                    accounts={accounts} 
                    botStrategies={botStrategies}
                    onToggle={() => setConfirmDialog({ 
                      open: true, 
                      botId: bot.id, 
                      action: 'toggle' 
                    })}
                    onDelete={() => setConfirmDialog({ 
                      open: true, 
                      botId: bot.id, 
                      action: 'delete' 
                    })}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
          
          {/* دليل استخدام الروبوتات */}
          <Card className="mt-8 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-900">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3 rtl:space-x-reverse">
                <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-800 dark:text-blue-300">كيفية استخدام روبوتات التداول:</h3>
                  <ul className="mt-2 space-y-2 text-sm text-blue-800 dark:text-blue-300 list-disc list-inside">
                    <li>قم بإنشاء روبوت واختر استراتيجية التداول المناسبة لك</li>
                    <li>اضبط إعدادات المخاطرة بما يتناسب مع احتياجاتك</li>
                    <li>قم بتفعيل الروبوت للبدء في التداول التلقائي</li>
                    <li>راقب أداء الروبوت من خلال مؤشرات الأداء والرسوم البيانية</li>
                    <li>يمكنك إيقاف الروبوت مؤقتاً في أي وقت</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* مربع حوار التأكيد */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({...confirmDialog, open})}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.action === 'delete' ? 'تأكيد حذف الروبوت' : 'تأكيد تغيير حالة الروبوت'}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.action === 'delete' 
                ? 'هل أنت متأكد من رغبتك في حذف هذا الروبوت؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'هل أنت متأكد من رغبتك في تغيير حالة هذا الروبوت؟'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialog({...confirmDialog, open: false})}
            >
              إلغاء
            </Button>
            <Button 
              variant={confirmDialog.action === 'delete' ? 'destructive' : 'default'} 
              onClick={handleConfirmAction}
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {confirmDialog.action === 'delete' ? 'حذف' : 'تأكيد'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// مكون بطاقة الروبوت
interface BotCardProps {
  bot: TradingBot;
  accounts: TradingAccount[];
  botStrategies: { id: string; name: string; description: string }[];
  onToggle: () => void;
  onDelete: () => void;
}

const BotCard = ({ bot, accounts, botStrategies, onToggle, onDelete }: BotCardProps) => {
  const account = accounts.find(acc => acc.id === bot.account_id);
  const strategy = botStrategies.find(s => s.id === bot.strategy_type);
  
  // بيانات الأداء العشوائية للعرض فقط (في التطبيق الحقيقي ستكون من قاعدة البيانات)
  const performance = bot.performance_metrics && Object.keys(bot.performance_metrics).length > 0 
    ? bot.performance_metrics 
    : {
        winRate: 55 + Math.floor(Math.random() * 25),
        totalTrades: 10 + Math.floor(Math.random() * 90),
        profitFactor: (1 + Math.random() * 1.5).toFixed(2),
        averageProfit: (5 + Math.random() * 20).toFixed(2),
        drawdown: (5 + Math.random() * 10).toFixed(2)
      };
  
  // تاريخ التحديث بصيغة مقروءة
  const formattedDate = new Date(bot.updated_at).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <Card className={`${bot.is_active ? 'border-green-200 dark:border-green-900' : 'border-gray-200 dark:border-gray-800'}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              {bot.name}
              {bot.is_active ? (
                <Badge variant="success" className="ml-2">نشط</Badge>
              ) : (
                <Badge variant="outline" className="ml-2">متوقف</Badge>
              )}
            </CardTitle>
            <div className="text-sm text-gray-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>{account?.account_name || 'غير معروف'}</span>
              <span>•</span>
              <span>{strategy?.name || bot.strategy_type}</span>
            </div>
          </div>
          <div className="flex space-x-1 rtl:space-x-reverse">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className={bot.is_active ? "text-amber-500 hover:text-amber-700" : "text-green-500 hover:text-green-700"}
            >
              {bot.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="pt-4 pb-2">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-sm text-gray-500">نسبة الفوز</div>
              <div className="text-2xl font-semibold mt-1">{performance.winRate}%</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">الصفقات</div>
              <div className="text-2xl font-semibold mt-1">{performance.totalTrades}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">عامل الربح</div>
              <div className="text-2xl font-semibold mt-1">{performance.profitFactor}</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm mb-1">
              <span>أداء الروبوت:</span>
              <span className="text-green-600">+38.5%</span>
            </div>
            <Progress value={38.5} className="h-2" />
          </div>
          
          <div className="mt-4 pt-4 border-t flex justify-between text-xs text-gray-500">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>آخر تحديث: {formattedDate}</span>
            </div>
            <div>
              {bot.risk_parameters?.risk_level && (
                <div className="flex items-center">
                  <AlertTriangle className={`h-3 w-3 mr-1 ${
                    bot.risk_parameters.risk_level === 'low' ? 'text-green-500' :
                    bot.risk_parameters.risk_level === 'medium' ? 'text-amber-500' : 'text-red-500'
                  }`} />
                  <span>المخاطرة: {
                    bot.risk_parameters.risk_level === 'low' ? 'منخفضة' :
                    bot.risk_parameters.risk_level === 'medium' ? 'متوسطة' : 'عالية'
                  }</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BotsPage;
