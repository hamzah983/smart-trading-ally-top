
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { changeTradingMode, performRealTradingAnalysis } from "@/services/binance/accountService";

export const useTradingMode = (fetchAccounts: () => Promise<void>) => {
  const [isChangingMode, setIsChangingMode] = useState(false);
  const { toast } = useToast();

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
          
          // Directly analyze the account here
          try {
            const analysis = await performRealTradingAnalysis(accountId);
            
            if (analysis.affectsRealMoney) {
              toast({
                variant: "destructive",
                title: "تنبيه: تداول حقيقي",
                description: "هذا الحساب جاهز للتداول الحقيقي وسيؤثر على أموالك الفعلية!",
                duration: 10000,
              });
            }
          } catch (analyzeError) {
            console.error("Error analyzing account:", analyzeError);
          }
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
    isChangingMode,
    handleChangeTradingMode
  };
};
