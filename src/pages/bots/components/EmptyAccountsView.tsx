
import { motion } from "framer-motion";
import { WalletCards, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyAccountsViewProps {
  onAddAccount: () => void;
}

const EmptyAccountsView = ({ onAddAccount }: EmptyAccountsViewProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-16"
    >
      <WalletCards className="h-16 w-16 text-hamzah-400 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-hamzah-800 dark:text-hamzah-100 mb-2">
        لا توجد حسابات تداول
      </h2>
      <p className="text-hamzah-600 dark:text-hamzah-300 mb-6">
        قم بإضافة حساب تداول جديد للبدء في التداول الآلي
      </p>
      <Button 
        className="glass-morphism hover:scale-105 smooth-transition"
        onClick={onAddAccount}
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        إضافة حساب الآن
      </Button>
    </motion.div>
  );
};

export default EmptyAccountsView;
