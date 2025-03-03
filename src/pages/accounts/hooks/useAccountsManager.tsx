
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { saveApiCredentials, syncAccount, performRealTradingAnalysis } from "@/services/binance/accountService";
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
      
      // Ensure the data matches the TradingAccount interface
      const typedData: TradingAccount[] = data?.map(account => ({
        ...account,
        risk_level: account.risk_level as 'low' | 'medium' | 'high'
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
    fetchAccounts,
    handleCreateAccount,
    handleSaveCredentials,
    handleSyncAccount,
    handleToggleAccountStatus
  };
};
