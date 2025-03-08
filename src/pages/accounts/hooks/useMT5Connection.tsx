
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { connectToMT5, getMT5Assets } from "@/services/accounts/mt5Service";

export const useMT5Connection = (fetchAccounts: () => Promise<void>) => {
  const [mt5Login, setMt5Login] = useState("");
  const [mt5Password, setMt5Password] = useState("");
  const [mt5Server, setMt5Server] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isFetchingAssets, setIsFetchingAssets] = useState(false);
  const [availableAssets, setAvailableAssets] = useState<Record<string, string[]>>({});
  const { toast } = useToast();

  // Custom setters that ensure RTL text is properly handled
  const handleSetMt5Login = (value: string) => {
    setMt5Login(value);
  };

  const handleSetMt5Password = (value: string) => {
    setMt5Password(value);
  };

  const handleSetMt5Server = (value: string) => {
    setMt5Server(value);
  };

  const handleConnectMT5 = async (accountId: string) => {
    try {
      if (!mt5Login || !mt5Password || !mt5Server) {
        toast({
          variant: "destructive",
          title: "البيانات غير مكتملة",
          description: "الرجاء إدخال جميع بيانات الاتصال بـ MT5"
        });
        return false;
      }
      
      setIsConnecting(true);
      
      const result = await connectToMT5(accountId, {
        login: mt5Login,
        password: mt5Password,
        server: mt5Server
      });
      
      if (result.success) {
        toast({
          title: "تم الاتصال بنجاح",
          description: "تم الاتصال بمنصة MT5 بنجاح"
        });
        
        // Fetch available assets after successful connection
        await fetchMT5Assets(accountId);
        
        fetchAccounts();
        return true;
      } else {
        toast({
          variant: "destructive",
          title: "خطأ في الاتصال",
          description: result.message || "تعذر الاتصال بمنصة MT5، تأكد من صحة البيانات"
        });
        return false;
      }
    } catch (error: any) {
      console.error("Error connecting to MT5:", error);
      toast({
        variant: "destructive",
        title: "خطأ في الاتصال",
        description: error.message || "حدث خطأ أثناء الاتصال بمنصة MT5"
      });
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  const fetchMT5Assets = async (accountId: string) => {
    try {
      setIsFetchingAssets(true);
      
      const assetClasses = ['forex', 'stocks', 'indices', 'commodities', 'cryptocurrencies', 'bonds', 'etfs', 'futures'];
      const assets: Record<string, string[]> = {};
      
      for (const assetClass of assetClasses) {
        const result = await getMT5Assets(accountId, assetClass);
        if (result.success && result.assets) {
          assets[assetClass] = result.assets;
        }
      }
      
      setAvailableAssets(assets);
      
      return assets;
    } catch (error: any) {
      console.error("Error fetching MT5 assets:", error);
      toast({
        variant: "destructive",
        title: "خطأ في جلب الأصول",
        description: error.message || "حدث خطأ أثناء جلب قائمة الأصول المتاحة"
      });
      return {};
    } finally {
      setIsFetchingAssets(false);
    }
  };

  return {
    mt5Login,
    setMt5Login: handleSetMt5Login,
    mt5Password,
    setMt5Password: handleSetMt5Password,
    mt5Server,
    setMt5Server: handleSetMt5Server,
    isConnecting,
    isFetchingAssets,
    availableAssets,
    handleConnectMT5,
    fetchMT5Assets
  };
};
