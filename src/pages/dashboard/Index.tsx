
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, TrendingUp, TrendingDown, DollarSign, ArrowUpDown, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface PortfolioData {
  balance: number;
  profit: number;
  openTrades: number;
  winRate: number;
}

interface Trade {
  id: string;
  symbol: string;
  type: string;
  pnl: number;
  created_at: string;
  status: string;
}

interface TechnicalIndicator {
  name: string;
  value: string;
  status: string;
}

const DashboardPage = () => {
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    balance: 0,
    profit: 0,
    openTrades: 0,
    winRate: 0,
  });
  
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const technicalIndicators = [
    { name: "RSI", value: "62", status: "متعادل" },
    { name: "MACD", value: "0.0023", status: "شراء" },
    { name: "المتوسط المتحرك 200", value: "1.0842", status: "بيع" }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // جلب بيانات جلسة المستخدم
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        
        if (!sessionData.session?.user) {
          return;
        }
        
        // جلب بيانات حسابات التداول للمستخدم
        const { data: accountsData, error: accountsError } = await supabase
          .from("trading_accounts")
          .select("id, balance, equity")
          .eq("user_id", sessionData.session.user.id)
          .eq("is_active", true)
          .limit(1);
          
        if (accountsError) throw accountsError;
        
        if (!accountsData || accountsData.length === 0) {
          setLoading(false);
          return;
        }
        
        const accountId = accountsData[0].id;
        const accountBalance = accountsData[0].balance || 0;
        
        // جلب بيانات الصفقات المفتوحة
        const { data: openTradesData, error: openTradesError } = await supabase
          .from("trades")
          .select("id")
          .eq("account_id", accountId)
          .eq("status", "open");
          
        if (openTradesError) throw openTradesError;
        
        // جلب جميع الصفقات لحساب نسبة الربح
        const { data: allTradesData, error: allTradesError } = await supabase
          .from("trades")
          .select("status, pnl")
          .eq("account_id", accountId)
          .not("status", "eq", "open");
          
        if (allTradesError) throw allTradesError;
        
        // حساب إجمالي الربح/الخسارة والنسبة المئوية للصفقات الرابحة
        let totalProfit = 0;
        let winningTrades = 0;
        
        if (allTradesData && allTradesData.length > 0) {
          totalProfit = allTradesData.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
          winningTrades = allTradesData.filter(trade => (trade.pnl || 0) > 0).length;
        }
        
        const winRate = allTradesData.length > 0 
          ? Math.round((winningTrades / allTradesData.length) * 100) 
          : 0;
        
        // جلب آخر الصفقات
        const { data: recentTradesData, error: recentTradesError } = await supabase
          .from("trades")
          .select("id, symbol, type, pnl, created_at, status")
          .eq("account_id", accountId)
          .order("created_at", { ascending: false })
          .limit(3);
          
        if (recentTradesError) throw recentTradesError;
        
        // تحديث بيانات المحفظة
        setPortfolioData({
          balance: accountBalance,
          profit: totalProfit,
          openTrades: openTradesData ? openTradesData.length : 0,
          winRate: winRate
        });
        
        // تحديث بيانات آخر الصفقات
        setRecentTrades(recentTradesData || []);
        
      } catch (error: any) {
        console.error("Error fetching dashboard data:", error);
        toast({
          variant: "destructive",
          title: "خطأ في جلب البيانات",
          description: error.message
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);

  // تنسيق تاريخ الصفقة
  const formatTradeDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-hamzah-50 to-hamzah-100 dark:from-hamzah-900 dark:to-hamzah-800">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-hamzah-800 dark:text-hamzah-100">
            مرحباً بك في لوحة التحكم
          </h1>
          <p className="text-hamzah-600 dark:text-hamzah-300">
            تابع تداولاتك وأداء محفظتك بشكل مباشر
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-hamzah-600 dark:text-hamzah-300" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="glass-morphism p-6">
                  <DollarSign className="w-8 h-8 mb-2 text-hamzah-600 dark:text-hamzah-300" />
                  <h3 className="text-lg font-medium mb-1">الرصيد</h3>
                  <p className="text-2xl font-bold text-hamzah-800 dark:text-hamzah-100">
                    ${portfolioData.balance.toLocaleString()}
                  </p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="glass-morphism p-6">
                  {portfolioData.profit >= 0 ? (
                    <TrendingUp className="w-8 h-8 mb-2 text-green-500" />
                  ) : (
                    <TrendingDown className="w-8 h-8 mb-2 text-red-500" />
                  )}
                  <h3 className="text-lg font-medium mb-1">الربح</h3>
                  <p className={`text-2xl font-bold ${portfolioData.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ${Math.abs(portfolioData.profit).toLocaleString()}
                  </p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="glass-morphism p-6">
                  <ArrowUpDown className="w-8 h-8 mb-2 text-hamzah-600 dark:text-hamzah-300" />
                  <h3 className="text-lg font-medium mb-1">الصفقات المفتوحة</h3>
                  <p className="text-2xl font-bold text-hamzah-800 dark:text-hamzah-100">
                    {portfolioData.openTrades}
                  </p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="glass-morphism p-6">
                  <LineChart className="w-8 h-8 mb-2 text-hamzah-600 dark:text-hamzah-300" />
                  <h3 className="text-lg font-medium mb-1">نسبة الربح</h3>
                  <p className="text-2xl font-bold text-hamzah-800 dark:text-hamzah-100">
                    {portfolioData.winRate}%
                  </p>
                </Card>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              <Card className="glass-morphism p-6">
                <h2 className="text-xl font-bold mb-4 text-hamzah-800 dark:text-hamzah-100">
                  آخر الصفقات
                </h2>
                {recentTrades.length > 0 ? (
                  <div className="space-y-4">
                    {recentTrades.map((trade) => (
                      <div 
                        key={trade.id}
                        className="flex items-center justify-between border-b border-hamzah-200 dark:border-hamzah-700 pb-2"
                      >
                        <div>
                          <h3 className="font-medium text-hamzah-800 dark:text-hamzah-100">{trade.symbol}</h3>
                          <p className="text-sm text-hamzah-500">{formatTradeDate(trade.created_at)}</p>
                        </div>
                        <div>
                          <span className="font-medium">{trade.type === 'buy' ? 'شراء' : 'بيع'}</span>
                          <p className={`text-right ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            ${Math.abs(trade.pnl || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-hamzah-500 py-4">لا توجد صفقات حديثة</p>
                )}
                <Button className="w-full mt-4 glass-morphism hover:scale-105 smooth-transition">
                  عرض جميع الصفقات
                </Button>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mb-8"
            >
              <Card className="glass-morphism p-6">
                <h2 className="text-xl font-bold mb-4 text-hamzah-800 dark:text-hamzah-100">
                  التحليل الفني
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {technicalIndicators.map((indicator, index) => (
                    <div 
                      key={index}
                      className="p-4 border border-hamzah-200 dark:border-hamzah-700 rounded-lg"
                    >
                      <h3 className="text-lg font-medium text-hamzah-800 dark:text-hamzah-100">
                        {indicator.name}
                      </h3>
                      <p className="text-2xl font-bold text-hamzah-600 dark:text-hamzah-300">
                        {indicator.value}
                      </p>
                      <p className={`text-sm font-medium ${
                        indicator.status === "شراء" 
                          ? "text-green-500" 
                          : indicator.status === "بيع" 
                            ? "text-red-500" 
                            : "text-yellow-500"
                      }`}>
                        {indicator.status}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button className="w-full glass-morphism hover:scale-105 smooth-transition">
                    فتح التحليل المتقدم
                  </Button>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
            >
              <Card className="glass-morphism p-6">
                <h2 className="text-xl font-bold mb-4 text-hamzah-800 dark:text-hamzah-100">
                  الأدوات السريعة
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <Button className="glass-morphism hover:scale-105 smooth-transition">
                    فتح صفقة جديدة
                  </Button>
                  <Button className="glass-morphism hover:scale-105 smooth-transition">
                    إغلاق كل الصفقات
                  </Button>
                  <Button className="glass-morphism hover:scale-105 smooth-transition">
                    تعديل وقف الخسارة
                  </Button>
                  <Button className="glass-morphism hover:scale-105 smooth-transition">
                    إعدادات المحفظة
                  </Button>
                </div>
              </Card>

              <Card className="glass-morphism p-6">
                <h2 className="text-xl font-bold mb-4 text-hamzah-800 dark:text-hamzah-100">
                  الإشعارات النشطة
                </h2>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <span className="text-yellow-800 dark:text-yellow-200">تنبيه سعري EUR/USD</span>
                    <Button variant="link" className="text-yellow-800 dark:text-yellow-200">
                      عرض
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <span className="text-blue-800 dark:text-blue-200">تقرير يومي جاهز</span>
                    <Button variant="link" className="text-blue-800 dark:text-blue-200">
                      عرض
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
