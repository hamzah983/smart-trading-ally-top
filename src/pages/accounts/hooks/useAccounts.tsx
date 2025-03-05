
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TradingAccount } from "@/services/binance/types";

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<TradingAccount | null>(null);
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

  return {
    accounts,
    loading,
    selectedAccount,
    setSelectedAccount,
    fetchAccounts,
    handleToggleAccountStatus
  };
};
