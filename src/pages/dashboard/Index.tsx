
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, TrendingUp, TrendingDown, DollarSign, ArrowUpDown } from "lucide-react";

const DashboardPage = () => {
  const portfolioData = {
    balance: 50000,
    profit: 1200,
    openTrades: 3,
    winRate: 68,
  };

  const recentTrades = [
    { id: 1, pair: "EUR/USD", type: "شراء", profit: 120, date: "2024-02-20" },
    { id: 2, pair: "GBP/JPY", type: "بيع", profit: -45, date: "2024-02-19" },
    { id: 3, pair: "USD/CAD", type: "شراء", profit: 85, date: "2024-02-18" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-hamzah-50 to-hamzah-100 dark:from-hamzah-900 dark:to-hamzah-800">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
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

        {/* Portfolio Overview */}
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

        {/* Recent Trades */}
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
            <div className="space-y-4">
              {recentTrades.map((trade) => (
                <div 
                  key={trade.id}
                  className="flex items-center justify-between border-b border-hamzah-200 dark:border-hamzah-700 pb-2"
                >
                  <div>
                    <h3 className="font-medium text-hamzah-800 dark:text-hamzah-100">{trade.pair}</h3>
                    <p className="text-sm text-hamzah-500">{trade.date}</p>
                  </div>
                  <div>
                    <span className="font-medium">{trade.type}</span>
                    <p className={`text-right ${trade.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ${Math.abs(trade.profit)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4 glass-morphism hover:scale-105 smooth-transition">
              عرض جميع الصفقات
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
