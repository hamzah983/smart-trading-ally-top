
import React from 'react';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TradingModeSelectorProps {
  tradingMode: 'real' | 'demo';
  onChange: (mode: 'real' | 'demo') => void;
  isDisabled?: boolean;
}

const TradingModeSelector: React.FC<TradingModeSelectorProps> = ({
  tradingMode,
  onChange,
  isDisabled = false
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold">وضع التداول</Label>
        <RadioGroup
          value={tradingMode}
          onValueChange={(value) => onChange(value as 'real' | 'demo')}
          className="mt-2 flex flex-col space-y-1"
          disabled={isDisabled}
        >
          <div className="flex items-center space-x-2 space-x-reverse">
            <RadioGroupItem value="demo" id="demo-trading" />
            <Label htmlFor="demo-trading" className="cursor-pointer">
              تداول تجريبي (محاكاة)
            </Label>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <RadioGroupItem value="real" id="real-trading" />
            <Label htmlFor="real-trading" className="cursor-pointer">
              تداول حقيقي
            </Label>
          </div>
        </RadioGroup>
      </div>
      
      {tradingMode === 'real' && (
        <Alert className="bg-red-50 border-red-300 text-red-900 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            تحذير: التداول الحقيقي سيستخدم أموالك الفعلية! تأكد من فهم المخاطر قبل المتابعة.
          </AlertDescription>
        </Alert>
      )}
      
      {tradingMode === 'demo' && (
        <Alert className="bg-blue-50 border-blue-300 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
          <AlertDescription>
            وضع المحاكاة آمن تمامًا ولا يستخدم أموالًا حقيقية. مثالي للتدريب واختبار الاستراتيجيات.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default TradingModeSelector;
