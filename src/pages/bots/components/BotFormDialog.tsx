
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import TradingModeSelector from './TradingModeSelector';
import { TradingAccount } from '@/services/binance/types';

interface BotFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (botData: any) => Promise<void>;
  accounts: TradingAccount[];
  isLoading: boolean;
  initialData?: {
    name: string;
    description: string;
    account_id: string;
    strategy: string;
    trading_pairs: string[];
    risk_level: number;
    max_open_trades: number;
    trading_mode: 'real' | 'demo';
  };
  title: string;
}

const BotFormDialog: React.FC<BotFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  accounts,
  isLoading,
  initialData,
  title
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [accountId, setAccountId] = useState(initialData?.account_id || '');
  const [strategy, setStrategy] = useState(initialData?.strategy || 'trend_following');
  const [tradingPairs, setTradingPairs] = useState(initialData?.trading_pairs?.join(', ') || 'BTC/USDT, ETH/USDT');
  const [riskLevel, setRiskLevel] = useState(initialData?.risk_level?.toString() || '5');
  const [maxOpenTrades, setMaxOpenTrades] = useState(initialData?.max_open_trades?.toString() || '3');
  const [tradingMode, setTradingMode] = useState<'real' | 'demo'>(initialData?.trading_mode || 'demo');

  const handleSubmit = async () => {
    if (!name || !accountId) {
      // Handle validation
      return;
    }

    const botData = {
      name,
      description,
      account_id: accountId,
      strategy,
      trading_pairs: tradingPairs.split(',').map(pair => pair.trim()),
      risk_level: parseInt(riskLevel),
      max_open_trades: parseInt(maxOpenTrades),
      trading_mode: tradingMode
    };

    await onSubmit(botData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">اسم الروبوت</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ادخل اسم الروبوت"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">وصف</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف موجز لروبوت التداول"
              rows={3}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="account">حساب التداول</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="اختر حساب التداول" />
              </SelectTrigger>
              <SelectContent>
                {accounts.filter(acc => acc.is_api_verified).map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.account_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="strategy">استراتيجية التداول</Label>
            <Select value={strategy} onValueChange={setStrategy}>
              <SelectTrigger>
                <SelectValue placeholder="اختر استراتيجية التداول" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trend_following">تتبع الترند</SelectItem>
                <SelectItem value="mean_reversal">الارتداد للمتوسط</SelectItem>
                <SelectItem value="breakout">اختراق المستويات</SelectItem>
                <SelectItem value="scalping">سكالبينج</SelectItem>
                <SelectItem value="grid_trading">تداول الشبكة</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="trading-pairs">أزواج التداول</Label>
            <Input
              id="trading-pairs"
              value={tradingPairs}
              onChange={(e) => setTradingPairs(e.target.value)}
              placeholder="BTC/USDT, ETH/USDT"
            />
            <p className="text-sm text-gray-500">أدخل الأزواج مفصولة بفواصل</p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="risk-level">مستوى المخاطرة (1-10)</Label>
            <Input
              id="risk-level"
              type="number"
              min="1"
              max="10"
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="max-trades">أقصى عدد للصفقات المفتوحة</Label>
            <Input
              id="max-trades"
              type="number"
              min="1"
              max="20"
              value={maxOpenTrades}
              onChange={(e) => setMaxOpenTrades(e.target.value)}
            />
          </div>
          
          <TradingModeSelector 
            tradingMode={tradingMode} 
            onChange={setTradingMode}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري المعالجة...
              </>
            ) : 'حفظ'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BotFormDialog;
