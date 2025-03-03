
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, DollarSign, FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

interface TradingModeSelectorProps {
  value: 'real' | 'demo';
  onChange: (value: 'real' | 'demo') => void;
  disabled?: boolean;
  className?: string;
}

const TradingModeSelector = ({
  value,
  onChange,
  disabled = false,
  className
}: TradingModeSelectorProps) => {
  return (
    <div className={cn("space-y-3", className)}>
      <Label className="text-base font-medium">وضع التداول</Label>
      
      <RadioGroup
        defaultValue={value}
        value={value}
        onValueChange={(val) => onChange(val as 'real' | 'demo')}
        className="grid grid-cols-2 gap-4"
        disabled={disabled}
      >
        <div className={cn(
          "flex flex-col items-center justify-between rounded-md border-2 border-muted p-4",
          value === 'demo' ? "border-hamzah-200 bg-hamzah-50" : "hover:border-hamzah-200",
          disabled && "opacity-50 cursor-not-allowed"
        )}>
          <RadioGroupItem value="demo" id="demo" className="sr-only" />
          <Label htmlFor="demo" className="flex flex-col items-center justify-between cursor-pointer space-y-2">
            <FlaskConical className="mb-3 h-6 w-6 text-hamzah-700" />
            <span className="text-base font-medium">تداول تجريبي</span>
            <Badge variant="outline" className="bg-hamzah-100 text-hamzah-800 hover:bg-hamzah-100">
              آمن للمبتدئين
            </Badge>
            <span className="text-xs text-muted-foreground text-center">
              تداول بأموال افتراضية للتجربة دون مخاطر
            </span>
          </Label>
        </div>

        <div className={cn(
          "flex flex-col items-center justify-between rounded-md border-2 border-muted p-4",
          value === 'real' ? "border-red-200 bg-red-50" : "hover:border-red-200",
          disabled && "opacity-50 cursor-not-allowed"
        )}>
          <RadioGroupItem value="real" id="real" className="sr-only" />
          <Label htmlFor="real" className="flex flex-col items-center justify-between cursor-pointer space-y-2">
            <DollarSign className="mb-3 h-6 w-6 text-red-600" />
            <span className="text-base font-medium">تداول حقيقي</span>
            <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
              يؤثر على أموالك!
            </Badge>
            <span className="flex items-center justify-center text-xs text-red-600 text-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              <span>ستتم المتاجرة بأموالك الحقيقية</span>
            </span>
          </Label>
        </div>
      </RadioGroup>
      
      {value === 'real' && (
        <div className="rounded-md bg-red-50 p-3 border border-red-200">
          <div className="flex gap-2 text-red-800">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
            <div className="text-sm">
              <p className="font-medium leading-tight">تنبيه: التداول الحقيقي يؤثر على أموالك</p>
              <p className="mt-1">سيتم استخدام أموالك الحقيقية في الحساب للمتاجرة. تأكد من ضبط إعدادات المخاطرة بشكل مناسب.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradingModeSelector;
