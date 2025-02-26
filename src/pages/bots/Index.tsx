
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Loader2,
  Plus,
  Play,
  Pause,
  Settings,
  Zap,
  Shield,
  TrendingUp,
  FileBar,
  BarChart3,
  RefreshCw,
  Trash2,
  AlertCircle,
  CheckCircle,
  BrainCircuit,
  ArrowUpRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";

interface TradingBot {
  id: string;
  account_id: string;
  name: string;
  strategy_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  settings: Record<string, any>;
  risk_parameters: Record<string, any>;
  performance_metrics: Record<string, any>;
}

interface TradingAccount {
  id: string;
  account_name: string;
  platform: string;
  broker_name?: string;
  connection_status?: boolean;
  trading_enabled?: boolean;
}

const strategyTypes = [
  { value: "trend_following", label: "متابعة الترند" },
  { value: "breakout", label: "اختراق المستويات" },
  { value: "mean_reversion", label: "العودة للمتوسط" },
  { value: "oscillator", label: "المذبذبات" },
  { value: "support_resistance", label: "الدعم والمقاومة" },
  { value: "machine_learning", label: "التعلم الآلي" },
  { value: "arbitrage", label: "المراجحة" },
  { value: "grid", label: "التداول الشبكي" },
  { value: "martingale", label: "مارتينجيل" },
  { value: "custom", label: "استراتيجية مخصصة" },
];

const timeframes = [
  { value: "m1", label: "دقيقة واحدة" },
  { value: "m5", label: "5 دقائق" },
  { value: "m15", label: "15 دقيقة" },
  { value: "m30", label: "30 دقيقة" },
  { value: "h1", label: "ساعة واحدة" },
  { value: "h4", label: "4 ساعات" },
  { value: "d1", label: "يوم واحد" },
  { value: "w1", label: "أسبوع" },
];

const riskLevels = [
  { value: "low", label: "منخفض", color: "bg-green-500" },
  { value: "medium", label: "متوسط", color: "bg-yellow-500" },
  { value: "high", label: "مرتفع", color: "bg-red-500" },
];

