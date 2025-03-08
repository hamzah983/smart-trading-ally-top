
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { changeTradingMode } from "@/services/accounts/tradingService";

export const useTradingMode = (fetchAccounts: () => Promise<void>) => {
  const [isChangingMode, setIsChangingMode] = useState(false);
  const { toast } = useToast();

  const handleChangeTradingMode = async (accountId: string, newMode: string) => {
    try {
      setIsChangingMode(true);
      
      const result = await changeTradingMode(accountId, newMode);
      
      if (result.success) {
        toast({
          title: "تم تغيير وضع التداول بنجاح",
          description: `تم تغيير وضع التداول إلى ${newMode === 'real' ? 'حقيقي' : 'تجريبي'}`
        });
        fetchAccounts();
      } else {
        toast({
          variant: "destructive",
          title: "خطأ في تغيير وضع التداول",
          description: result.message || "فشل تغيير وضع التداول"
        });
      }
    } catch (error: any) {
      console.error("Error changing trading mode:", error);
      toast({
        variant: "destructive",
        title: "خطأ في تغيير وضع التداول",
        description: error.message || "حدث خطأ أثناء تغيير وضع التداول"
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
