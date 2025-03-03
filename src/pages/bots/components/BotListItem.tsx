import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Loader2, Play, Pause, Settings, TrendingUp, RefreshCw, AlertTriangle, DollarSign, FlaskConical } from "lucide-react";
import { TradingBot } from "@/services/binance/types";
import { cn } from "@/lib/utils";

interface BotListItemProps {
  bot: TradingBot;
  onToggle: (botId: string, status: boolean) => Promise<void>;
  onEdit: (bot: TradingBot) => void;
  onDelete: (botId: string) => Promise<void>;
  onStart: (botId: string) => Promise<void>;
  onStop: (botId: string) => Promise<void>;
  toggling: boolean;
  toggledBotId: string | null;
  accounts: any[];
}

const BotListItem = ({
  bot,
  onToggle,
  onEdit,
  onDelete,
  onStart,
  onStop,
  toggling,
  toggledBotId,
  accounts
}: BotListItemProps) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const account = accounts.find(acc => acc.id === bot.account_id);
  const isToggling = toggling && toggledBotId === bot.id;
  const isRunning = bot.status === 'active';
  const isRealTrading = bot.trading_mode === 'real';

  const formatProfitLoss = (pnl?: number) => {
    if (pnl === undefined) return "0.00%";
    return `${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}%`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className={cn(
        "p-5 border-2 overflow-hidden",
        isRealTrading ? "border-red-200" : "border-hamzah-200"
      )}>
        {/* Trading Mode Indicator */}
        <div className="absolute top-0 right-0 p-1.5">
          {isRealTrading ? (
            <Badge variant="outline" className="bg-red-100 text-red-800 flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5" />
              <span>تداول حقيقي</span>
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-blue-100 text-blue-800 flex items-center gap-1">
              <FlaskConical className="h-3.5 w-3.5" />
              <span>تداول تجريبي</span>
            </Badge>
          )}
        </div>

        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold">{bot.name}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {account?.account_name} • {account?.platform}
            </p>
            {bot.description && (
              <p className="text-sm mt-2">{bot.description}</p>
            )}
          </div>
          
          <div className="flex items-center">
            <Switch
              checked={bot.is_active}
              onCheckedChange={(checked) => onToggle(bot.id, checked)}
              disabled={isToggling}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(bot)}
              className="ml-2"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {bot.trading_pairs.map((pair) => (
            <Badge key={pair} variant="outline" className="text-xs">
              {pair}
            </Badge>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">الربح/الخسارة</p>
            <p className={cn(
              "text-lg font-bold",
              (bot.profit_loss || 0) > 0 ? "text-green-600" : (bot.profit_loss || 0) < 0 ? "text-red-600" : ""
            )}>
              {formatProfitLoss(bot.profit_loss)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">معدل الربح</p>
            <p className="text-lg font-bold">
              {bot.win_rate ? `${bot.win_rate.toFixed(0)}%` : "0%"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">إجمالي الصفقات</p>
            <p className="text-lg font-bold">{bot.total_trades || 0}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div>
            <Badge 
              variant={bot.status === 'active' ? "default" : 
                     bot.status === 'paused' ? "outline" : 
                     bot.status === 'stopped' ? "secondary" : "destructive"}
              className="mr-2"
            >
              {bot.status === 'active' ? "نشط" : 
               bot.status === 'paused' ? "متوقف مؤقتاً" : 
               bot.status === 'stopped' ? "متوقف" : "خطأ"}
            </Badge>
            <Badge variant="outline" className={cn(
              bot.risk_level <= 3 ? "bg-green-50 text-green-700" :
              bot.risk_level <= 7 ? "bg-yellow-50 text-yellow-700" :
              "bg-red-50 text-red-700"
            )}>
              المخاطرة: {bot.risk_level <= 3 ? "منخفضة" : bot.risk_level <= 7 ? "متوسطة" : "عالية"}
            </Badge>
          </div>
          
          <div className="flex space-x-2">
            {bot.is_active && (
              isRunning ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStop(bot.id)}
                  className="border-yellow-300 bg-yellow-50 text-yellow-800 hover:bg-yellow-100"
                >
                  <Pause className="h-4 w-4 mr-1" />
                  إيقاف مؤقت
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStart(bot.id)}
                  className="border-green-300 bg-green-50 text-green-800 hover:bg-green-100"
                >
                  <Play className="h-4 w-4 mr-1" />
                  تشغيل
                </Button>
              )
            )}
            
            {isRealTrading && isRunning && (
              <div className="absolute -bottom-1 left-0 right-0 bg-red-100 text-red-800 text-xs py-1 px-3 flex items-center justify-center">
                <AlertTriangle className="h-3 w-3 mr-1" />
                <span>تنبيه: روبوت نشط يتداول بأموال حقيقية</span>
              </div>
            )}
          </div>
        </div>
        
        {showConfirmation && (
          <div className="mt-4 p-3 border border-red-300 rounded-md bg-red-50">
            <p className="text-red-800 mb-2">هل أنت متأكد من حذف هذا الروبوت؟</p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmation(false)}
              >
                إلغاء
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  onDelete(bot.id);
                  setShowConfirmation(false);
                }}
              >
                تأكيد الحذف
              </Button>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default BotListItem;
