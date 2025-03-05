
import React, { useState, useEffect } from 'react';
import { TradingBot } from '@/services/binance/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';

interface BotFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (botData: any) => void;
  editBot?: TradingBot;
  accounts: any[];
}

const BotFormDialog: React.FC<BotFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editBot,
  accounts,
}) => {
  const [name, setName] = useState('');
  const [accountId, setAccountId] = useState('');
  const [strategyType, setStrategyType] = useState('trend_following');
  const [strategy, setStrategy] = useState('');
  const [tradingPairs, setTradingPairs] = useState<string[]>([]);
  const [maxOpenTrades, setMaxOpenTrades] = useState(0);
  const [maxOpenTradesStr, setMaxOpenTradesStr] = useState('0');
  const [tradingPair, setTradingPair] = useState('BTCUSDT');
  const [description, setDescription] = useState('');
  const [riskLevel, setRiskLevel] = useState<number>(1);
  const [maxRiskLevel, setMaxRiskLevel] = useState<'low' | 'medium' | 'high'>('low');
  const [tradingMode, setTradingMode] = useState('demo');
  const { toast } = useToast();

  useEffect(() => {
    if (editBot) {
      setName(editBot.name || '');
      setAccountId(editBot.account_id || '');
      setStrategyType(editBot.strategy_type || 'trend_following');
      setStrategy(editBot.strategy || '');
      setTradingPairs(editBot.trading_pairs || []);
      setMaxOpenTrades(editBot.max_open_trades || 0);
      setMaxOpenTradesStr(String(editBot.max_open_trades || 0));
      setTradingPair(editBot.trading_pair || 'BTCUSDT');
      setDescription(editBot.description || '');
      setRiskLevel(editBot.risk_level === 'low' ? 1 : editBot.risk_level === 'medium' ? 2 : 3);
      setMaxRiskLevel(editBot.risk_level || 'low');
      setTradingMode(editBot.trading_mode || 'demo');
    }
  }, [editBot]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert slider value to risk level text
    const riskLevelText: 'low' | 'medium' | 'high' = 
      riskLevel === 1 ? 'low' : riskLevel === 2 ? 'medium' : 'high';
    
    const botData = {
      name,
      account_id: accountId,
      strategy_type: strategyType,
      trading_pair: tradingPair,
      description,
      risk_level: riskLevelText,
      trading_mode: tradingMode,
    };
    
    onSubmit(botData);
  };

  const handleMaxOpenTradesChange = (value: string) => {
    setMaxOpenTradesStr(value);
    setMaxOpenTrades(parseInt(value) || 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editBot ? 'تعديل الروبوت' : 'إنشاء روبوت جديد'}</DialogTitle>
          <DialogDescription>
            {editBot ? 'قم بتعديل إعدادات الروبوت الخاص بك' : 'قم بإنشاء روبوت تداول جديد وتخصيصه'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">اسم الروبوت</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account" className="text-right">الحساب</Label>
              <Select 
                value={accountId} 
                onValueChange={setAccountId}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="اختر حساب" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="strategy" className="text-right">الاستراتيجية</Label>
              <Select 
                value={strategyType} 
                onValueChange={setStrategyType}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="اختر استراتيجية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trend_following">تتبع الاتجاه</SelectItem>
                  <SelectItem value="mean_reversion">الارتداد المتوسط</SelectItem>
                  <SelectItem value="breakout">اختراق السعر</SelectItem>
                  <SelectItem value="scalping">سكالبينج</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pair" className="text-right">زوج التداول</Label>
              <Select 
                value={tradingPair} 
                onValueChange={setTradingPair}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="اختر زوج التداول" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BTCUSDT">BTC/USDT</SelectItem>
                  <SelectItem value="ETHUSDT">ETH/USDT</SelectItem>
                  <SelectItem value="BNBUSDT">BNB/USDT</SelectItem>
                  <SelectItem value="ADAUSDT">ADA/USDT</SelectItem>
                  <SelectItem value="SOLUSDT">SOL/USDT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="risk" className="text-right">مستوى المخاطرة</Label>
              <div className="col-span-3">
                <Slider
                  id="risk"
                  min={1}
                  max={3}
                  step={1}
                  value={[riskLevel]}
                  onValueChange={(values) => {
                    setRiskLevel(values[0]);
                    setMaxRiskLevel(values[0] === 1 ? 'low' : values[0] === 2 ? 'medium' : 'high');
                  }}
                />
                <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                  <span>منخفض</span>
                  <span>متوسط</span>
                  <span>مرتفع</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="trading-mode" className="text-right">وضع التداول</Label>
              <div className="flex items-center space-x-4 space-x-reverse col-span-3">
                <Label htmlFor="demo-mode">تجريبي</Label>
                <Switch
                  id="trading-mode-switch"
                  checked={tradingMode === 'real'}
                  onCheckedChange={(checked) => setTradingMode(checked ? 'real' : 'demo')}
                />
                <Label htmlFor="real-mode">حقيقي</Label>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">الوصف</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                placeholder="وصف اختياري للروبوت"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit">
              {editBot ? 'تحديث' : 'إنشاء'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BotFormDialog;
