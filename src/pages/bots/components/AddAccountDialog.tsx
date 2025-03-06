
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddAccountDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const AddAccountDialog = ({ isOpen, onOpenChange, onSuccess }: AddAccountDialogProps) => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountPlatform, setNewAccountPlatform] = useState("Binance");

  const handleCreateAccount = async () => {
    try {
      if (!newAccountName) {
        toast({
          variant: "destructive",
          title: "البيانات غير مكتملة",
          description: "الرجاء إدخال اسم الحساب"
        });
        return;
      }
      
      setIsCreating(true);
      
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        toast({
          variant: "destructive",
          title: "جلسة غير صالحة",
          description: "الرجاء تسجيل الدخول لإنشاء حساب جديد"
        });
        return;
      }
      
      const { data, error } = await supabase
        .from('trading_accounts')
        .insert({
          user_id: sessionData.session.user.id,
          account_name: newAccountName,
          platform: newAccountPlatform,
          is_active: true,
          balance: 0,
          equity: 0,
          leverage: 100,
          risk_level: 'medium',
          max_drawdown: 10.0,
          daily_profit_target: 2.0
        })
        .select();
        
      if (error) throw error;
      
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: `تم إنشاء حساب "${newAccountName}" بنجاح`
      });
      
      setNewAccountName("");
      setNewAccountPlatform("Binance");
      onOpenChange(false);
      
      onSuccess();
    } catch (error: any) {
      console.error("Error creating account:", error);
      toast({
        variant: "destructive",
        title: "خطأ في إنشاء الحساب",
        description: error.message
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إضافة حساب تداول جديد</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account-name">اسم الحساب</Label>
            <Input 
              id="account-name" 
              placeholder="أدخل اسم الحساب" 
              value={newAccountName}
              onChange={(e) => setNewAccountName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="platform">منصة التداول</Label>
            <select 
              id="platform"
              className="flex h-10 w-full rounded-md border border-hamzah-200 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-hamzah-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={newAccountPlatform}
              onChange={(e) => setNewAccountPlatform(e.target.value)}
            >
              <option value="Binance">Binance</option>
              <option value="Bybit">Bybit</option>
              <option value="KuCoin">KuCoin</option>
              <option value="MT4">MetaTrader 4</option>
              <option value="MT5">MetaTrader 5</option>
            </select>
          </div>
          <Button 
            className="w-full"
            onClick={handleCreateAccount}
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري الإنشاء...
              </>
            ) : "إنشاء الحساب"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddAccountDialog;
