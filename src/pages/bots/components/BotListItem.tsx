
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Loader2, BarChart2, Info, AlertTriangle, Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { TradingBot, TradingAccount } from "@/services/binance/types";
import { getBotStatus, startBot, stopBot } from "@/services/binance/tradingBotService";
import { formatDistance } from 'date-fns';
import { ar } from 'date-fns/locale';

interface BotListItemProps {
  bot: TradingBot;
  account: TradingAccount;
  onDelete: (botId: string) => void;
  refreshBots: () => void;
}

const BotListItem = ({ bot, account, onDelete, refreshBots }: BotListItemProps) => {
  const [loading, setLoading] = useState(false);
  const [botStatus, setBotStatus] = useState<any>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (bot.is_active) {
      fetchBotStatus();
      // Set up polling for active bots to refresh status every 30 seconds
      const interval = setInterval(fetchBotStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [bot.is_active]);

  const fetchBotStatus = async () => {
    try {
      const status = await getBotStatus(bot.id);
      setBotStatus(status);
      setLastUpdateTime(new Date());
    } catch (error) {
      console.error("Error fetching bot status:", error);
    }
  };

  const handleToggleBot = async () => {
    try {
      setLoading(true);
      if (bot.is_active) {
        await stopBot(bot.id);
        toast({
          title: "تم إيقاف الروبوت",
          description: "تم إيقاف الروبوت بنجاح"
        });
      } else {
        const result = await startBot(bot.id);
        toast({
          title: "تم تشغيل الروبوت",
          description: result.message || "تم تشغيل الروبوت بنجاح"
        });
      }
      refreshBots();
      setTimeout(fetchBotStatus, 1000);
    } catch (error: any) {
      console.error("Error toggling bot:", error);
      toast({
        variant: "destructive",
        title: "خطأ في تغيير حالة الروبوت",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get status color
  const getStatusColor = () => {
    if (!bot.is_active) return "gray";
    const serverStatus = botStatus?.server_status;
    
    if (serverStatus === 'running') return "green";
    if (serverStatus === 'error') return "red";
    if (serverStatus === 'stopped') return "gray";
    return "yellow";
  };

  // Helper function to get status text
  const getStatusText = () => {
    if (!bot.is_active) return "متوقف";
    const serverStatus = botStatus?.server_status;
    
    if (serverStatus === 'running') return "يعمل";
    if (serverStatus === 'error') return "خطأ";
    if (serverStatus === 'stopped') return "متوقف";
    return "جاري التحميل...";
  };

  return (
    <Card className="w-full mb-4 overflow-hidden border-2 relative" 
      style={{ borderColor: getStatusColor() === "green" ? "#10b981" : getStatusColor() === "red" ? "#ef4444" : getStatusColor() === "yellow" ? "#f59e0b" : "#6b7280" }}>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">{bot.name}</CardTitle>
          <div className="flex items-center space-x-2 space-x-reverse">
            <Badge variant={getStatusColor() === "green" ? "success" : getStatusColor() === "red" ? "destructive" : getStatusColor() === "yellow" ? "warning" : "secondary"}>
              {getStatusText()}
            </Badge>
          </div>
        </div>
        <CardDescription>
          {bot.description || `روبوت تداول آلي ل${account.name} (${account.platform})`}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium mb-1">استراتيجية التداول</h4>
            <p className="text-sm text-muted-foreground">{bot.strategy_type === 'trend_following' ? 'تتبع الاتجاه' : 
              bot.strategy_type === 'mean_reversion' ? 'الارتداد للمتوسط' : 
              bot.strategy_type === 'breakout' ? 'اختراق المستويات' : 
              bot.strategy_type === 'scalping' ? 'سكالبينج' : bot.strategy_type}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-1">مستوى المخاطرة</h4>
            <p className="text-sm text-muted-foreground">
              {bot.risk_level === 'low' ? 'منخفض' : 
               bot.risk_level === 'medium' ? 'متوسط' : 
               bot.risk_level === 'high' ? 'مرتفع' : bot.risk_level}
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-1">زوج التداول</h4>
            <p className="text-sm text-muted-foreground">{bot.trading_pair}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-1">وضع التداول</h4>
            <p className="text-sm text-muted-foreground">
              {bot.trading_mode === 'demo' ? 'تجريبي' : 'حقيقي'}
              {bot.trading_mode === 'real' && (
                <span className="mr-1 text-red-500">
                  <AlertTriangle className="h-3 w-3 inline mr-1" />
                  تداول حقيقي
                </span>
              )}
            </p>
          </div>
        </div>
        
        {botStatus && bot.is_active && (
          <div className="mt-4 border-t pt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Server Status */}
              <div>
                <h4 className="text-sm font-medium flex items-center mb-1">
                  <Info className="h-4 w-4 ml-1" />
                  حالة الخادم
                </h4>
                <p className="text-sm text-muted-foreground">
                  {botStatus.server_status === 'running' ? 'يعمل على الخادم' : 
                   botStatus.server_status === 'error' ? 'خطأ في الخادم' : 
                   botStatus.server_status === 'stopped' ? 'متوقف' : 'غير معروف'}
                </p>
                {botStatus.uptime && (
                  <div className="flex items-center mt-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 ml-1" />
                    مدة التشغيل: {botStatus.uptime.formatted}
                  </div>
                )}
              </div>
              
              {/* Last Activity */}
              <div>
                <h4 className="text-sm font-medium flex items-center mb-1">
                  <BarChart2 className="h-4 w-4 ml-1" />
                  آخر نشاط
                </h4>
                <p className="text-sm text-muted-foreground">
                  {botStatus.last_activity ? (
                    formatDistance(
                      new Date(botStatus.last_activity),
                      new Date(),
                      { addSuffix: true, locale: ar }
                    )
                  ) : 'لم يتم تسجيل نشاط بعد'}
                </p>
              </div>
            </div>
            
            {lastUpdateTime && (
              <div className="text-xs text-muted-foreground text-left mt-2 dir-ltr">
                Last updated: {lastUpdateTime.toLocaleTimeString()}
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 flex justify-between">
        <Button variant="outline" size="sm" onClick={() => onDelete(bot.id)}>
          حذف
        </Button>
        
        <div className="flex items-center space-x-2 space-x-reverse">
          <Label htmlFor={`bot-switch-${bot.id}`} className="ml-2">
            {bot.is_active ? "إيقاف الروبوت" : "تشغيل الروبوت"}
          </Label>
          <Switch
            id={`bot-switch-${bot.id}`}
            checked={bot.is_active}
            disabled={loading}
            onCheckedChange={handleToggleBot}
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>
      </CardFooter>
      
      {bot.trading_mode === 'real' && (
        <div className="absolute top-0 left-0 right-0 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs py-1 px-2 text-center">
          تنبيه: تداول حقيقي يؤثر على أموالك الفعلية!
        </div>
      )}
    </Card>
  );
};

export default BotListItem;
