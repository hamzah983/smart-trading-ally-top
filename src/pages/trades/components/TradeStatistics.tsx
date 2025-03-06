
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface TradeStatsProps {
  totalTrades: number;
  openTrades: number;
  closedTrades: number;
  profitableTrades: number;
  totalProfit: number;
  winRate: string;
}

const TradeStatistics = ({ 
  totalTrades, 
  openTrades, 
  closedTrades, 
  profitableTrades, 
  totalProfit, 
  winRate 
}: TradeStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="hover-lift">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">عدد الصفقات</p>
              <h3 className="text-2xl font-bold">{totalTrades}</h3>
            </div>
            <div className="bg-hamzah-100 dark:bg-hamzah-800 p-3 rounded-full">
              <BarChart3 className="w-5 h-5 text-hamzah-600 dark:text-hamzah-300" />
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500">مفتوحة: </span>
              <span className="text-sm font-medium">{openTrades}</span>
            </div>
            <div>
              <span className="text-xs text-gray-500">مغلقة: </span>
              <span className="text-sm font-medium">{closedTrades}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="hover-lift">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">الصفقات الرابحة</p>
              <h3 className="text-2xl font-bold">{profitableTrades}</h3>
            </div>
            <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xs text-gray-500">نسبة الربح: </span>
            <span className="text-sm font-medium">{winRate}%</span>
          </div>
        </CardContent>
      </Card>
      
      <Card className="hover-lift">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">الصفقات الخاسرة</p>
              <h3 className="text-2xl font-bold">{closedTrades - profitableTrades}</h3>
            </div>
            <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-full">
              <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xs text-gray-500">نسبة الخسارة: </span>
            <span className="text-sm font-medium">
              {closedTrades 
                ? (100 - parseFloat(winRate)).toFixed(1) 
                : "0"}%
            </span>
          </div>
        </CardContent>
      </Card>
      
      <Card className="hover-lift">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">إجمالي الربح</p>
              <h3 className={`text-2xl font-bold ${
                totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {totalProfit.toFixed(2)}$
              </h3>
            </div>
            <div className={`${
              totalProfit >= 0 
                ? 'bg-green-100 dark:bg-green-900/20' 
                : 'bg-red-100 dark:bg-red-900/20'
              } p-3 rounded-full`}>
              <DollarSign className={`w-5 h-5 ${
                totalProfit >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xs text-gray-500">متوسط الربح للصفقة: </span>
            <span className="text-sm font-medium">
              {closedTrades 
                ? (totalProfit / closedTrades).toFixed(2) 
                : "0"}$
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradeStatistics;
