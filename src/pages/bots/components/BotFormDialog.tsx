
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import TradingModeSelector from "./TradingModeSelector";
import { TradingBot } from "@/services/binance/types";
import { Badge } from "@/components/ui/badge";

interface BotFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bot: Partial<TradingBot>) => Promise<void>;
  editingBot: TradingBot | null;
  accounts: any[];
  isSaving: boolean;
}

const BotFormDialog = ({
  isOpen,
  onClose,
  onSave,
  editingBot,
  accounts,
  isSaving
}: BotFormDialogProps) => {
  const [botName, setBotName] = useState("");
  const [botDescription, setBotDescription] = useState("");
  const [accountId, setAccountId] = useState("");
  const [strategy, setStrategy] = useState("trend_following");
  const [tradingPairs, setTradingPairs] = useState<string[]>(["BTCUSDT"]);
  const [riskLevel, setRiskLevel] = useState<number>(3);
  const [maxOpenTrades, setMaxOpenTrades] = useState(5);
  const [tradingMode, setTradingMode] = useState<'real' | 'demo'>('demo');

  // Reset form or set values when editing
  useEffect(() => {
    if (editingBot) {
      setBotName(editingBot.name);
      setBotDescription(editingBot.description || "");
      setAccountId(editingBot.account_id);
      setStrategy(editingBot.strategy);
      setTradingPairs(editingBot.trading_pairs);
      setRiskLevel(editingBot.risk_level);
      setMaxOpenTrades(editingBot.max_open_trades);
      setTradingMode(editingBot.trading_mode);
    } else {
      setBotName("");
      setBotDescription("");
      setAccountId(accounts.length > 0 ? accounts[0].id : "");
      setStrategy("trend_following");
      setTradingPairs(["BTCUSDT"]);
      setRiskLevel(3);
      setMaxOpenTrades(5);
      setTradingMode('demo');
    }
  }, [editingBot, accounts, isOpen]);

  const handleSave = async () => {
    const botData: Partial<TradingBot> = {
      name: botName,
      description: botDescription,
      account_id: accountId,
      strategy,
      trading_pairs: tradingPairs,
      risk_level: riskLevel,
      max_open_trades: maxOpenTrades,
      trading_mode: tradingMode,
      is_active: true,
      status: 'paused', // Start paused until manually activated
    };

    if (editingBot) {
      botData.id = editingBot.id;
    }

    await onSave(botData);
  };

  const strategies = [
    { id: "trend_following", name: "متابعة الاتجاه" },
    { id: "mean_reversion", name: "العودة للمتوسط" },
    { id: "breakout", name: "اختراق النطاق" },
    { id: "grid_trading", name: "تداول الشبكة" },
    { id: "smart_scalping", name: "سكالبينج ذكي" }
  ];

  const popularPairs = [
    { symbol: "BTCUSDT", name: "Bitcoin" },
    { symbol: "ETHUSDT", name: "Ethereum" },
    { symbol: "BNBUSDT", name: "Binance Coin" },
    { symbol: "ADAUSDT", name: "Cardano" },
    { symbol: "DOGEUSDT", name: "Dogecoin" },
    { symbol: "XRPUSDT", name: "Ripple" },
    { symbol: "SOLUSDT", name: "Solana" },
    { symbol: "AVAXUSDT", name: "Avalanche" }
  ];

  const getAccountById = (id: string) => {
    return accounts.find(account => account.id === id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {editingBot ? "تعديل روبوت التداول" : "إضافة روبوت تداول جديد"}
          </DialogTitle>
          <DialogDescription>
            أدخل تفاصيل روبوت التداول الخاص بك لبدء التداول الآلي
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="bot-name" className="text-right block">اسم الروبوت</Label>
            <Input 
              id="bot-name"
              dir="rtl"
              placeholder="أدخل اسم الروبوت" 
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bot-description" className="text-right block">وصف الروبوت (اختياري)</Label>
            <Input 
              id="bot-description"
              dir="rtl"
              placeholder="وصف مختصر لهذا الروبوت" 
              value={botDescription}
              onChange={(e) => setBotDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="account" className="text-right block">حساب التداول</Label>
            <Select
              value={accountId}
              onValueChange={setAccountId}
            >
              <SelectTrigger id="account">
                <SelectValue placeholder="اختر حساب التداول" />
              </SelectTrigger>
              <SelectContent>
                {accounts.length > 0 ? (
                  accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.account_name} ({account.platform})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    لا توجد حسابات متاحة
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {accountId && getAccountById(accountId)?.is_api_verified === false && (
              <p className="text-red-500 text-sm mt-1">
                تنبيه: هذا الحساب غير متصل بمفاتيح API صالحة.
              </p>
            )}
          </div>

          <TradingModeSelector 
            value={tradingMode} 
            onChange={setTradingMode} 
            disabled={isSaving}
          />

          <div className="space-y-2">
            <Label htmlFor="strategy" className="text-right block">استراتيجية التداول</Label>
            <Select
              value={strategy}
              onValueChange={setStrategy}
            >
              <SelectTrigger id="strategy">
                <SelectValue placeholder="اختر استراتيجية التداول" />
              </SelectTrigger>
              <SelectContent>
                {strategies.map((strat) => (
                  <SelectItem key={strat.id} value={strat.id}>
                    {strat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trading-pairs" className="text-right block">أزواج التداول</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              {popularPairs.map((pair) => (
                <div 
                  key={pair.symbol}
                  className={`border rounded-md p-2 cursor-pointer text-center transition-colors ${
                    tradingPairs.includes(pair.symbol) 
                      ? 'bg-hamzah-100 border-hamzah-300 text-hamzah-900' 
                      : 'bg-white hover:bg-gray-50 border-gray-200'
                  }`}
                  onClick={() => {
                    if (tradingPairs.includes(pair.symbol)) {
                      setTradingPairs(tradingPairs.filter(p => p !== pair.symbol));
                    } else {
                      setTradingPairs([...tradingPairs, pair.symbol]);
                    }
                  }}
                >
                  <div className="text-xs mb-1">{pair.name}</div>
                  <Badge variant={tradingPairs.includes(pair.symbol) ? "default" : "outline"}>
                    {pair.symbol}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="risk-level" className="text-right block">مستوى المخاطرة</Label>
              <Badge variant={
                riskLevel <= 2 ? "outline" : 
                riskLevel <= 5 ? "secondary" : 
                "destructive"
              }>
                {riskLevel <= 2 ? "منخفض" : 
                 riskLevel <= 5 ? "متوسط" : 
                 "عالي"}
              </Badge>
            </div>
            <Slider
              id="risk-level"
              min={1}
              max={10}
              step={1}
              value={[riskLevel]}
              onValueChange={(values) => setRiskLevel(values[0])}
              className="py-4"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-trades" className="text-right block">
              الحد الأقصى للصفقات المفتوحة: {maxOpenTrades}
            </Label>
            <Slider
              id="max-trades"
              min={1}
              max={20}
              step={1}
              value={[maxOpenTrades]}
              onValueChange={(values) => setMaxOpenTrades(values[0])}
              className="py-4"
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !botName || !accountId || tradingPairs.length === 0}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : editingBot ? "تحديث الروبوت" : "إنشاء الروبوت"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BotFormDialog;
