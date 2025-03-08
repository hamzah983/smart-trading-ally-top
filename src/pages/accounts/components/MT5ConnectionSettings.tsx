
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, RefreshCw, ServerIcon, AlertCircle } from "lucide-react";
import { TradingAccount } from "@/services/binance/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface MT5ConnectionSettingsProps {
  account: TradingAccount;
  mt5Login: string;
  setMt5Login: (login: string) => void;
  mt5Password: string;
  setMt5Password: (password: string) => void;
  mt5Server: string;
  setMt5Server: (server: string) => void;
  handleConnectMT5: (accountId: string) => Promise<boolean>;
  isConnecting: boolean;
  setSelectedAccount: (account: TradingAccount | null) => void;
  fetchAccounts: () => Promise<void>;
}

const MT5ConnectionSettings = ({
  account,
  mt5Login,
  setMt5Login,
  mt5Password,
  setMt5Password,
  mt5Server,
  setMt5Server,
  handleConnectMT5,
  isConnecting,
  setSelectedAccount,
  fetchAccounts
}: MT5ConnectionSettingsProps) => {
  const { toast } = useToast();
  const [showTips, setShowTips] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleResetConnection = async () => {
    try {
      setIsResetting(true);
      
      const { error } = await supabase
        .from('trading_accounts')
        .update({
          mt5_login: null,
          mt5_password: null,
          mt5_server: null,
          mt5_connection_status: false,
          last_sync_time: new Date().toISOString()
        })
        .eq('id', account.id);
        
      if (error) throw error;
      
      toast({
        title: "تم إعادة تهيئة الاتصال",
        description: "تم إعادة تهيئة اتصال منصة MT5 بنجاح"
      });
      
      setMt5Login("");
      setMt5Password("");
      setMt5Server("");
      
      fetchAccounts();
      setShowResetConfirm(false);
    } catch (error: any) {
      console.error("Error resetting MT5 connection:", error);
      toast({
        variant: "destructive",
        title: "خطأ في إعادة تهيئة الاتصال",
        description: error.message
      });
    } finally {
      setIsResetting(false);
    }
  };

  // Custom input handlers to ensure RTL text input works properly
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMt5Login(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMt5Password(e.target.value);
  };

  const handleServerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMt5Server(e.target.value);
  };

  return (
    <div className="space-y-4 rtl">
      {showTips && (
        <Alert>
          <AlertCircle className="h-4 w-4 ml-2" />
          <AlertDescription>
            <p className="mb-2 font-bold">نصائح لإعداد بيانات MetaTrader 5:</p>
            <ul className="list-disc pr-5 space-y-1">
              <li>تأكد من استخدام رقم الحساب الصحيح (Login)</li>
              <li>استخدم كلمة المرور الرئيسية للحساب وليست كلمة مرور المستخدم</li>
              <li>تأكد من اسم السيرفر بالضبط كما هو مكتوب في منصة التداول</li>
              <li>للحصول على أفضل أداء، استخدم حساب MT5 بصلاحيات API كاملة</li>
            </ul>
            <Button
              variant="link"
              className="p-0 mt-2"
              onClick={() => setShowTips(false)}
            >
              إغلاق
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {showResetConfirm ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4 ml-2" />
          <AlertDescription>
            <p className="mb-2 font-bold">تأكيد إعادة تهيئة الاتصال</p>
            <p>سيؤدي هذا إلى حذف بيانات اتصال MT5 الحالية وفصل الحساب عن المنصة. هل أنت متأكد؟</p>
            <div className="flex space-x-2 space-x-reverse mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResetConfirm(false)}
              >
                إلغاء
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleResetConnection}
                disabled={isResetting}
              >
                {isResetting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري إعادة التهيئة...
                  </>
                ) : "تأكيد إعادة التهيئة"}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        account.mt5_login && (
          <Alert>
            <RefreshCw className="h-4 w-4 ml-2" />
            <AlertDescription>
              <p>
                {account.mt5_connection_status 
                  ? "الحساب متصل حاليًا بمنصة MetaTrader 5. إذا كنت ترغب في تغيير بيانات الاتصال، يمكنك إعادة تهيئة الاتصال."
                  : "يبدو أن هناك مشكلة في الاتصال بمنصة MetaTrader 5. يمكنك إعادة تهيئة الاتصال وإدخال البيانات مرة أخرى."}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setShowResetConfirm(true)}
              >
                إعادة تهيئة الاتصال
              </Button>
            </AlertDescription>
          </Alert>
        )
      )}
      
      <div className="space-y-2">
        <Label htmlFor="mt5-login">رقم الحساب (Login)</Label>
        <Input 
          id="mt5-login" 
          type="text"
          inputMode="numeric"
          dir="ltr"
          placeholder="12345678" 
          value={mt5Login}
          onChange={handleLoginChange}
          className="text-left"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="mt5-password">كلمة المرور</Label>
        <Input 
          id="mt5-password" 
          type="password"
          dir="ltr"
          placeholder="كلمة مرور حساب MT5" 
          value={mt5Password}
          onChange={handlePasswordChange}
          className="text-left"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="mt5-server">اسم السيرفر</Label>
        <Input 
          id="mt5-server" 
          type="text"
          dir="ltr"
          placeholder="ICMarketsSC-Live" 
          value={mt5Server}
          onChange={handleServerChange}
          className="text-left"
        />
      </div>
      
      <div className="flex items-center">
        <ServerIcon className="h-4 w-4 text-hamzah-600 dark:text-hamzah-400 ml-2" />
        <span className="text-sm text-hamzah-600 dark:text-hamzah-400">
          يمكنك العثور على هذه المعلومات في تطبيق MT5 أو على موقع الوسيط الخاص بك
        </span>
        <Button 
          variant="ghost" 
          size="sm" 
          className="mr-2 p-1 h-6" 
          onClick={() => setShowTips(!showTips)}
        >
          <AlertCircle className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="flex justify-between mt-4">
        <Button 
          variant="outline"
          onClick={() => setSelectedAccount(null)}
        >
          إلغاء
        </Button>
        
        <Button 
          onClick={() => handleConnectMT5(account.id)}
          disabled={isConnecting || !mt5Login || !mt5Password || !mt5Server}
        >
          {isConnecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              جاري الاتصال...
            </>
          ) : "اتصال والتحقق"}
        </Button>
      </div>
    </div>
  );
};

export default MT5ConnectionSettings;
