
import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Loader2, RefreshCw, Wrench, AlertTriangle, 
  CheckCircle, AlertOctagon, DollarSign
} from "lucide-react";
import { TradingAccount } from "@/services/binance/types";
import AccountSettings from "./AccountSettings";
import AccountAnalysis from "./AccountAnalysis";

interface AccountCardProps {
  account: TradingAccount;
  isSyncing: boolean;
  selectedAccount: TradingAccount | null;
  accountAnalysis: any;
  handleSyncAccount: (accountId: string) => Promise<void>;
  handleToggleAccountStatus: (accountId: string, currentStatus: boolean) => Promise<void>;
  setSelectedAccount: (account: TradingAccount | null) => void;
  setApiKey: (apiKey: string) => void;
  setApiSecret: (apiSecret: string) => void;
  apiKey: string;
  apiSecret: string;
  handleSaveCredentials: (accountId: string) => Promise<void>;
  isSaving: boolean;
  fetchAccounts: () => Promise<void>;
}

const AccountCard = ({
  account,
  isSyncing,
  selectedAccount,
  accountAnalysis,
  handleSyncAccount,
  handleToggleAccountStatus,
  setSelectedAccount,
  setApiKey,
  setApiSecret,
  apiKey,
  apiSecret,
  handleSaveCredentials,
  isSaving,
  fetchAccounts
}: AccountCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="glass-morphism p-6">
        {account.is_api_verified && account.is_active && (
          <Alert 
            className={account.connection_status ? 
              "bg-red-50 border-red-300 text-red-900 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300 mb-4" :
              "bg-yellow-50 border-yellow-300 text-yellow-900 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300 mb-4"
            }
          >
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="font-bold">
              {account.connection_status ? 
                "تنبيه: تداول حقيقي يؤثر على أموالك الفعلية!" : 
                "تنبيه: الاتصال غير متاح حاليًا"
              }
            </AlertTitle>
            <AlertDescription>
              {account.connection_status ? 
                "هذا الحساب متصل ونشط للتداول الحقيقي. أي صفقات يقوم بها الروبوت ستستخدم أموالك الحقيقية." :
                "لا يمكن بدء التداول الحقيقي حاليًا لأن الاتصال غير متاح. تحقق من مفاتيح API."
              }
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-hamzah-800 dark:text-hamzah-100">
              {account.account_name}
            </h2>
            <div className="flex items-center text-hamzah-600 dark:text-hamzah-300 mt-1">
              <span>{account.platform}</span>
              <Badge 
                variant={account.is_active ? "outline" : "secondary"}
                className="mr-2"
              >
                {account.is_active ? "نشط" : "معطل"}
              </Badge>
              {account.connection_status ? (
                <Badge 
                  variant="outline"
                  className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mx-2"
                >
                  متصل
                </Badge>
              ) : (
                <Badge 
                  variant="outline"
                  className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 mx-2"
                >
                  غير متصل
                </Badge>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleSyncAccount(account.id)}
              disabled={isSyncing || !account.is_api_verified}
            >
              {isSyncing && selectedAccount?.id === account.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <div className="flex items-center space-x-2">
              <Switch
                checked={account.is_active}
                onCheckedChange={() => handleToggleAccountStatus(account.id, account.is_active)}
              />
            </div>
            <Button 
              variant="outline"
              onClick={() => {
                setSelectedAccount(account);
                setApiKey(account.api_key || "");
                setApiSecret(account.api_secret || "");
              }}
            >
              <Wrench className="h-4 w-4 ml-2" />
              إعدادات
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 border border-hamzah-200 dark:border-hamzah-700 rounded-lg">
            <h3 className="text-sm font-medium text-hamzah-600 dark:text-hamzah-400">
              الرصيد
            </h3>
            <p className="text-2xl font-bold text-hamzah-800 dark:text-hamzah-100">
              ${account.balance ? account.balance.toLocaleString() : '0.00'}
            </p>
          </div>
          <div className="p-4 border border-hamzah-200 dark:border-hamzah-700 rounded-lg">
            <h3 className="text-sm font-medium text-hamzah-600 dark:text-hamzah-400">
              قيمة الحساب
            </h3>
            <p className="text-2xl font-bold text-hamzah-800 dark:text-hamzah-100">
              ${account.equity ? account.equity.toLocaleString() : '0.00'}
            </p>
          </div>
          <div className="p-4 border border-hamzah-200 dark:border-hamzah-700 rounded-lg">
            <h3 className="text-sm font-medium text-hamzah-600 dark:text-hamzah-400">
              الرافعة المالية
            </h3>
            <p className="text-2xl font-bold text-hamzah-800 dark:text-hamzah-100">
              {account.leverage}x
            </p>
          </div>
        </div>
        
        {account.is_api_verified ? (
          <div className="mt-4 p-4 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
              <p className="text-green-700 dark:text-green-300">
                تم التحقق من مفاتيح API بنجاح
              </p>
            </div>
            <p className="text-sm text-green-600 dark:text-green-400 mr-7 mt-1">
              آخر مزامنة: {account.last_sync_time ? new Date(account.last_sync_time).toLocaleString('ar-SA') : 'لم تتم المزامنة بعد'}
            </p>
            
            {account.is_active && account.connection_status && (
              <div className="flex items-center mt-2">
                <DollarSign className="h-5 w-5 text-red-500 ml-2" />
                <p className="text-red-700 dark:text-red-300 font-medium">
                  التداول الحقيقي مفعل على هذا الحساب!
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 p-4 border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-center">
              <AlertOctagon className="h-5 w-5 text-yellow-500 ml-2" />
              <p className="text-yellow-700 dark:text-yellow-300">
                لم يتم ربط مفاتيح API بعد
              </p>
            </div>
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mr-7 mt-1">
              قم بإعداد مفاتيح API للبدء في التداول الآلي
            </p>
          </div>
        )}
        
        {accountAnalysis && accountAnalysis.accountId === account.id && accountAnalysis.isRealTrading && (
          <AccountAnalysis accountAnalysis={accountAnalysis} />
        )}
        
        {selectedAccount?.id === account.id && (
          <AccountSettings 
            account={account}
            apiKey={apiKey}
            apiSecret={apiSecret}
            setApiKey={setApiKey}
            setApiSecret={setApiSecret}
            handleSaveCredentials={handleSaveCredentials}
            isSaving={isSaving}
            setSelectedAccount={setSelectedAccount}
            fetchAccounts={fetchAccounts}
          />
        )}
      </Card>
    </motion.div>
  );
};

export default AccountCard;
