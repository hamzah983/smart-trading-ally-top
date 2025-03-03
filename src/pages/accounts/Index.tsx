
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useAccountsManager } from "./hooks/useAccountsManager";
import AccountCard from "./components/AccountCard";
import AddAccountDialog from "./components/AddAccountDialog";
import EmptyAccountsView from "./components/EmptyAccountsView";

const AccountsPage = () => {
  const {
    accounts,
    loading,
    selectedAccount,
    setSelectedAccount,
    apiKey,
    setApiKey,
    apiSecret,
    setApiSecret,
    isSaving,
    isSyncing,
    isAddDialogOpen,
    setIsAddDialogOpen,
    newAccountName,
    setNewAccountName,
    newAccountPlatform,
    setNewAccountPlatform,
    isCreating,
    accountAnalysis,
    isChangingMode,
    fetchAccounts,
    handleCreateAccount,
    handleSaveCredentials,
    handleSyncAccount,
    handleToggleAccountStatus,
    handleChangeTradingMode
  } = useAccountsManager();

  return (
    <div className="min-h-screen bg-gradient-to-b from-hamzah-50 to-hamzah-100 dark:from-hamzah-900 dark:to-hamzah-800">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-hamzah-800 dark:text-hamzah-100">
              حسابات التداول
            </h1>
            <p className="text-hamzah-600 dark:text-hamzah-300">
              إدارة حسابات التداول المرتبطة بمنصات التداول المختلفة
            </p>
          </div>
          
          <AddAccountDialog 
            isOpen={isAddDialogOpen}
            setIsOpen={setIsAddDialogOpen}
            newAccountName={newAccountName}
            setNewAccountName={setNewAccountName}
            newAccountPlatform={newAccountPlatform}
            setNewAccountPlatform={setNewAccountPlatform}
            isCreating={isCreating}
            handleCreateAccount={handleCreateAccount}
          />
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-hamzah-600 dark:text-hamzah-300" />
          </div>
        ) : accounts.length === 0 ? (
          <EmptyAccountsView onAddAccount={() => setIsAddDialogOpen(true)} />
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {accounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                isSyncing={isSyncing}
                selectedAccount={selectedAccount}
                accountAnalysis={accountAnalysis}
                handleSyncAccount={handleSyncAccount}
                handleToggleAccountStatus={handleToggleAccountStatus}
                setSelectedAccount={setSelectedAccount}
                setApiKey={setApiKey}
                setApiSecret={setApiSecret}
                apiKey={apiKey}
                apiSecret={apiSecret}
                handleSaveCredentials={handleSaveCredentials}
                isSaving={isSaving}
                fetchAccounts={fetchAccounts}
                handleChangeTradingMode={handleChangeTradingMode}
                isChangingMode={isChangingMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountsPage;
