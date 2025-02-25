
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, Settings2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
      
      const { error } = await supabase.from("trading_accounts").insert({
        ...newAccount,
        leverage: Number(newAccount.leverage),
        user_id: sessionData.session.user.id
      });

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
              <form onSubmit={handleAddAccount} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="platform">المنصة</Label>
                    <Select
                      value={newAccount.platform}
                      onValueChange={(value) =>
                        setNewAccount({ ...newAccount, platform: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المنصة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mt4">MetaTrader 4</SelectItem>
                        <SelectItem value="mt5">MetaTrader 5</SelectItem>
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
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="api_key">مفتاح API</Label>
                    <Input
                      id="api_key"
                      value={newAccount.api_key}
                      onChange={(e) =>
                        setNewAccount({ ...newAccount, api_key: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="api_secret">كلمة سر API</Label>
                    <Input
                      id="api_secret"
                      type="password"
                      value={newAccount.api_secret}
                      onChange={(e) =>
                        setNewAccount({ ...newAccount, api_secret: e.target.value })
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
                      value={newAccount.leverage}
                      onChange={(e) =>
                        setNewAccount({
                          ...newAccount,
                          leverage: parseInt(e.target.value) || 100,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 rtl:space-x-reverse">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                  >
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    إضافة الحساب
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            لم تقم بإضافة أي حسابات بعد
          </div>
        ) : (
          accounts.map((account) => (
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
                      <p className="text-sm text-gray-500">
                        {account.platform === "mt4" ? "MetaTrader 4" : "MetaTrader 5"}
                      </p>
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
          ))
        )}
      </div>
    </div>
  );
};

export default AccountsPage;
