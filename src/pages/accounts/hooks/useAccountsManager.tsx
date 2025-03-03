
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase, getClientWithTradingMode } from "@/integrations/supabase/client";
import { saveApiCredentials, syncAccount, performRealTradingAnalysis, changeTradingMode } from "@/services/binance/accountService";
import { TradingAccount } from "@/services/binance/types";

export const useAccountsManager = () => {
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<TradingAccount | null>(null);
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
  const [isChangingMode, setIsChangingMode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      
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
      
      let query = supabase
        .from('trading_accounts')
        .select('*')
        .eq('user_id', sessionData.session.user.id)
        .order('created_at', { ascending: false });
      
      const { data, error } = await query;
        
      if (error) throw error;
      
      const typedData: TradingAccount[] = data?.map(account => ({
        ...account,
        risk_level: account.risk_level as 'low' | 'medium' | 'high',
        // Ensure trading_mode exists, default to 'real' if not
        trading_mode: account.trading_mode || 'real'
      })) || [];
      
      setAccounts(typedData);
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
      
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        toast({
          variant: "destructive",
          title: "جلسة غير صالحة",
          description: "الرجاء تسجيل الدخول لإنشاء حساب جديد"
        });
        return;
      }
      
      // Prepare account data with required fields
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
        daily_profit_target: 2.0
      };
      
      // Check if trading_mode column exists
      let includesTradingMode = false;
      try {
        // Try adding trading_mode and see if it works
        const testData = {...accountData, trading_mode: 'real'};
        const { error: testError } = await supabase
          .from('trading_accounts')
          .insert(testData)
          .select();
          
        // If no error, the column exists
        if (!testError) {
          includesTradingMode = true;
          // If we created a test account, delete it
          const { data: testResponse } = await supabase
            .from('trading_accounts')
            .select('id')
            .eq('user_id', sessionData.session.user.id)
            .eq('account_name', newAccountName)
            .order('created_at', { ascending: false })
            .limit(1);
            
          if (testResponse && testResponse.length > 0) {
            await supabase
              .from('trading_accounts')
              .delete()
              .eq('id', testResponse[0].id);
          }
        }
      } catch (err) {
        console.warn('Error checking trading_mode column:', err);
      }
      
      // Add trading_mode if the column exists
      if (includesTradingMode) {
        const { data, error } = await supabase
          .from('trading_accounts')
          .insert({
            ...accountData,
            trading_mode: 'real' // Default to real trading mode
          })
          .select();
          
        if (error) throw error;
      } else {
        // Insert without trading_mode
        const { data, error } = await supabase
          .from('trading_accounts')
          .insert(accountData)
          .select();
          
        if (error) throw error;
      }
      
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: `تم إنشاء حساب "${newAccountName}" بنجاح`
      });
      
      setNewAccountName("");
      setNewAccountPlatform("Binance");
      setIsAddDialogOpen(false);
      
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
      
      const result = await saveApiCredentials(accountId, apiKey, apiSecret);
      
      if (result.success) {
        toast({
          title: "تم حفظ البيانات بنجاح",
          description: "تم التحقق من مفاتيح API والاتصال بالمنصة"
        });
        
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
      
      const result = await syncAccount(accountId);
      
      if (result.success) {
        toast({
          title: "تم مزامنة الحساب بنجاح",
          description: "تم تحديث بيانات الرصيد والمراكز المفتوحة"
        });
        
        fetchAccounts();
        
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
      const { error } = await supabase
        .from('trading_accounts')
        .update({ is_active: !currentStatus })
        .eq('id', accountId);
        
      if (error) throw error;
      
      toast({
        title: "تم تحديث حالة الحساب",
        description: `تم ${currentStatus ? 'تعطيل' : 'تفعيل'} الحساب بنجاح`
      });
      
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

  const handleChangeTradingMode = async (accountId: string, mode: 'real' | 'demo') => {
    try {
      setIsChangingMode(true);
      
      const result = await changeTradingMode(accountId, mode);
      
      if (result.success) {
        toast({
          title: "تم تغيير وضع التداول",
          description: `تم تغيير وضع التداول إلى ${mode === 'real' ? 'التداول الحقيقي' : 'وضع المحاكاة (التداول التجريبي)'}`
        });
        
        fetchAccounts();
        
        if (mode === 'real') {
          toast({
            variant: "destructive",
            title: "تنبيه هام",
            description: "تم تفعيل وضع التداول الحقيقي. سيتم استخدام أموالك الفعلية!",
            duration: 10000,
          });
          
          await analyzeAccountForRealTrading(accountId);
        }
      } else {
        toast({
          variant: "destructive",
          title: "خطأ في تغيير وضع التداول",
          description: result.message
        });
      }
    } catch (error: any) {
      console.error("Error changing trading mode:", error);
      toast({
        variant: "destructive",
        title: "خطأ في تغيير وضع التداول",
        description: error.message
      });
    } finally {
      setIsChangingMode(false);
    }
  };

  return {
    accounts,
    loading,
    selectedAccount,
    setSelectedAccount,
    apiKey,
    setApiKey,
    apiSecret,
    setApiSecret,
    isSaving,
    isSyncing,
    isAddDialogOpen,
    setIsAddDialogOpen,
    newAccountName,
    setNewAccountName,
    newAccountPlatform,
    setNewAccountPlatform,
    isCreating,
    accountAnalysis,
    isAnalyzing,
    isChangingMode,
    fetchAccounts,
    handleCreateAccount,
    handleSaveCredentials,
    handleSyncAccount,
    handleToggleAccountStatus,
    handleChangeTradingMode
  };
};
