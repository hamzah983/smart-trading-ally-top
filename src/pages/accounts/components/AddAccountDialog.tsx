
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, PlusCircle } from "lucide-react";

interface AddAccountDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  newAccountName: string;
  setNewAccountName: (name: string) => void;
  newAccountPlatform: string;
  setNewAccountPlatform: (platform: string) => void;
  isCreating: boolean;
  handleCreateAccount: () => Promise<void>;
}

const AddAccountDialog = ({
  isOpen,
  setIsOpen,
  newAccountName,
  setNewAccountName,
  newAccountPlatform,
  setNewAccountPlatform,
  isCreating,
  handleCreateAccount
}: AddAccountDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="glass-morphism hover:scale-105 smooth-transition flex items-center">
          <PlusCircle className="mr-2 h-4 w-4" />
          إضافة حساب جديد
        </Button>
      </DialogTrigger>
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
