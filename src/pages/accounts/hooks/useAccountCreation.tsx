
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useAccountCreation = (fetchAccounts: () => Promise<void>) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountPlatform, setNewAccountPlatform] = useState("Binance");
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

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

  return {
    isAddDialogOpen,
    setIsAddDialogOpen,
    newAccountName,
    setNewAccountName,
    newAccountPlatform,
    setNewAccountPlatform,
    isCreating,
    handleCreateAccount
  };
};
