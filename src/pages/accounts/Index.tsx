
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, Settings2, Trash2, Info, HelpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface TradingAccount {
  id: string;
  platform: string;
  account_name: string;
  api_key?: string;
  api_secret?: string;
  balance: number;
  equity: number;
  leverage: number;
  is_active: boolean;
  login_id?: string;
  server?: string;
  password?: string;
}

const AccountsPage = () => {
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [newAccount, setNewAccount] = useState({
    platform: "",
    account_name: "",
    api_key: "",
    api_secret: "",
    leverage: 100,
    login_id: "",
    server: "",
    password: "",
  });

  const fetchAccounts = async () => {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      if (!sessionData.session?.user) {
        navigate('/auth');
        return;
      }
      
      const { data, error } = await supabase
        .from("trading_accounts")
        .select("*")
        .eq("user_id", sessionData.session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ في جلب الحسابات",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      if (!sessionData.session?.user) {
        navigate('/auth');
        return;
      }
      
      // بيانات الحساب المشتركة بين جميع المنصات
      const accountData: any = {
        platform: newAccount.platform,
        account_name: newAccount.account_name,
        leverage: Number(newAccount.leverage),
        user_id: sessionData.session.user.id
      };

      // إضافة بيانات خاصة حسب نوع المنصة
      if (newAccount.platform === 'mt4' || newAccount.platform === 'mt5') {
        accountData.login_id = newAccount.login_id;
        accountData.password = newAccount.password;
        accountData.server = newAccount.server;
      } else if (newAccount.platform === 'binance' || newAccount.platform === 'bybit') {
        accountData.api_key = newAccount.api_key;
        accountData.api_secret = newAccount.api_secret;
      }

      const { error } = await supabase.from("trading_accounts").insert(accountData);

      if (error) throw error;

      toast({
        title: "تم إضافة الحساب بنجاح",
      });
      setShowAddForm(false);
      setNewAccount({
        platform: "",
        account_name: "",
        api_key: "",
        api_secret: "",
        leverage: 100,
        login_id: "",
        server: "",
        password: "",
      });
      fetchAccounts();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ في إضافة الحساب",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الحساب؟")) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from("trading_accounts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "تم حذف الحساب بنجاح",
      });
      fetchAccounts();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ في حذف الحساب",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // عرض الحقول المناسبة حسب نوع المنصة
  const renderPlatformFields = () => {
    if (!newAccount.platform) return null;

    if (newAccount.platform === 'mt4' || newAccount.platform === 'mt5') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="login_id">
              <div className="flex items-center gap-1">
                معرف الدخول (Login ID)
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-sm">أدخل رقم حساب التداول (رقم تسعة أرقام غالباً)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </Label>
            <Input
              id="login_id"
              value={newAccount.login_id}
              onChange={(e) =>
                setNewAccount({ ...newAccount, login_id: e.target.value })
              }
              required
              placeholder="مثال: 12345678"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              <div className="flex items-center gap-1">
                كلمة المرور
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-sm">أدخل كلمة مرور حساب التداول (وليس كلمة مرور منصة التداول)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </Label>
            <Input
              id="password"
              type="password"
              value={newAccount.password}
              onChange={(e) =>
                setNewAccount({ ...newAccount, password: e.target.value })
              }
              required
              placeholder="أدخل كلمة المرور الرئيسية أو كلمة مرور المستثمر"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="server">
              <div className="flex items-center gap-1">
                اسم السيرفر
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-sm">أدخل اسم خادم الوسيط (يمكنك العثور عليه في إعدادات الاتصال في منصة التداول)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </Label>
            <Input
              id="server"
              value={newAccount.server}
              onChange={(e) =>
                setNewAccount({ ...newAccount, server: e.target.value })
              }
              required
              placeholder="مثال: Demo.examplebroker.com"
            />
          </div>
        </div>
      );
    } else if (newAccount.platform === 'binance' || newAccount.platform === 'bybit') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="api_key">
              <div className="flex items-center gap-1">
                مفتاح API
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-sm">أدخل مفتاح API الذي يمكنك الحصول عليه من صفحة إدارة مفاتيح API في حسابك</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </Label>
            <Input
              id="api_key"
              value={newAccount.api_key}
              onChange={(e) =>
                setNewAccount({ ...newAccount, api_key: e.target.value })
              }
              required
              placeholder="أدخل مفتاح API الخاص بك"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="api_secret">
              <div className="flex items-center gap-1">
                كلمة سر API
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-sm">أدخل كلمة سر API (تظهر مرة واحدة فقط عند إنشاء مفتاح API)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </Label>
            <Input
              id="api_secret"
              type="password"
              value={newAccount.api_secret}
              onChange={(e) =>
                setNewAccount({ ...newAccount, api_secret: e.target.value })
              }
              required
              placeholder="أدخل كلمة سر API الخاصة بك"
            />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">حسابات التداول</h1>
        <Button onClick={() => setShowAddForm(true)} disabled={showAddForm}>
          <Plus className="w-4 h-4 mr-2" />
          إضافة حساب جديد
        </Button>
      </div>

      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>إضافة حساب جديد</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddAccount} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="platform">المنصة</Label>
                    <Select
                      value={newAccount.platform}
                      onValueChange={(value) =>
                        setNewAccount({ ...newAccount, platform: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المنصة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mt4">MetaTrader 4</SelectItem>
                        <SelectItem value="mt5">MetaTrader 5</SelectItem>
                        <SelectItem value="binance">Binance</SelectItem>
                        <SelectItem value="bybit">Bybit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account_name">اسم الحساب</Label>
                    <Input
                      id="account_name"
                      value={newAccount.account_name}
                      onChange={(e) =>
                        setNewAccount({ ...newAccount, account_name: e.target.value })
                      }
                      required
                      placeholder="مثال: حساب التداول الرئيسي"
                    />
                  </div>
                </div>

                {renderPlatformFields()}

                <div className="space-y-2">
                  <Label htmlFor="leverage">
                    <div className="flex items-center gap-1">
                      الرافعة المالية
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-4 w-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-[200px] text-sm">أدخل قيمة الرافعة المالية المتاحة في حسابك (مثال: 100 تعني رافعة 1:100)</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </Label>
                  <Input
                    id="leverage"
                    type="number"
                    min="1"
                    max="3000"
                    value={newAccount.leverage}
                    onChange={(e) =>
                      setNewAccount({
                        ...newAccount,
                        leverage: parseInt(e.target.value) || 100,
                      })
                    }
                  />
                </div>

                <div className="flex justify-end space-x-2 rtl:space-x-reverse">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                  >
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={loading || !newAccount.platform}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    إضافة الحساب
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          <TabsTrigger value="all">جميع الحسابات</TabsTrigger>
          <TabsTrigger value="mt">MetaTrader</TabsTrigger>
          <TabsTrigger value="crypto">العملات الرقمية</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <AccountsList 
            accounts={accounts} 
            loading={loading} 
            handleDeleteAccount={handleDeleteAccount} 
            navigate={navigate} 
          />
        </TabsContent>
        
        <TabsContent value="mt">
          <AccountsList 
            accounts={accounts.filter(account => account.platform === 'mt4' || account.platform === 'mt5')} 
            loading={loading} 
            handleDeleteAccount={handleDeleteAccount} 
            navigate={navigate} 
          />
        </TabsContent>
        
        <TabsContent value="crypto">
          <AccountsList 
            accounts={accounts.filter(account => account.platform === 'binance' || account.platform === 'bybit')} 
            loading={loading} 
            handleDeleteAccount={handleDeleteAccount} 
            navigate={navigate} 
          />
        </TabsContent>
      </Tabs>
      
      {/* دليل إرشادي */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3 rtl:space-x-reverse">
          <Info className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-800">كيفية إضافة حساب تداول:</h3>
            <div className="mt-2 space-y-2 text-sm text-blue-800">
              <p><strong>MetaTrader (MT4/MT5):</strong> ستحتاج إلى معرف الدخول وكلمة المرور واسم السيرفر من منصة التداول الخاصة بك.</p>
              <p><strong>Binance/Bybit:</strong> ستحتاج إلى إنشاء مفاتيح API من لوحة تحكم حسابك مع تفعيل صلاحيات القراءة والتداول.</p>
              <p>للحصول على تفاصيل حول كيفية إنشاء مفاتيح API أو العثور على بيانات الاتصال، راجع دليل المستخدم لكل منصة.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// مكون قائمة الحسابات المستخرج لتبسيط الرمز
interface AccountsListProps {
  accounts: TradingAccount[];
  loading: boolean;
  handleDeleteAccount: (id: string) => Promise<void>;
  navigate: (path: string) => void;
}

const AccountsList = ({ accounts, loading, handleDeleteAccount, navigate }: AccountsListProps) => {
  if (loading) {
    return (
      <div className="col-span-full flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  } 
  
  if (accounts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 border border-dashed border-gray-200 rounded-lg">
        <Info className="h-12 w-12 mx-auto text-gray-400 mb-3" />
        <h3 className="text-lg font-medium mb-2">لم تقم بإضافة أي حسابات بعد</h3>
        <p className="text-gray-500 mb-0">قم بإضافة حسابات التداول الخاصة بك لبدء استخدام المنصة</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {accounts.map((account) => (
        <motion.div
          key={account.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{account.account_name}</h3>
                  <div className="flex items-center mt-1">
                    <Badge variant="outline" className="mr-2">
                      {account.platform === "mt4" 
                        ? "MetaTrader 4" 
                        : account.platform === "mt5" 
                          ? "MetaTrader 5" 
                          : account.platform === "binance" 
                            ? "Binance" 
                            : "Bybit"}
                    </Badge>
                    {account.login_id && (
                      <span className="text-xs text-gray-500">ID: {account.login_id}</span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/accounts/${account.id}/settings`)}
                  >
                    <Settings2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteAccount(account.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">الرصيد</span>
                  <span className="font-medium">
                    ${account.balance?.toLocaleString() || "0"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">الأموال المتاحة</span>
                  <span className="font-medium">
                    ${account.equity?.toLocaleString() || "0"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">الرافعة المالية</span>
                  <span className="font-medium">1:{account.leverage}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    account.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {account.is_active ? "نشط" : "غير نشط"}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default AccountsPage;
