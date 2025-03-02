import { useEffect } from "react";
import { supabase, resetSupabaseHeaders } from "@/integrations/supabase/client";
import { useState } from 'react';
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Loader2, RefreshCw, Wrench, Play, PlusCircle, Pause, 
  WalletCards, Link2, AlertOctagon, CheckCircle, XCircle, 
  AlertTriangle, InfoIcon, DollarSign 
} from "lucide-react";
import { saveApiCredentials, syncAccount, performRealTradingAnalysis } from "@/services/binance/accountService";

const BotsPage = () => {
  useEffect(() => {
    // Reset headers on page load to ensure API key is present
    resetSupabaseHeaders();
    
    // Fetch bots or perform other initialization logic here
  }, []);
  
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountPlatform, setNewAccountPlatform] = useState("Binance");
  const [isCreating, setIsCreating] = useState(false);
  const [accountAnalysis, setAccountAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      
      // Get user session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        toast({
          variant: "destructive",
          title: "جلسة غير صالحة",
          description: "الرجاء تسجيل الدخول للوصول إلى حساباتك"
        });
        setLoading(false);
        return;
      }
      
      // Fetch user's trading accounts
      const { data, error } = await supabase
        .from('trading_accounts')
        .select('*')
        .eq('user_id', sessionData.session.user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setAccounts(data || []);
    } catch (error: any) {
      console.error("Error fetching accounts:", error);
      toast({
        variant: "destructive",
        title: "خطأ في جلب الحسابات",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    try {
      if (!newAccountName) {
        toast({
          variant: "destructive",
          title: "البيانات غير مكتملة",
          description: "الرجاء إدخال اسم الحساب"
        });
        return;
      }
      
      setIsCreating(true);
      
      // Get user session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        toast({
          variant: "destructive",
          title: "جلسة غير صالحة",
          description: "الرجاء تسجيل الدخول لإنشاء حساب جديد"
        });
        return;
      }
      
      // Create new account
      const { data, error } = await supabase
        .from('trading_accounts')
        .insert({
          user_id: sessionData.session.user.id,
          account_name: newAccountName,
          platform: newAccountPlatform,
          is_active: true,
          balance: 0,
          equity: 0,
          leverage: 100,
          risk_level: 'medium',
          max_drawdown: 10.0,
          daily_profit_target: 2.0
        })
        .select();
        
      if (error) throw error;
      
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: `تم إنشاء حساب "${newAccountName}" بنجاح`
      });
      
      // Reset form and close dialog
      setNewAccountName("");
      setNewAccountPlatform("Binance");
      setIsAddDialogOpen(false);
      
      // Refresh accounts list
      fetchAccounts();
      
    } catch (error: any) {
      console.error("Error creating account:", error);
      toast({
        variant: "destructive",
        title: "خطأ في إنشاء الحساب",
        description: error.message
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSaveCredentials = async (accountId: string) => {
    try {
      if (!apiKey || !apiSecret) {
        toast({
          variant: "destructive",
          title: "البيانات غير مكتملة",
          description: "الرجاء إدخال مفتاح API وكلمة السر"
        });
        return;
      }
      
      setIsSaving(true);
      
      // Save and verify API credentials
      const result = await saveApiCredentials(accountId, apiKey, apiSecret);
      
      if (result.success) {
        toast({
          title: "تم حفظ البيانات بنجاح",
          description: "تم التحقق من مفاتيح API والاتصال بالمنصة"
        });
        
        // Refresh accounts list
        fetchAccounts();
      } else {
        toast({
          variant: "destructive",
          title: "خطأ في حفظ البيانات",
          description: result.message
        });
      }
    } catch (error: any) {
      console.error("Error saving credentials:", error);
      toast({
        variant: "destructive",
        title: "خطأ في حفظ البيانات",
        description: error.message
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSyncAccount = async (accountId: string) => {
    try {
      setIsSyncing(true);
      
      // Sync account with exchange platform
      const result = await syncAccount(accountId);
      
      if (result.success) {
        toast({
          title: "تم مزامنة الحساب بنجاح",
          description: "تم تحديث بيانات الرصيد والمراكز المفتوحة"
        });
        
        // Refresh accounts list
        fetchAccounts();
        
        // Analyze the account for real trading
        await analyzeAccountForRealTrading(accountId);
      } else {
        toast({
          variant: "destructive",
          title: "خطأ في مزامنة الحساب",
          description: result.message
        });
      }
    } catch (error: any) {
      console.error("Error syncing account:", error);
      toast({
        variant: "destructive",
        title: "خطأ في مزامنة الحساب",
        description: error.message
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const analyzeAccountForRealTrading = async (accountId: string) => {
    try {
      setIsAnalyzing(true);
      
      const analysis = await performRealTradingAnalysis(accountId);
      setAccountAnalysis(analysis);
      
      if (analysis.affectsRealMoney) {
        toast({
          variant: "destructive",
          title: "تنبيه: تداول حقيقي",
          description: "هذا الحساب جاهز للتداول الحقيقي وسيؤثر على أموالك الفعلية!",
          duration: 10000,
        });
      }
    } catch (error: any) {
      console.error("Error analyzing account:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleToggleAccountStatus = async (accountId: string, currentStatus: boolean) => {
    try {
      // Update account status
      const { error } = await supabase
        .from('trading_accounts')
        .update({ is_active: !currentStatus })
        .eq('id', accountId);
        
      if (error) throw error;
      
      toast({
        title: "تم تحديث حالة الحساب",
        description: `تم ${currentStatus ? 'تعطيل' : 'تفعيل'} الحساب بنجاح`
      });
      
      // Refresh accounts list
      fetchAccounts();
    } catch (error: any) {
      console.error("Error toggling account status:", error);
      toast({
        variant: "destructive",
        title: "خطأ في تحديث حالة الحساب",
        description: error.message
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-hamzah-50 to-hamzah-100 dark:from-hamzah-900 dark:to-hamzah-800">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-hamzah-800 dark:text-hamzah-100">
              حسابات التداول
            </h1>
            <p className="text-hamzah-600 dark:text-hamzah-300">
              إدارة حسابات التداول المرتبطة بمنصات التداول المختلفة
            </p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="glass-morphism hover:scale-105 smooth-transition flex items-center">
                <PlusCircle className="mr-2 h-4 w-4" />
                إضافة حساب جديد
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة حساب تداول جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="account-name">اسم الحساب</Label>
                  <Input 
                    id="account-name" 
                    placeholder="أدخل اسم الحساب" 
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform">منصة التداول</Label>
                  <select 
                    id="platform"
                    className="flex h-10 w-full rounded-md border border-hamzah-200 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-hamzah-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newAccountPlatform}
                    onChange={(e) => setNewAccountPlatform(e.target.value)}
                  >
                    <option value="Binance">Binance</option>
                    <option value="Bybit">Bybit</option>
                    <option value="KuCoin">KuCoin</option>
                    <option value="MT4">MetaTrader 4</option>
                    <option value="MT5">MetaTrader 5</option>
                  </select>
                </div>
                <Button 
                  className="w-full"
                  onClick={handleCreateAccount}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري الإنشاء...
                    </>
                  ) : "إنشاء الحساب"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-hamzah-600 dark:text-hamzah-300" />
          </div>
        ) : accounts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <WalletCards className="h-16 w-16 text-hamzah-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-hamzah-800 dark:text-hamzah-100 mb-2">
              لا توجد حسابات تداول
            </h2>
            <p className="text-hamzah-600 dark:text-hamzah-300 mb-6">
              قم بإضافة حساب تداول جديد للبدء في التداول الآلي
            </p>
            <Button 
              className="glass-morphism hover:scale-105 smooth-transition"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              إضافة حساب الآن
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {accounts.map((account) => (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="glass-morphism p-6">
                  {account.is_api_verified && account.is_active && (
                    <Alert 
                      className={account.connection_status ? 
                        "bg-red-50 border-red-300 text-red-900 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300 mb-4" :
                        "bg-yellow-50 border-yellow-300 text-yellow-900 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300 mb-4"
                      }
                    >
                      <AlertTriangle className="h-5 w-5" />
                      <AlertTitle className="font-bold">
                        {account.connection_status ? 
                          "تنبيه: تداول حقيقي يؤثر على أموالك الفعلية!" : 
                          "تنبيه: الاتصال غير متاح حاليًا"
                        }
                      </AlertTitle>
                      <AlertDescription>
                        {account.connection_status ? 
                          "هذا الحساب متصل ونشط للتداول الحقيقي. أي صفقات يقوم بها الروبوت ستستخدم أموالك الحقيقية." :
                          "لا يمكن بدء التداول الحقيقي حاليًا لأن الاتصال غير متاح. تحقق من مفاتيح API."
                        }
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-hamzah-800 dark:text-hamzah-100">
                        {account.account_name}
                      </h2>
                      <div className="flex items-center text-hamzah-600 dark:text-hamzah-300 mt-1">
                        <span>{account.platform}</span>
                        <Badge 
                          variant={account.is_active ? "outline" : "secondary"}
                          className="mr-2"
                        >
                          {account.is_active ? "نشط" : "معطل"}
                        </Badge>
                        {account.connection_status ? (
                          <Badge 
                            variant="outline"
                            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mx-2"
                          >
                            متصل
                          </Badge>
                        ) : (
                          <Badge 
                            variant="outline"
                            className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 mx-2"
                          >
                            غير متصل
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleSyncAccount(account.id)}
                        disabled={isSyncing || !account.is_api_verified}
                      >
                        {isSyncing && selectedAccount?.id === account.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={account.is_active}
                          onCheckedChange={() => handleToggleAccountStatus(account.id, account.is_active)}
                        />
                      </div>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setSelectedAccount(account);
                          setApiKey(account.api_key || "");
                          setApiSecret(account.api_secret || "");
                        }}
                      >
                        <Wrench className="h-4 w-4 ml-2" />
                        إعدادات
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="p-4 border border-hamzah-200 dark:border-hamzah-700 rounded-lg">
                      <h3 className="text-sm font-medium text-hamzah-600 dark:text-hamzah-400">
                        الرصيد
                      </h3>
                      <p className="text-2xl font-bold text-hamzah-800 dark:text-hamzah-100">
                        ${account.balance ? account.balance.toLocaleString() : '0.00'}
                      </p>
                    </div>
                    <div className="p-4 border border-hamzah-200 dark:border-hamzah-700 rounded-lg">
                      <h3 className="text-sm font-medium text-hamzah-600 dark:text-hamzah-400">
                        قيمة الحساب
                      </h3>
                      <p className="text-2xl font-bold text-hamzah-800 dark:text-hamzah-100">
                        ${account.equity ? account.equity.toLocaleString() : '0.00'}
                      </p>
                    </div>
                    <div className="p-4 border border-hamzah-200 dark:border-hamzah-700 rounded-lg">
                      <h3 className="text-sm font-medium text-hamzah-600 dark:text-hamzah-400">
                        الرافعة المالية
                      </h3>
                      <p className="text-2xl font-bold text-hamzah-800 dark:text-hamzah-100">
                        {account.leverage}x
                      </p>
                    </div>
                  </div>
                  
                  {account.is_api_verified ? (
                    <div className="mt-4 p-4 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
                        <p className="text-green-700 dark:text-green-300">
                          تم التحقق من مفاتيح API بنجاح
                        </p>
                      </div>
                      <p className="text-sm text-green-600 dark:text-green-400 mr-7 mt-1">
                        آخر مزامنة: {account.last_sync_time ? new Date(account.last_sync_time).toLocaleString('ar-SA') : 'لم تتم المزامنة بعد'}
                      </p>
                      
                      {account.is_active && account.connection_status && (
                        <div className="flex items-center mt-2">
                          <DollarSign className="h-5 w-5 text-red-500 ml-2" />
                          <p className="text-red-700 dark:text-red-300 font-medium">
                            التداول الحقيقي مفعل على هذا الحساب!
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-4 p-4 border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div className="flex items-center">
                        <AlertOctagon className="h-5 w-5 text-yellow-500 ml-2" />
                        <p className="text-yellow-700 dark:text-yellow-300">
                          لم يتم ربط مفاتيح API بعد
                        </p>
                      </div>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400 mr-7 mt-1">
                        قم بإعداد مفاتيح API للبدء في التداول الآلي
                      </p>
                    </div>
                  )}
                  
                  {accountAnalysis && accountAnalysis.accountId === account.id && accountAnalysis.isRealTrading && (
                    <div className="mt-4 p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <h3 className="font-bold text-red-800 dark:text-red-300 mb-2 flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        معلومات هامة عن التداول الحقيقي
                      </h3>
                      <ul className="list-disc list-inside space-y-1 text-red-700 dark:text-red-400">
                        {accountAnalysis.warnings?.map((warning: string, index: number) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                      {accountAnalysis.recommendedSettings && (
                        <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-700">
                          <p className="font-medium text-red-800 dark:text-red-300">الإعدادات الموصى بها:</p>
                          <p className="text-red-700 dark:text-red-400">الحد الأقصى للمخاطرة: {accountAnalysis.recommendedSettings.maxRiskPerTrade}%</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {selectedAccount?.id === account.id && (
                    <div className="mt-6 border-t border-hamzah-200 dark:border-hamzah-700 pt-4">
                      <Tabs defaultValue="api">
                        <TabsList className="mb-4">
                          <TabsTrigger value="api">إعدادات API</TabsTrigger>
                          <TabsTrigger value="risk">إعدادات المخاطر</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="api">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="api-key">مفتاح API</Label>
                              <Input 
                                id="api-key" 
                                placeholder="أدخل مفتاح API" 
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="api-secret">كلمة سر API</Label>
                              <Input 
                                id="api-secret" 
                                type="password"
                                placeholder="أدخل كلمة سر API" 
                                value={apiSecret}
                                onChange={(e) => setApiSecret(e.target.value)}
                              />
                            </div>
                            
                            <div className="flex items-center">
                              <Link2 className="h-4 w-4 text-hamzah-600 dark:text-hamzah-400 ml-2" />
                              <a 
                                href={`https://${account.platform.toLowerCase()}.com/account/api`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-hamzah-600 dark:text-hamzah-400 hover:underline"
                              >
                                كيفية الحصول على مفاتيح API من {account.platform}
                              </a>
                            </div>
                            
                            <div className="flex justify-between mt-4">
                              <Button 
                                variant="outline"
                                onClick={() => setSelectedAccount(null)}
                              >
                                إلغاء
                              </Button>
                              <Button 
                                onClick={() => handleSaveCredentials(account.id)}
                                disabled={isSaving}
                              >
                                {isSaving ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    جاري الحفظ...
                                  </>
                                ) : "حفظ وتحقق"}
                              </Button>
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="risk">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="risk-level">مستوى المخاطرة</Label>
                              <select 
                                id="risk-level"
                                className="flex h-10 w-full rounded-md border border-hamzah-200 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-hamzah-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={account.risk_level}
                                onChange={async (e) => {
                                  try {
                                    const { error } = await supabase
                                      .from('trading_accounts')
                                      .update({ risk_level: e.target.value })
                                      .eq('id', account.id);
                                      
                                    if (error) throw error;
                                    
                                    toast({
                                      title: "تم تحديث مستوى المخاطرة",
                                      description: "تم تحديث إعدادات المخاطرة بنجاح"
                                    });
                                    
                                    fetchAccounts();
                                  } catch (error: any) {
                                    toast({
                                      variant: "destructive",
                                      title: "خطأ في تحديث إعدادات المخاطرة",
                                      description: error.message
                                    });
                                  }
                                }}
                              >
                                <option value="low">منخفض</option>
                                <option value="medium">متوسط</option>
                                <option value="high">عالي</option>
                              </select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="max-drawdown">
                                الحد الأقصى للسحب (%)
                                <span className="text-sm text-hamzah-500 mr-2">
                                  (الخسارة المسموح بها كنسبة من رأس المال)
                                </span>
                              </Label>
                              <Input 
                                id="max-drawdown" 
                                type="number"
                                min="1"
                                max="100"
                                value={account.max_drawdown}
                                onChange={async (e) => {
                                  try {
                                    const { error } = await supabase
                                      .from('trading_accounts')
                                      .update({ max_drawdown: parseFloat(e.target.value) })
                                      .eq('id', account.id);
                                      
                                    if (error) throw error;
                                    
                                    toast({
                                      title: "تم تحديث إعدادات المخاطرة",
                                      description: "تم تحديث الحد الأقصى للسحب بنجاح"
                                    });
                                    
                                    fetchAccounts();
                                  } catch (error: any) {
                                    toast({
                                      variant: "destructive",
                                      title: "خطأ في تحديث إعدادات المخاطرة",
                                      description: error.message
                                    });
                                  }
                                }}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="daily-profit-target">
                                هدف الربح اليومي (%)
                                <span className="text-sm text-hamzah-500 mr-2">
                                  (نسبة الربح المستهدفة يومياً)
                                </span>
                              </Label>
                              <Input 
                                id="daily-profit-target" 
                                type="number"
                                min="0.1"
                                max="100"
                                step="0.1"
                                value={account.daily_profit_target}
                                onChange={async (e) => {
                                  try {
                                    const { error } = await supabase
                                      .from('trading_accounts')
                                      .update({ daily_profit_target: parseFloat(e.target.value) })
                                      .eq('id', account.id);
                                      
                                    if (error) throw error;
                                    
                                    toast({
                                      title: "تم تحديث إعدادات المخاطرة",
                                      description: "تم تحديث هدف الربح اليومي بنجاح"
                                    });
                                    
                                    fetchAccounts();
                                  } catch (error: any) {
                                    toast({
                                      variant: "destructive",
                                      title: "خطأ في تحديث إعدادات المخاطرة",
                                      description: error.message
                                    });
                                  }
                                }}
                              />
                            </div>
                            
                            <div className="flex justify-between mt-4">
                              <Button 
                                variant="outline"
                                onClick={() => setSelectedAccount(null)}
                              >
                                إغلاق
                              </Button>
                              <Button 
                                onClick={() => {
                                  toast({
                                    title: "تم حفظ الإعدادات",
                                    description: "تم حفظ إعدادات المخاطرة بنجاح"
                                  });
                                  setSelectedAccount(null);
                                }}
                              >
                                حفظ الإعدادات
                              </Button>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BotsPage;
