
import { motion } from "framer-motion";
import { WalletCards, PlusCircle, AlertCircle } from "lucide-react";
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
      
      <div className="flex flex-col items-center mb-8">
        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg p-4 max-w-md mb-6">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 ml-2 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-amber-800 dark:text-amber-200">معلومات هامة</h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                التطبيق جاهز للتداول الفعلي بأي مبلغ بما في ذلك 3 دولار. سيقوم النظام تلقائيًا باختيار استراتيجيات التداول المناسبة للمبالغ الصغيرة لمضاعفة رأس المال بأمان.
              </p>
            </div>
          </div>
        </div>
      </div>
      
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
