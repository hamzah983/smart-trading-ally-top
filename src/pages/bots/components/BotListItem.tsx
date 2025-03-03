
import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TradingBot } from '@/services/binance/types';
import { Play, Pause, Settings, BarChart2, Trash2 } from 'lucide-react';

interface BotListItemProps {
  bot: TradingBot;
  onStart: (botId: string) => void;
  onPause: (botId: string) => void;
  onEdit: (bot: TradingBot) => void;
  onDelete: (botId: string) => void;
  onViewStats: (botId: string) => void;
  isActionLoading: boolean;
  actionLoadingId: string | null;
}

const BotListItem: React.FC<BotListItemProps> = ({
  bot,
  onStart,
  onPause,
  onEdit,
  onDelete,
  onViewStats,
  isActionLoading,
  actionLoadingId
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'stopped': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return '';
    }
  };

  const isLoading = isActionLoading && actionLoadingId === bot.id;

  return (
    <Card className="glass-morphism p-5">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold">{bot.name}</h3>
            <Badge variant="outline" className={getStatusColor(bot.status)}>
              {bot.status === 'active' ? 'نشط' : 
               bot.status === 'paused' ? 'متوقف مؤقتًا' : 
               bot.status === 'stopped' ? 'متوقف' : 'خطأ'}
            </Badge>
            <Badge 
              variant="outline" 
              className={bot.trading_mode === 'real' ? 
                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              }
            >
              {bot.trading_mode === 'real' ? 'تداول حقيقي' : 'محاكاة'}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mb-3">{bot.description}</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {bot.trading_pairs.slice(0, 3).map((pair, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {pair}
              </Badge>
            ))}
            {bot.trading_pairs.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{bot.trading_pairs.length - 3}
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">الصفقات</p>
              <p className="font-semibold">{bot.total_trades || 0}</p>
            </div>
            <div>
              <p className="text-gray-500">نسبة الربح</p>
              <p className={bot.profit_loss && bot.profit_loss > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                {bot.profit_loss ? `${bot.profit_loss > 0 ? '+' : ''}${bot.profit_loss.toFixed(2)}%` : '0.00%'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">معدل الفوز</p>
              <p className="font-semibold">{bot.win_rate ? `${bot.win_rate.toFixed(0)}%` : 'N/A'}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          {bot.status === 'active' ? (
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full" 
              onClick={() => onPause(bot.id)}
              disabled={isLoading}
            >
              <Pause className="h-4 w-4 mr-1" />
              إيقاف
            </Button>
          ) : (
            <Button 
              size="sm" 
              className="w-full" 
              onClick={() => onStart(bot.id)}
              disabled={isLoading}
            >
              <Play className="h-4 w-4 mr-1" />
              تشغيل
            </Button>
          )}
          <Button size="sm" variant="outline" className="w-full" onClick={() => onEdit(bot)}>
            <Settings className="h-4 w-4 mr-1" />
            إعدادات
          </Button>
          <Button size="sm" variant="outline" className="w-full" onClick={() => onViewStats(bot.id)}>
            <BarChart2 className="h-4 w-4 mr-1" />
            الإحصائيات
          </Button>
          <Button size="sm" variant="destructive" className="w-full" onClick={() => onDelete(bot.id)}>
            <Trash2 className="h-4 w-4 mr-1" />
            حذف
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default BotListItem;
