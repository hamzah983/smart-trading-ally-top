
import React from 'react';
import { TradingBot } from '@/services/binance/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowUpDown,
  BarChart3, 
  Edit, 
  Trash2, 
  Play, 
  Pause,
  Info
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BotListItemProps {
  bot: TradingBot;
  onEdit: (bot: TradingBot) => void;
  onDelete: (botId: string) => void;
  onToggleActive: (botId: string, currentStatus: boolean) => void;
  onViewStats: (botId: string) => void;
}

const BotListItem: React.FC<BotListItemProps> = ({
  bot,
  onEdit,
  onDelete,
  onToggleActive,
  onViewStats
}) => {
  const getStrategyTypeLabel = (type: string) => {
    switch (type) {
      case 'trend_following':
        return 'تتبع الاتجاه';
      case 'mean_reversion':
        return 'الارتداد المتوسط';
      case 'breakout':
        return 'اختراق السعر';
      case 'scalping':
        return 'سكالبينج';
      default:
        return type;
    }
  };

  const formatTradingPair = (pair: string) => {
    return pair.replace('USDT', '/USDT');
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getServerStatusLabel = (status?: string) => {
    switch (status) {
      case 'running':
        return 'قيد التشغيل';
      case 'stopped':
        return 'متوقف';
      case 'error':
        return 'خطأ';
      default:
        return 'غير معروف';
    }
  };

  const getServerStatusVariant = (status?: string) => {
    switch (status) {
      case 'running':
        return 'success' as const;
      case 'stopped':
        return 'secondary' as const;
      case 'error':
        return 'destructive' as const;
      default:
        return 'outline' as const;
    }
  };

  const formatLastActivity = (dateString?: string) => {
    if (!dateString) return 'غير متوفر';
    
    const date = new Date(dateString);
    return date.toLocaleString('ar-SA');
  };

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex flex-col">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-semibold">{bot.name}</h3>
              <Badge 
                variant={bot.is_active ? 'success' : 'secondary'}
                className="mr-2"
              >
                {bot.is_active ? 'نشط' : 'غير نشط'}
              </Badge>
              <Badge 
                variant={bot.trading_mode === 'real' ? 'destructive' : 'outline'} 
                className="mr-2"
              >
                {bot.trading_mode === 'real' ? 'حقيقي' : 'تجريبي'}
              </Badge>
              <Badge 
                variant={getServerStatusVariant(bot.server_status)}
                className="mr-2"
              >
                {getServerStatusLabel(bot.server_status)}
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <ArrowUpDown className="w-4 h-4 ml-1" />
                <span>{formatTradingPair(bot.trading_pair)}</span>
              </div>
              <div className="flex items-center">
                <BarChart3 className="w-4 h-4 ml-1" />
                <span>{getStrategyTypeLabel(bot.strategy_type)}</span>
              </div>
              <div>
                <span className={`px-2 py-1 rounded ${getRiskLevelColor(bot.risk_level)}`}>
                  مخاطرة: {bot.risk_level === 'low' ? 'منخفضة' : bot.risk_level === 'medium' ? 'متوسطة' : 'عالية'}
                </span>
              </div>
            </div>
            
            {bot.last_activity && (
              <div className="text-xs text-gray-500 mt-2">
                آخر نشاط: {formatLastActivity(bot.last_activity)}
              </div>
            )}
            
            {bot.description && (
              <p className="text-sm text-gray-600 mt-2 max-w-md">{bot.description}</p>
            )}
          </div>
          
          <div className="flex items-center mt-4 md:mt-0 space-x-2 space-x-reverse">
            <Switch 
              checked={bot.is_active} 
              onCheckedChange={() => onToggleActive(bot.id, bot.is_active)}
              aria-label={bot.is_active ? 'إيقاف الروبوت' : 'تشغيل الروبوت'}
            />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Info className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>خيارات الروبوت</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onViewStats(bot.id)}>
                  <BarChart3 className="ml-2 h-4 w-4" /> إحصائيات
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(bot)}>
                  <Edit className="ml-2 h-4 w-4" /> تعديل
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600" 
                  onClick={() => onDelete(bot.id)}
                >
                  <Trash2 className="ml-2 h-4 w-4" /> حذف
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {bot.is_active ? (
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => onToggleActive(bot.id, bot.is_active)}
                title="إيقاف الروبوت"
              >
                <Pause className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => onToggleActive(bot.id, bot.is_active)}
                title="تشغيل الروبوت"
              >
                <Play className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {bot.performance_metrics && (
          <div className="mt-4 grid grid-cols-4 gap-2 border-t pt-4">
            <div className="text-center">
              <div className="text-sm text-gray-500">الصفقات</div>
              <div className="font-semibold">{bot.performance_metrics.total_trades}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">الربحية</div>
              <div className="font-semibold">{bot.performance_metrics.profitable_trades}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">معدل الفوز</div>
              <div className="font-semibold">{bot.performance_metrics.win_rate}%</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">الربح/الخسارة</div>
              <div className={`font-semibold ${bot.performance_metrics.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {bot.performance_metrics.profit_loss >= 0 ? '+' : ''}{bot.performance_metrics.profit_loss}%
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BotListItem;
