
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, PlusCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">إضافة حساب تداول جديد</DialogTitle>
          <DialogDescription>
            قم بإدخال المعلومات الأساسية لإضافة حساب تداول جديد
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="account-name" className="text-right block">اسم الحساب</Label>
            <Input 
              id="account-name" 
              dir="rtl"
              placeholder="أدخل اسم الحساب" 
              value={newAccountName}
              onChange={(e) => setNewAccountName(e.target.value)}
              className="focus:ring-2 focus:ring-hamzah-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="platform" className="text-right block">منصة التداول</Label>
            <Select
              value={newAccountPlatform}
              onValueChange={setNewAccountPlatform}
            >
              <SelectTrigger id="platform" className="w-full">
                <SelectValue placeholder="اختر منصة التداول" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Binance">Binance</SelectItem>
                <SelectItem value="Bybit">Bybit</SelectItem>
                <SelectItem value="KuCoin">KuCoin</SelectItem>
                <SelectItem value="MT4">MetaTrader 4</SelectItem>
                <SelectItem value="MT5">MetaTrader 5</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            className="w-full bg-gradient-to-r from-hamzah-500 to-hamzah-600 hover:from-hamzah-600 hover:to-hamzah-700 text-white"
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
