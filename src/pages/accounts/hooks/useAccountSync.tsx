
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { syncAccount, performRealTradingAnalysis } from "@/services/accounts/tradingService";

export const useAccountSync = (fetchAccounts: () => Promise<void>) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [accountAnalysis, setAccountAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

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

  return {
    isSyncing,
    accountAnalysis,
    isAnalyzing,
    handleSyncAccount
  };
};
