
import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BotAutoManagementDialogProps {
  accounts: any[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const BotAutoManagementDialog = ({ accounts, isOpen, onOpenChange }: BotAutoManagementDialogProps) => {
  const { toast } = useToast();
  const [isCreatingAutoBot, setIsCreatingAutoBot] = useState(false);
  const [newBotName, setNewBotName] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [tradingPairs, setTradingPairs] = useState<string[]>([
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT'
  ]);
  
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([
    'trend_following', 'mean_reversion'
  ]);
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [autoManagementSettings, setAutoManagementSettings] = useState({
    enabled: false,
    smartPositionSizing: true,
    autoStrategyRotation: true,
    adaptiveRiskManagement: true,
    profitReinvestmentRate: 50,
    capitalPreservation: true,
    maxDailyTrades: 5
  });

  const handleCreateAutoBot = async () => {
    try {
      if (!newBotName || !selectedAccountId) {
        toast({
          variant: "destructive",
          title: "البيانات غير مكتملة",
          description: "الرجاء إدخال اسم الروبوت واختيار حساب"
        });
        return;
      }
      
      setIsCreatingAutoBot(true);
      
      const { data: accountData, error: accountError } = await supabase
        .from('trading_accounts')
        .select('*')
        .eq('id', selectedAccountId)
        .single();
        
      if (accountError) throw accountError;
      
      if (!accountData.is_active) {
        toast({
          variant: "destructive",
          title: "الحساب غير مفعل",
          description: "الرجاء تفعيل الحساب أولاً قبل إنشاء روبوت"
        });
        return;
      }
      
      const { data: botData, error: botError } = await supabase
        .from('trading_bots')
        .insert({
          name: newBotName,
          account_id: selectedAccountId,
          strategy_type: 'smart_auto',
          trading_pair: tradingPairs[0],
          trading_pairs: tradingPairs,
          is_active: true,
          risk_level: riskLevel,
          description: 'روبوت ذكي بإدارة تلقائية للاستراتيجيات والصفقات',
          trading_mode: accountData.trading_mode,
          server_status: 'stopped',
          max_open_trades: autoManagementSettings.maxDailyTrades,
          auto_management: true,
          auto_settings: {
            smart_position_sizing: autoManagementSettings.smartPositionSizing,
            auto_strategy_rotation: autoManagementSettings.autoStrategyRotation,
            capital_preservation: autoManagementSettings.capitalPreservation,
            max_daily_trades: autoManagementSettings.maxDailyTrades,
            profit_reinvestment_rate: autoManagementSettings.profitReinvestmentRate,
            adaptive_risk_management: autoManagementSettings.adaptiveRiskManagement
          },
          multi_strategy: true,
          strategies_rotation: {
            enabled: true,
            performance_based: true,
            strategies: selectedStrategies
          }
        })
        .select();
        
      if (botError) throw botError;
      
      await supabase
        .from('trading_accounts')
        .update({
          auto_position_sizing: autoManagementSettings.smartPositionSizing,
          auto_strategy_selection: autoManagementSettings.autoStrategyRotation,
          reinvest_profits: autoManagementSettings.profitReinvestmentRate > 0,
          max_trades_per_day: autoManagementSettings.maxDailyTrades
        })
        .eq('id', selectedAccountId);
      
      toast({
        title: "تم إنشاء الروبوت بنجاح",
        description: `تم إنشاء روبوت "${newBotName}" بإدارة تلقائية ذكية`
      });
      
      await supabase.from('trading_logs').insert({
        bot_id: botData[0].id,
        account_id: selectedAccountId,
        log_type: 'info',
        message: 'تم إنشاء روبوت بإدارة تلقائية ذكية',
        details: { 
          auto_settings: autoManagementSettings,
          trading_pairs: tradingPairs,
          strategies: selectedStrategies,
          risk_level: riskLevel
        }
      });
      
      onOpenChange(false);
      setNewBotName("");
      setSelectedAccountId("");
      setAutoManagementSettings({
        enabled: false,
        smartPositionSizing: true,
        autoStrategyRotation: true,
        adaptiveRiskManagement: true,
        profitReinvestmentRate: 50,
        capitalPreservation: true,
        maxDailyTrades: 5
      });
    } catch (error: any) {
      console.error("Error creating auto bot:", error);
      toast({
        variant: "destructive",
        title: "خطأ في إنشاء الروبوت",
        description: error.message
      });
    } finally {
      setIsCreatingAutoBot(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">إنشاء روبوت ذكي بإدارة تلقائية</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Alert className="mb-6 bg-blue-50 border-blue-300 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
            <InfoIcon className="h-5 w-5" />
            <AlertTitle className="font-bold">إدارة تلقائية ذكية</AlertTitle>
            <AlertDescription>
              سيقوم الروبوت الذكي بتحليل السوق واختيار الاستراتيجية الأفضل تلقائياً، وإدارة أحجام المراكز بشكل ذكي لمضاعفة رأس المال.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bot-name">اسم الروبوت</Label>
                <Input 
                  id="bot-name" 
                  placeholder="أدخل اسم الروبوت الذكي" 
                  value={newBotName}
                  onChange={(e) => setNewBotName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="account-select">اختر الحساب</Label>
                <select 
                  id="account-select"
                  className="flex h-10 w-full rounded-md border border-hamzah-200 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-hamzah-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                >
                  <option value="">اختر حساب التداول</option>
                  {accounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.account_name} - {account.platform}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>مستوى المخاطرة</Label>
              <div className="flex space-x-2">
                <Button 
                  variant={riskLevel === 'low' ? 'default' : 'outline'} 
                  className={`flex-1 mr-2 ${riskLevel === 'low' ? 'bg-green-500 hover:bg-green-600' : ''}`}
                  onClick={() => setRiskLevel('low')}
                >
                  منخفض
                </Button>
                <Button 
                  variant={riskLevel === 'medium' ? 'default' : 'outline'} 
                  className={`flex-1 mr-2 ${riskLevel === 'medium' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}`}
                  onClick={() => setRiskLevel('medium')}
                >
                  متوسط
                </Button>
                <Button 
                  variant={riskLevel === 'high' ? 'default' : 'outline'} 
                  className={`flex-1 ${riskLevel === 'high' ? 'bg-red-500 hover:bg-red-600' : ''}`}
                  onClick={() => setRiskLevel('high')}
                >
                  عالي
                </Button>
              </div>
            </div>
            
            <div>
              <Label className="mb-2 block">أزواج التداول</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'DOGEUSDT', 'SOLUSDT', 'MATICUSDT', 'XRPUSDT'].map(pair => (
                  <div key={pair} className="flex items-center">
                    <input 
                      type="checkbox" 
                      id={`pair-${pair}`}
                      className="mr-2 h-4 w-4"
                      checked={tradingPairs.includes(pair)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTradingPairs([...tradingPairs, pair]);
                        } else {
                          setTradingPairs(tradingPairs.filter(p => p !== pair));
                        }
                      }}
                    />
                    <label htmlFor={`pair-${pair}`}>{pair}</label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Label className="mb-2 block">الاستراتيجيات المستخدمة</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { id: 'trend_following', name: 'تتبع الاتجاه' },
                  { id: 'mean_reversion', name: 'الارتداد المتوسط' },
                  { id: 'breakout', name: 'الاختراق' },
                  { id: 'scalping', name: 'المضاربة السريعة' }
                ].map(strategy => (
                  <div key={strategy.id} className="flex items-center">
                    <input 
                      type="checkbox" 
                      id={`strategy-${strategy.id}`}
                      className="mr-2 h-4 w-4"
                      checked={selectedStrategies.includes(strategy.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStrategies([...selectedStrategies, strategy.id]);
                        } else {
                          setSelectedStrategies(selectedStrategies.filter(s => s !== strategy.id));
                        }
                      }}
                    />
                    <label htmlFor={`strategy-${strategy.id}`}>{strategy.name}</label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-3 border-t pt-3">
              <h3 className="font-bold text-lg mt-2">إعدادات الإدارة الذكية</h3>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="smart-sizing">تحديد أحجام المراكز تلقائياً</Label>
                <Switch 
                  id="smart-sizing"
                  checked={autoManagementSettings.smartPositionSizing}
                  onCheckedChange={(checked) => setAutoManagementSettings({
                    ...autoManagementSettings,
                    smartPositionSizing: checked
                  })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-strategy">تبديل الاستراتيجيات تلقائياً حسب ظروف السوق</Label>
                <Switch 
                  id="auto-strategy"
                  checked={autoManagementSettings.autoStrategyRotation}
                  onCheckedChange={(checked) => setAutoManagementSettings({
                    ...autoManagementSettings,
                    autoStrategyRotation: checked
                  })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="capital-preservation">الحفاظ على رأس المال</Label>
                <Switch 
                  id="capital-preservation"
                  checked={autoManagementSettings.capitalPreservation}
                  onCheckedChange={(checked) => setAutoManagementSettings({
                    ...autoManagementSettings,
                    capitalPreservation: checked
                  })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="adaptive-risk">إدارة المخاطر التكيفية</Label>
                <Switch 
                  id="adaptive-risk"
                  checked={autoManagementSettings.adaptiveRiskManagement}
                  onCheckedChange={(checked) => setAutoManagementSettings({
                    ...autoManagementSettings,
                    adaptiveRiskManagement: checked
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="max-trades">
                  الحد الأقصى للصفقات اليومية: {autoManagementSettings.maxDailyTrades}
                </Label>
                <input 
                  id="max-trades"
                  type="range"
                  min="1"
                  max="20"
                  value={autoManagementSettings.maxDailyTrades}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  onChange={(e) => setAutoManagementSettings({
                    ...autoManagementSettings,
                    maxDailyTrades: parseInt(e.target.value)
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reinvestment-rate">
                  معدل إعادة استثمار الأرباح: {autoManagementSettings.profitReinvestmentRate}%
                </Label>
                <input 
                  id="reinvestment-rate"
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={autoManagementSettings.profitReinvestmentRate}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  onChange={(e) => setAutoManagementSettings({
                    ...autoManagementSettings,
                    profitReinvestmentRate: parseInt(e.target.value)
                  })}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            إلغاء
          </Button>
          <Button 
            onClick={handleCreateAutoBot}
            disabled={isCreatingAutoBot || !newBotName || !selectedAccountId || tradingPairs.length === 0 || selectedStrategies.length === 0}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            {isCreatingAutoBot ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري الإنشاء...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                إنشاء الروبوت الذكي
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BotAutoManagementDialog;
