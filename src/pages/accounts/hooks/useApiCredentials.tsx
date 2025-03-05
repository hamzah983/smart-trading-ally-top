
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { saveApiCredentials } from "@/services/binance/accountService";

export const useApiCredentials = (fetchAccounts: () => Promise<void>) => {
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

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

  return {
    apiKey,
    setApiKey,
    apiSecret,
    setApiSecret,
    isSaving,
    handleSaveCredentials
  };
};
