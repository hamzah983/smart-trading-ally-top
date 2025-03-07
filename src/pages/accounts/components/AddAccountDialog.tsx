
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, PlusCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AddAccountDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  newAccountName: string;
  setNewAccountName: (name: string) => void;
  newAccountPlatform: string;
  setNewAccountPlatform: (platform: string) => void;
  isCreating: boolean;
  handleCreateAccount: () => Promise<void>;
}

const AddAccountDialog = ({
  isOpen,
  setIsOpen,
  newAccountName,
  setNewAccountName,
  newAccountPlatform,
  setNewAccountPlatform,
  isCreating,
  handleCreateAccount
}: AddAccountDialogProps) => {
  const [mt5Login, setMt5Login] = useState("");
  const [mt5Password, setMt5Password] = useState("");
  const [mt5Server, setMt5Server] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  
  const handleSubmit = async () => {
    // فقط لغرض المثال، في الواقع ستقوم بتمرير بيانات MT5 إلى handleCreateAccount
    await handleCreateAccount();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="glass-morphism hover:scale-105 smooth-transition flex items-center">
          <PlusCircle className="mr-2 h-4 w-4" />
          إضافة حساب جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">إضافة حساب تداول جديد</DialogTitle>
          <DialogDescription>
            قم بإدخال المعلومات الأساسية لإضافة حساب تداول جديد
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="account-name" className="text-right block">اسم الحساب</Label>
            <Input 
              id="account-name" 
              dir="rtl"
              placeholder="أدخل اسم الحساب" 
              value={newAccountName}
              onChange={(e) => setNewAccountName(e.target.value)}
              className="focus:ring-2 focus:ring-hamzah-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="platform" className="text-right block">منصة التداول</Label>
            <Select
              value={newAccountPlatform}
              onValueChange={(value) => {
                setNewAccountPlatform(value);
                // إعادة تعيين الحقول عند تغيير المنصة
                setMt5Login("");
                setMt5Password("");
                setMt5Server("");
                setApiKey("");
                setApiSecret("");
              }}
            >
              <SelectTrigger id="platform" className="w-full">
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
          
          {newAccountPlatform === "MT5" && (
            <div className="space-y-4 border p-4 rounded-md bg-hamzah-50 dark:bg-hamzah-800/50">
              <h4 className="font-medium text-hamzah-800 dark:text-hamzah-200">بيانات حساب MetaTrader 5</h4>
              <div className="space-y-2">
                <Label htmlFor="mt5-login">رقم الحساب (Login)</Label>
                <Input 
                  id="mt5-login" 
                  dir="ltr"
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
                  dir="ltr"
                  placeholder="أدخل كلمة المرور" 
                  value={mt5Password}
                  onChange={(e) => setMt5Password(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mt5-server">اسم السيرفر</Label>
                <Input 
                  id="mt5-server" 
                  dir="ltr"
                  placeholder="مثال: ICMarketsSC-Live" 
                  value={mt5Server}
                  onChange={(e) => setMt5Server(e.target.value)}
                />
              </div>
              <div className="text-xs text-hamzah-600 dark:text-hamzah-400">
                * هذه المعلومات ضرورية للاتصال بحساب MetaTrader 5 الخاص بك وتنفيذ عمليات التداول الآلي.
              </div>
            </div>
          )}
          
          {(newAccountPlatform === "Binance" || newAccountPlatform === "Bybit" || newAccountPlatform === "KuCoin") && (
            <div className="space-y-4 border p-4 rounded-md bg-hamzah-50 dark:bg-hamzah-800/50">
              <h4 className="font-medium text-hamzah-800 dark:text-hamzah-200">بيانات الـ API</h4>
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input 
                  id="api-key" 
                  dir="ltr"
                  placeholder="أدخل API Key" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-secret">API Secret</Label>
                <Input 
                  id="api-secret" 
                  type="password"
                  dir="ltr"
                  placeholder="أدخل API Secret" 
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                />
              </div>
              <div className="text-xs text-hamzah-600 dark:text-hamzah-400">
                * يمكنك الحصول على مفاتيح API من إعدادات حسابك في منصة التداول.
              </div>
            </div>
          )}
          
          <Tabs defaultValue="real" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="real">تداول حقيقي</TabsTrigger>
              <TabsTrigger value="demo">حساب تجريبي</TabsTrigger>
            </TabsList>
            <TabsContent value="real" className="pt-2">
              <div className="rounded-md bg-red-50 p-3 text-red-800 dark:bg-red-900/20 dark:text-red-300 text-sm">
                ⚠️ تنبيه: هذا الحساب سيستخدم الأموال الحقيقية للتداول. تأكد من فهمك للمخاطر المالية المرتبطة بالتداول.
              </div>
            </TabsContent>
            <TabsContent value="demo" className="pt-2">
              <div className="rounded-md bg-blue-50 p-3 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 text-sm">
                ℹ️ حساب تجريبي للتداول بأموال افتراضية دون أي مخاطر مالية حقيقية.
              </div>
            </TabsContent>
          </Tabs>
          
          <Button 
            className="w-full bg-gradient-to-r from-hamzah-500 to-hamzah-600 hover:from-hamzah-600 hover:to-hamzah-700 text-white"
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
