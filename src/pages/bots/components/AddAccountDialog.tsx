
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddAccountDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const AddAccountDialog = ({ isOpen, onOpenChange, onSuccess }: AddAccountDialogProps) => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountPlatform, setNewAccountPlatform] = useState("Binance");
  const [tradingMode, setTradingMode] = useState("demo");
  
  // MT5 specific fields
  const [mt5Login, setMt5Login] = useState("");
  const [mt5Password, setMt5Password] = useState("");
  const [mt5Server, setMt5Server] = useState("");

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
      
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        toast({
          variant: "destructive",
          title: "جلسة غير صالحة",
          description: "الرجاء تسجيل الدخول لإنشاء حساب جديد"
        });
        return;
      }
      
      // إضافة بيانات MT5 للحساب إذا كانت منصة MT5
      const accountData = {
        user_id: sessionData.session.user.id,
        account_name: newAccountName,
        platform: newAccountPlatform,
        is_active: true,
        balance: 0,
        equity: 0,
        leverage: 100,
        risk_level: 'medium',
        max_drawdown: 10.0,
        daily_profit_target: 2.0,
        trading_mode: tradingMode
      };
      
      // إضافة بيانات MT5 إذا كانت المنصة MT5
      if (newAccountPlatform === "MT5" && mt5Login && mt5Password && mt5Server) {
        Object.assign(accountData, {
          mt5_login: mt5Login,
          mt5_password: mt5Password,
          mt5_server: mt5Server,
          mt5_connection_status: false // سيتم تحديثه بعد محاولة الاتصال
        });
      }
      
      const { data, error } = await supabase
        .from('trading_accounts')
        .insert(accountData)
        .select();
        
      if (error) throw error;
      
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: `تم إنشاء حساب "${newAccountName}" بنجاح`
      });
      
      // إعادة تعيين الحقول
      setNewAccountName("");
      setNewAccountPlatform("Binance");
      setMt5Login("");
      setMt5Password("");
      setMt5Server("");
      setTradingMode("demo");
      onOpenChange(false);
      
      onSuccess();
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
            <Select 
              id="platform"
              value={newAccountPlatform}
              onValueChange={(value) => {
                setNewAccountPlatform(value);
                // إعادة تعيين حقول MT5 عند تغيير المنصة
                if (value !== "MT5") {
                  setMt5Login("");
                  setMt5Password("");
                  setMt5Server("");
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر منصة التداول" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Binance">Binance</SelectItem>
                <SelectItem value="Bybit">Bybit</SelectItem>
                <SelectItem value="KuCoin">KuCoin</SelectItem>
                <SelectItem value="MT4">MetaTrader 4</SelectItem>
                <SelectItem value="MT5">MetaTrader 5</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Tabs value={tradingMode} onValueChange={setTradingMode} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="demo">حساب تجريبي</TabsTrigger>
              <TabsTrigger value="real">تداول حقيقي</TabsTrigger>
            </TabsList>
            <TabsContent value="demo" className="pt-2">
              <div className="rounded-md bg-blue-50 p-3 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 text-sm">
                ℹ️ حساب تجريبي للتداول بأموال افتراضية دون أي مخاطر مالية حقيقية.
              </div>
            </TabsContent>
            <TabsContent value="real" className="pt-2">
              <div className="rounded-md bg-red-50 p-3 text-red-800 dark:bg-red-900/20 dark:text-red-300 text-sm">
                ⚠️ تنبيه: هذا الحساب سيستخدم الأموال الحقيقية للتداول. تأكد من فهمك للمخاطر المالية المرتبطة بالتداول.
              </div>
            </TabsContent>
          </Tabs>
          
          {newAccountPlatform === "MT5" && (
            <div className="space-y-3 border p-3 rounded-md bg-hamzah-50 dark:bg-hamzah-800/50">
              <h3 className="font-medium text-hamzah-800 dark:text-hamzah-200">بيانات حساب MetaTrader 5</h3>
              
              <div className="space-y-2">
                <Label htmlFor="mt5-login">رقم الحساب (Login)</Label>
                <Input 
                  id="mt5-login" 
                  placeholder="أدخل رقم الحساب" 
                  value={mt5Login}
                  onChange={(e) => setMt5Login(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mt5-password">كلمة المرور</Label>
                <Input 
                  id="mt5-password"
                  type="password"
                  placeholder="أدخل كلمة المرور" 
                  value={mt5Password}
                  onChange={(e) => setMt5Password(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mt5-server">اسم السيرفر</Label>
                <Input 
                  id="mt5-server" 
                  placeholder="مثال: ICMarketsSC-Live" 
                  value={mt5Server}
                  onChange={(e) => setMt5Server(e.target.value)}
                />
              </div>
              
              <div className="text-xs text-hamzah-600 dark:text-hamzah-400">
                * يمكنك الحصول على هذه المعلومات من منصة التداول الخاصة بك أو مزود الخدمة.
              </div>
            </div>
          )}
          
          <Button 
            className="w-full bg-gradient-to-r from-hamzah-500 to-hamzah-600 hover:from-hamzah-600 hover:to-hamzah-700"
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
  );
};

export default AddAccountDialog;
