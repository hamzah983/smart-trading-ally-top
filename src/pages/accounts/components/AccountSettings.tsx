
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Link2, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { TradingAccount } from "@/services/binance/types";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AccountSettingsProps {
  account: TradingAccount;
  apiKey: string;
  apiSecret: string;
  setApiKey: (apiKey: string) => void;
  setApiSecret: (apiSecret: string) => void;
  handleSaveCredentials: (accountId: string) => Promise<void>;
  handleTestConnection?: (accountId: string) => Promise<boolean>;
  isSaving: boolean;
  isTestingConnection?: boolean;
  setSelectedAccount: (account: TradingAccount | null) => void;
  fetchAccounts: () => Promise<void>;
}

const AccountSettings = ({
  account,
  apiKey,
  apiSecret,
  setApiKey,
  setApiSecret,
  handleSaveCredentials,
  handleTestConnection,
  isSaving,
  isTestingConnection,
  setSelectedAccount,
  fetchAccounts
}: AccountSettingsProps) => {
  const { toast } = useToast();
  const [apiTips, setApiTips] = useState(false);

  return (
    <div className="mt-6 border-t border-hamzah-200 dark:border-hamzah-700 pt-4">
      <Tabs defaultValue="api">
        <TabsList className="mb-4">
          <TabsTrigger value="api">إعدادات API</TabsTrigger>
          <TabsTrigger value="risk">إعدادات المخاطر</TabsTrigger>
        </TabsList>
        
        <TabsContent value="api">
          <div className="space-y-4">
            {apiTips && (
              <Alert>
                <AlertCircle className="h-4 w-4 ml-2" />
                <AlertDescription>
                  <p className="mb-2 font-bold">نصائح لإعداد مفاتيح API:</p>
                  <ul className="list-disc pr-5 space-y-1">
                    <li>تأكد من تفعيل جميع عناوين IP في إعدادات المفتاح</li>
                    <li>امنح صلاحيات القراءة (Enable Reading) على الأقل</li>
                    <li>للتداول الحقيقي: فعّل صلاحيات التداول (Enable Trading)</li>
                    <li>تأكد من أن المفتاح غير منتهي الصلاحية</li>
                  </ul>
                  <Button
                    variant="link"
                    className="p-0 mt-2"
                    onClick={() => setApiTips(false)}
                  >
                    إغلاق
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            
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
              <Button 
                variant="ghost" 
                size="sm" 
                className="mr-2 p-1 h-6" 
                onClick={() => setApiTips(!apiTips)}
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
              
              <div className="space-x-2 space-x-reverse">
                {handleTestConnection && (
                  <Button 
                    variant="outline"
                    onClick={() => handleTestConnection(account.id)}
                    disabled={isTestingConnection || !apiKey || !apiSecret}
                  >
                    {isTestingConnection ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        جاري الاختبار...
                      </>
                    ) : "اختبار الاتصال"}
                  </Button>
                )}
                
                <Button 
                  onClick={() => handleSaveCredentials(account.id)}
                  disabled={isSaving || !apiKey || !apiSecret}
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
  );
};

export default AccountSettings;