const BotStatus = ({ status }: { status: boolean }) => (
  <div className={`px-3 py-1 rounded-full flex items-center ${status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
    {status ? (
      <>
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2"></div>
        نشط
      </>
    ) : (
      <>
        <div className="w-2 h-2 rounded-full bg-gray-500 mr-2"></div>
        متوقف
      </>
    )}
  </div>
);

const BotsPage = () => {
  const [bots, setBots] = useState<TradingBot[]>([]);
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [openNewBotDialog, setOpenNewBotDialog] = useState(false);
  const [openConnectDialog, setOpenConnectDialog] = useState(false);
  const { toast } = useToast();

  const [newBot, setNewBot] = useState({
    account_id: "",
    name: "",
    strategy_type: "trend_following",
    settings: {
      timeframe: "h1",
      pairs: ["EURUSD", "GBPUSD"],
      max_trades: 5,
      leverage: 5
    },
    risk_parameters: {
      risk_per_trade: 1,
      stop_loss_pips: 50,
      take_profit_pips: 100,
      max_daily_loss: 3
    }
  });
  
  const [connectSettings, setConnectSettings] = useState({
    broker_name: "",
    broker_url: "",
    api_key: "",
    api_secret: "",
    risk_level: "medium",
    max_drawdown: 10,
    daily_profit_target: 2,
    trading_enabled: false
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
        .select("id, account_name, platform, broker_name, connection_status, trading_enabled")
        .eq("user_id", sessionData.session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      setAccounts(data || []);
      if (data && data.length > 0 && !selectedAccount) {
        setSelectedAccount(data[0].id);
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
    if (!selectedAccount) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("trading_bots")
        .select("*")
        .eq("account_id", selectedAccount)
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
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      fetchBots();
      // جلب إعدادات الاتصال الحالية للحساب المحدد
      const getAccountSettings = async () => {
        try {
          const { data, error } = await supabase
            .from("trading_accounts")
            .select("broker_name, broker_url, api_key, api_secret, risk_level, max_drawdown, daily_profit_target, trading_enabled")
            .eq("id", selectedAccount)
            .single();
          
          if (error) throw error;
          
          if (data) {
            setConnectSettings({
              broker_name: data.broker_name || "",
              broker_url: data.broker_url || "",
              api_key: data.api_key || "",
              api_secret: data.api_secret || "",
              risk_level: data.risk_level || "medium",
              max_drawdown: data.max_drawdown || 10,
              daily_profit_target: data.daily_profit_target || 2,
              trading_enabled: data.trading_enabled || false
            });
          }
        } catch (error: any) {
          console.error("Error fetching account settings:", error);
        }
      };
      
      getAccountSettings();
    }
  }, [selectedAccount]);

  const handleCreateBot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const botData = {
        account_id: selectedAccount,
        name: newBot.name,
        strategy_type: newBot.strategy_type,
        is_active: false,
        settings: newBot.settings,
        risk_parameters: newBot.risk_parameters,
        performance_metrics: {
          win_rate: 0,
          profit_factor: 0,
          total_trades: 0,
          profitable_trades: 0,
          losing_trades: 0,
          total_profit: 0,
          total_loss: 0,
          max_drawdown: 0
        }
      };
      
      const { data, error } = await supabase
        .from("trading_bots")
        .insert(botData)
        .select();

      if (error) throw error;

      toast({
        title: "تم إنشاء الروبوت بنجاح",
      });
      
      setOpenNewBotDialog(false);
      setNewBot({
        account_id: selectedAccount,
        name: "",
        strategy_type: "trend_following",
        settings: {
          timeframe: "h1",
          pairs: ["EURUSD", "GBPUSD"],
          max_trades: 5,
          leverage: 5
        },
        risk_parameters: {
          risk_per_trade: 1,
          stop_loss_pips: 50,
          take_profit_pips: 100,
          max_daily_loss: 3
        }
      });
      
      fetchBots();
      
      // تسجيل إنشاء الروبوت في السجل
      await supabase.from("trading_logs").insert({
        account_id: selectedAccount,
        bot_id: data?.[0]?.id,
        log_type: "create",
        message: `تم إنشاء روبوت جديد: ${newBot.name}`,
        details: botData
      });
      
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

  const handleToggleBotStatus = async (botId: string, currentStatus: boolean) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("trading_bots")
        .update({ is_active: !currentStatus })
        .eq("id", botId);

      if (error) throw error;

      toast({
        title: !currentStatus ? "تم تفعيل الروبوت بنجاح" : "تم إيقاف الروبوت بنجاح",
      });
      
      fetchBots();
      
      // تسجيل تغيير حالة الروبوت في السجل
      await supabase.from("trading_logs").insert({
        account_id: selectedAccount,
        bot_id: botId,
        log_type: "status_change",
        message: !currentStatus ? "تم تفعيل الروبوت" : "تم إيقاف الروبوت",
        details: { new_status: !currentStatus }
      });
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ في تغيير حالة الروبوت",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBot = async (botId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الروبوت؟")) return;
    
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
      
      // تسجيل حذف الروبوت في السجل
      await supabase.from("trading_logs").insert({
        account_id: selectedAccount,
        log_type: "delete",
        message: "تم حذف روبوت",
        details: { bot_id: botId }
      });
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ في حذف الروبوت",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleConnectBroker = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from("trading_accounts")
        .update({
          broker_name: connectSettings.broker_name,
          broker_url: connectSettings.broker_url,
          api_key: connectSettings.api_key,
          api_secret: connectSettings.api_secret,
          risk_level: connectSettings.risk_level,
          max_drawdown: connectSettings.max_drawdown,
          daily_profit_target: connectSettings.daily_profit_target,
          trading_enabled: connectSettings.trading_enabled,
          connection_status: true,
          last_sync_time: new Date().toISOString()
        })
        .eq("id", selectedAccount);

      if (error) throw error;

      toast({
        title: "تم ربط الحساب بالوسيط بنجاح",
        description: "يمكنك الآن بدء التداول الآلي"
      });
      
      setOpenConnectDialog(false);
      fetchAccounts();
      
      // تسجيل ربط الحساب في السجل
      await supabase.from("trading_logs").insert({
        account_id: selectedAccount,
        log_type: "connection",
        message: `تم ربط الحساب بوسيط: ${connectSettings.broker_name}`,
        details: { broker: connectSettings.broker_name, trading_enabled: connectSettings.trading_enabled }
      });
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ في ربط الحساب",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">روبوتات التداول الآلي</h1>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <Dialog open={openConnectDialog} onOpenChange={setOpenConnectDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Zap className="w-4 h-4 mr-2" />
                اتصال بالوسيط
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>ربط حساب التداول بالوسيط</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleConnectBroker} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="broker_name">اسم الوسيط</Label>
                    <Select
                      value={connectSettings.broker_name}
                      onValueChange={(value) =>
                        setConnectSettings({ ...connectSettings, broker_name: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الوسيط" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MetaTrader 4">MetaTrader 4</SelectItem>
                        <SelectItem value="MetaTrader 5">MetaTrader 5</SelectItem>
                        <SelectItem value="Binance">Binance</SelectItem>
                        <SelectItem value="TradingView">TradingView</SelectItem>
                        <SelectItem value="cTrader">cTrader</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="broker_url">رابط الوسيط API (اختياري)</Label>
                    <Input
                      id="broker_url"
                      value={connectSettings.broker_url}
                      onChange={(e) =>
                        setConnectSettings({ ...connectSettings, broker_url: e.target.value })
                      }
                      placeholder="https://api.example.com"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="api_key">مفتاح API</Label>
                    <Input
                      id="api_key"
                      value={connectSettings.api_key}
                      onChange={(e) =>
                        setConnectSettings({ ...connectSettings, api_key: e.target.value })
                      }
                      required
                      placeholder="أدخل مفتاح API من منصة التداول"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="api_secret">كلمة سر API</Label>
                    <Input
                      id="api_secret"
                      type="password"
                      value={connectSettings.api_secret}
                      onChange={(e) =>
                        setConnectSettings({ ...connectSettings, api_secret: e.target.value })
                      }
                      required
                      placeholder="أدخل كلمة سر API من منصة التداول"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>مستوى المخاطرة</Label>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse pt-2">
                    {riskLevels.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        className={`px-4 py-2 rounded-md border ${
                          connectSettings.risk_level === level.value
                            ? `border-2 border-hamzah-600 bg-hamzah-100 dark:bg-hamzah-800`
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() =>
                          setConnectSettings({ ...connectSettings, risk_level: level.value })
                        }
                      >
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <div className={`w-3 h-3 rounded-full ${level.color}`}></div>
                          <span>{level.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max_drawdown">الحد الأقصى للسحب (%)</Label>
                    <div className="pt-2">
                      <Slider
                        value={[connectSettings.max_drawdown]}
                        onValueChange={(value) =>
                          setConnectSettings({ ...connectSettings, max_drawdown: value[0] })
                        }
                        min={1}
                        max={30}
                        step={1}
                      />
                      <p className="text-right mt-1 text-sm text-gray-500">{connectSettings.max_drawdown}%</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="daily_profit_target">هدف الربح اليومي (%)</Label>
                    <div className="pt-2">
                      <Slider
                        value={[connectSettings.daily_profit_target]}
                        onValueChange={(value) =>
                          setConnectSettings({ ...connectSettings, daily_profit_target: value[0] })
                        }
                        min={0.5}
                        max={10}
                        step={0.5}
                      />
                      <p className="text-right mt-1 text-sm text-gray-500">{connectSettings.daily_profit_target}%</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Label htmlFor="trading_enabled" className="cursor-pointer">تفعيل التداول الآلي</Label>
                  <Switch
                    id="trading_enabled"
                    checked={connectSettings.trading_enabled}
                    onCheckedChange={(checked) =>
                      setConnectSettings({ ...connectSettings, trading_enabled: checked })
                    }
                  />
                  <span className={`text-sm ${connectSettings.trading_enabled ? 'text-green-600' : 'text-gray-500'}`}>
                    {connectSettings.trading_enabled ? 'مفعل' : 'غير مفعل'}
                  </span>
                </div>
                
                <div className="pt-4">
                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md mb-4">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 mr-2" />
                      <div>
                        <p className="text-yellow-800 text-sm">
                          ملاحظة هامة: تأكد من صحة بيانات الاتصال. تذكر أن مفاتيح API تسمح للنظام بالوصول إلى حسابك وتنفيذ الصفقات تلقائيًا.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpenConnectDialog(false)}
                  >
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    ربط الحساب
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={openNewBotDialog} onOpenChange={setOpenNewBotDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                روبوت جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>إنشاء روبوت تداول جديد</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateBot} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="account">الحساب</Label>
                  <Select
                    value={selectedAccount}
                    onValueChange={(value) => {
                      setSelectedAccount(value);
                      setNewBot(prev => ({ ...prev, account_id: value }));
                    }}
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
                
                <div className="space-y-2">
                  <Label htmlFor="name">اسم الروبوت</Label>
                  <Input
                    id="name"
                    value={newBot.name}
                    onChange={(e) =>
                      setNewBot({ ...newBot, name: e.target.value })
                    }
                    required
                    placeholder="مثال: روبوت المتوسطات المتحركة"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="strategy_type">نوع الاستراتيجية</Label>
                  <Select
                    value={newBot.strategy_type}
                    onValueChange={(value) =>
                      setNewBot({ ...newBot, strategy_type: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر استراتيجية التداول" />
                    </SelectTrigger>
                    <SelectContent>
                      {strategyTypes.map((strategy) => (
                        <SelectItem key={strategy.value} value={strategy.value}>
                          {strategy.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>إعدادات الاستراتيجية</Label>
                  <Card className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="timeframe">الإطار الزمني</Label>
                        <Select
                          value={newBot.settings.timeframe}
                          onValueChange={(value) =>
                            setNewBot({ 
                              ...newBot, 
                              settings: { 
                                ...newBot.settings, 
                                timeframe: value 
                              } 
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الإطار الزمني" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeframes.map((timeframe) => (
                              <SelectItem key={timeframe.value} value={timeframe.value}>
                                {timeframe.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="max_trades">أقصى عدد للصفقات المفتوحة</Label>
                        <Input
                          id="max_trades"
                          type="number"
                          min="1"
                          max="20"
                          value={newBot.settings.max_trades}
                          onChange={(e) =>
                            setNewBot({ 
                              ...newBot, 
                              settings: { 
                                ...newBot.settings, 
                                max_trades: parseInt(e.target.value) || 5 
                              } 
                            })
                          }
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="leverage">الرافعة المالية</Label>
                        <Input
                          id="leverage"
                          type="number"
                          min="1"
                          max="500"
                          value={newBot.settings.leverage}
                          onChange={(e) =>
                            setNewBot({ 
                              ...newBot, 
                              settings: { 
                                ...newBot.settings, 
                                leverage: parseInt(e.target.value) || 5 
                              } 
                            })
                          }
                        />
                      </div>
                    </div>
                  </Card>
                </div>
                
                <div className="space-y-2">
                  <Label>إعدادات إدارة المخاطر</Label>
                  <Card className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="risk_per_trade">نسبة المخاطرة لكل صفقة (%)</Label>
                        <div className="pt-2">
                          <Slider
                            value={[newBot.risk_parameters.risk_per_trade]}
                            onValueChange={(value) =>
                              setNewBot({ 
                                ...newBot, 
                                risk_parameters: { 
                                  ...newBot.risk_parameters, 
                                  risk_per_trade: value[0] 
                                } 
                              })
                            }
                            min={0.1}
                            max={5}
                            step={0.1}
                          />
                          <p className="text-right mt-1 text-sm text-gray-500">{newBot.risk_parameters.risk_per_trade}%</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="max_daily_loss">أقصى خسارة يومية (%)</Label>
                        <div className="pt-2">
                          <Slider
                            value={[newBot.risk_parameters.max_daily_loss]}
                            onValueChange={(value) =>
                              setNewBot({ 
                                ...newBot, 
                                risk_parameters: { 
                                  ...newBot.risk_parameters, 
                                  max_daily_loss: value[0] 
                                } 
                              })
                            }
                            min={1}
                            max={10}
                            step={0.5}
                          />
                          <p className="text-right mt-1 text-sm text-gray-500">{newBot.risk_parameters.max_daily_loss}%</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="stop_loss_pips">وقف الخسارة (نقاط)</Label>
                        <Input
                          id="stop_loss_pips"
                          type="number"
                          min="10"
                          max="500"
                          value={newBot.risk_parameters.stop_loss_pips}
                          onChange={(e) =>
                            setNewBot({ 
                              ...newBot, 
                              risk_parameters: { 
                                ...newBot.risk_parameters, 
                                stop_loss_pips: parseInt(e.target.value) || 50 
                              } 
                            })
                          }
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="take_profit_pips">جني الربح (نقاط)</Label>
                        <Input
                          id="take_profit_pips"
                          type="number"
                          min="10"
                          max="1000"
                          value={newBot.risk_parameters.take_profit_pips}
                          onChange={(e) =>
                            setNewBot({ 
                              ...newBot, 
                              risk_parameters: { 
                                ...newBot.risk_parameters, 
                                take_profit_pips: parseInt(e.target.value) || 100 
                              } 
                            })
                          }
                        />
                      </div>
                    </div>
                  </Card>
                </div>
                
                <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpenNewBotDialog(false)}
                  >
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    إنشاء الروبوت
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">روبوتات التداول الآلي</h2>
                <p className="text-sm text-gray-500">
                  قم بإدارة روبوتات التداول الآلي وتتبع أدائها
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
                        {account.connection_status && " ✓"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={fetchBots}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* عرض حالة الاتصال للحساب المحدد */}
            {selectedAccount && accounts.length > 0 && (
              <div className="mb-6">
                {(() => {
                  const account = accounts.find(a => a.id === selectedAccount);
                  return (
                    <div className={`p-4 rounded-md ${account?.connection_status ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                      <div className="flex items-start">
                        {account?.connection_status ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-2" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 mr-2" />
                        )}
                        <div>
                          <p className={`font-medium ${account?.connection_status ? 'text-green-800' : 'text-yellow-800'}`}>
                            {account?.connection_status ? `متصل بـ ${account.broker_name || 'الوسيط'}` : 'غير متصل بمنصة التداول'}
                          </p>
                          <p className="text-sm mt-1">
                            {account?.connection_status
                              ? `التداول الآلي: ${account.trading_enabled ? 'مفعل' : 'معطل'}`
                              : 'قم بربط الحساب بالوسيط الخاص بك لبدء التداول الآلي'
                            }
                          </p>
                        </div>
                        <div className="mr-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setOpenConnectDialog(true)}
                          >
                            {account?.connection_status ? 'تعديل الإعدادات' : 'اتصال بالوسيط'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : bots.length === 0 ? (
              <div className="text-center py-12">
                <BrainCircuit className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">لا توجد روبوتات بعد</h3>
                <p className="text-gray-500 mb-4">قم بإنشاء روبوت تداول آلي جديد للبدء</p>
                <Button onClick={() => setOpenNewBotDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  إنشاء روبوت جديد
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {bots.map((bot) => (
                  <Card key={bot.id} className="overflow-hidden">
                    <div className={`h-2 ${bot.is_active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold mb-1">{bot.name}</h3>
                          <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-500 mb-4">
                            <span>استراتيجية: {
                              strategyTypes.find(s => s.value === bot.strategy_type)?.label || bot.strategy_type
                            }</span>
                            <span>•</span>
                            <span>الإطار: {
                              timeframes.find(t => t.value === bot.settings.timeframe)?.label || bot.settings.timeframe
                            }</span>
                          </div>
                        </div>
                        <BotStatus status={bot.is_active} />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">معدل الربح</p>
                          <div className="flex items-end space-x-1 rtl:space-x-reverse">
                            <span className="text-xl font-bold">
                              {bot.performance_metrics.win_rate || 0}%
                            </span>
                          </div>
                          <Progress 
                            value={bot.performance_metrics.win_rate || 0} 
                            className="h-1.5 mt-1" 
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">الربح الإجمالي</p>
                          <div className="flex items-end space-x-1 rtl:space-x-reverse">
                            <span className={`text-xl font-bold ${(bot.performance_metrics.total_profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ${bot.performance_metrics.total_profit || 0}
                            </span>
                          </div>
                          <div className="h-1.5 mt-1 bg-gray-100 rounded-full">
                            <div 
                              className={`h-full rounded-full ${(bot.performance_metrics.total_profit || 0) >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                              style={{ width: `${Math.min(Math.abs(bot.performance_metrics.total_profit || 0) / 10 * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="rounded-md bg-gray-50 p-2 text-center">
                          <p className="text-xs text-gray-500">الصفقات</p>
                          <p className="font-medium">{bot.performance_metrics.total_trades || 0}</p>
                        </div>
                        <div className="rounded-md bg-green-50 p-2 text-center">
                          <p className="text-xs text-green-600">رابحة</p>
                          <p className="font-medium text-green-700">{bot.performance_metrics.profitable_trades || 0}</p>
                        </div>
                        <div className="rounded-md bg-red-50 p-2 text-center">
                          <p className="text-xs text-red-600">خاسرة</p>
                          <p className="font-medium text-red-700">{bot.performance_metrics.losing_trades || 0}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4">
                        <Button
                          variant={bot.is_active ? "destructive" : "default"}
                          size="sm"
                          onClick={() => handleToggleBotStatus(bot.id, bot.is_active)}
                        >
                          {bot.is_active ? (
                            <>
                              <Pause className="w-4 h-4 mr-1" />
                              إيقاف
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-1" />
                              تشغيل
                            </>
                          )}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <Settings className="w-4 h-4 mr-1" />
                          الإعدادات
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <BarChart3 className="w-4 h-4 mr-1" />
                          الأداء
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteBot(bot.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          حذف
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BotsPage;
