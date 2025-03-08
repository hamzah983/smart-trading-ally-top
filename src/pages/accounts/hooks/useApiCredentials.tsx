import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { 
  saveApiCredentials, 
  testConnection, 
  resetConnection 
} from "@/services/accounts/credentialsService";

export const useApiCredentials = (fetchAccounts: () => Promise<void>) => {
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();

  const handleTestConnection = async (accountId: string) => {
    try {
      if (!apiKey || !apiSecret) {
        toast({
          variant: "destructive",
          title: "البيانات غير مكتملة",
          description: "الرجاء إدخال مفتاح API وكلمة السر"
        });
        return;
      }
      
      setIsTestingConnection(true);
      
      // First test the connection only without saving
      const testResult = await testConnection(accountId);
      
      if (testResult.success) {
        toast({
          title: "تم التحقق من الاتصال بنجاح",
          description: "الاتصال بمنصة التداول ناجح، يمكنك الآن حفظ البيانات"
        });
        return true;
      } else {
        toast({
          variant: "destructive",
          title: "خطأ في الاتصال بالمنصة",
          description: testResult.message || "تعذر الاتصال بمنصة التداول، تأكد من صحة البيانات وصلاحيات API"
        });
        return false;
      }
    } catch (error: any) {
      console.error("Error testing connection:", error);
      toast({
        variant: "destructive",
        title: "خطأ في اختبار الاتصال",
        description: error.message || "حدث خطأ أثناء اختبار الاتصال بالمنصة"
      });
      return false;
    } finally {
      setIsTestingConnection(false);
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
      
      // First test connection to verify credentials
      const connectionValid = await handleTestConnection(accountId);
      
      if (!connectionValid) {
        // If connection test failed, don't proceed with saving
        return;
      }
      
      const result = await saveApiCredentials(accountId, apiKey, apiSecret);
      
      if (result.success) {
        toast({
          title: "تم حفظ البيانات بنجاح",
          description: "تم التحقق من مفاتيح API والاتصال بالمنصة"
        });
        
        // Clear the form fields after successful save
        setApiKey("");
        setApiSecret("");
        
        fetchAccounts();
      } else {
        // Provide more specific error messages based on common API issues
        let errorMessage = result.message;
        
        if (errorMessage?.includes("Invalid API-key")) {
          errorMessage = "مفتاح API غير صالح أو انتهت صلاحيته";
        } else if (errorMessage?.includes("IP")) {
          errorMessage = "عنوان IP غير مصرح به. تأكد من تفعيل كافة عناوين IP في إعدادات مفتاح API";
        } else if (errorMessage?.includes("permissions")) {
          errorMessage = "صلاحيات API غير كافية. تأكد من منح كافة الصلاحيات المطلوبة (القراءة على الأقل)";
        }
        
        toast({
          variant: "destructive",
          title: "خطأ في حفظ البيانات",
          description: errorMessage || "تعذر حفظ بيانات API، تأكد من صحة البيانات المدخلة"
        });
      }
    } catch (error: any) {
      console.error("Error saving credentials:", error);
      
      // Detect specific error types for better user feedback
      let errorMessage = error.message;
      
      if (error.message?.includes("Edge Function")) {
        errorMessage = "حدث خطأ في الاتصال بالخادم. الرجاء المحاولة مرة أخرى لاحقًا";
      } else if (error.message?.includes("Network")) {
        errorMessage = "مشكلة في الاتصال بالإنترنت. الرجاء التحقق من اتصالك بالإنترنت";
      }
      
      toast({
        variant: "destructive",
        title: "خطأ في حفظ البيانات",
        description: errorMessage
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetConnection = async (accountId: string) => {
    try {
      setIsResetting(true);
      
      const result = await resetConnection(accountId);
      
      if (result.success) {
        toast({
          title: "تم إعادة تهيئة الاتصال بنجاح",
          description: "يمكنك الآن إدخال مفاتيح API جديدة"
        });
        
        // Clear the form fields
        setApiKey("");
        setApiSecret("");
        
        fetchAccounts();
      } else {
        toast({
          variant: "destructive",
          title: "خطأ في إعادة تهيئة الاتصال",
          description: result.message || "تعذر إعادة تهيئة الاتصال، حاول مرة أخرى لاحقًا"
        });
      }
    } catch (error: any) {
      console.error("Error resetting connection:", error);
      toast({
        variant: "destructive",
        title: "خطأ في إعادة تهيئة الاتصال",
        description: error.message || "حدث خطأ أثناء إعادة تهيئة الاتصال"
      });
    } finally {
      setIsResetting(false);
    }
  };

  return {
    apiKey,
    setApiKey,
    apiSecret,
    setApiSecret,
    isSaving,
    isTestingConnection,
    isResetting,
    handleTestConnection,
    handleSaveCredentials,
    handleResetConnection
  };
};
