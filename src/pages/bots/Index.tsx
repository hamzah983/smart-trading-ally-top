
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, Sparkles, HelpCircle } from "lucide-react";
import { supabase, resetSupabaseHeaders } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

import BotAutoManagementDialog from "./components/BotAutoManagementDialog";
import AddAccountDialog from "./components/AddAccountDialog";
import EmptyAccountsView from "./components/EmptyAccountsView";
import AccountListItem from "./components/AccountListItem";
import BotUsageGuide from "./components/BotUsageGuide";

const BotsPage = () => {
  useEffect(() => {
    resetSupabaseHeaders();
  }, []);
  
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [accountAnalysis, setAccountAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAutoManagementDialogOpen, setIsAutoManagementDialogOpen] = useState(false);

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
      
      const { data, error } = await supabase
        .from('trading_accounts')
        .select('*')
        .eq('user_id', sessionData.session.user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setAccounts(data || []);
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

  const handleStartBot = async (botId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('trading-api', {
        body: {
          action: 'start_bot',
          botId: botId
        }
      });
      
      if (error) throw error;
      
      if (data.success) {
        toast({
          title: "تم تشغيل الروبوت",
          description: data.message
        });
      } else {
        toast({
          variant: "destructive",
          title: "خطأ في تشغيل الروبوت",
          description: data.message || "حدث خطأ أثناء محاولة تشغيل الروبوت"
        });
      }
    } catch (error: any) {
      console.error("Error starting bot:", error);
      toast({
        variant: "destructive",
        title: "خطأ في تشغيل الروبوت",
        description: error.message
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-hamzah-50 to-hamzah-100 dark:from-hamzah-900 dark:to-hamzah-800">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-hamzah-800 dark:text-hamzah-100">
              حسابات التداول
            </h1>
            <p className="text-hamzah-600 dark:text-hamzah-300">
              إدارة حسابات التداول المرتبطة بمنصات التداول المختلفة
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              className="flex items-center mr-2 border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
              onClick={() => setIsAutoManagementDialogOpen(true)}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              إنشاء روبوت ذكي
            </Button>
            
            <Button 
              className="glass-morphism hover:scale-105 smooth-transition flex items-center"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              إضافة حساب جديد
            </Button>
            
            <Button
              variant="outline"
              className="flex items-center mr-2"
              onClick={() => setShowGuide(!showGuide)}
              title={showGuide ? "إخفاء دليل الاستخدام" : "إظهار دليل الاستخدام"}
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              {showGuide ? "إخفاء الدليل" : "دليل الاستخدام"}
            </Button>
          </div>
        </motion.div>

        {showGuide && <BotUsageGuide />}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-hamzah-600 dark:text-hamzah-300" />
          </div>
        ) : accounts.length === 0 ? (
          <EmptyAccountsView onAddAccount={() => setIsAddDialogOpen(true)} />
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {accounts.map((account) => (
              <AccountListItem 
                key={account.id}
                account={account}
                onRefetch={fetchAccounts}
                accountAnalysis={accountAnalysis}
                isAnalyzing={isAnalyzing}
                isSyncing={isSyncing}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <BotAutoManagementDialog 
        accounts={accounts}
        isOpen={isAutoManagementDialogOpen}
        onOpenChange={setIsAutoManagementDialogOpen}
      />

      <AddAccountDialog 
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={fetchAccounts}
      />
    </div>
  );
};

export default BotsPage;
