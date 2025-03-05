
import { useAccounts } from './useAccounts';
import { useAccountCreation } from './useAccountCreation';
import { useApiCredentials } from './useApiCredentials';
import { useAccountSync } from './useAccountSync';
import { useTradingMode } from './useTradingMode';

export const useAccountsManager = () => {
  const { 
    accounts, 
    loading, 
    selectedAccount, 
    setSelectedAccount,
    fetchAccounts,
    handleToggleAccountStatus
  } = useAccounts();
  
  const {
    isAddDialogOpen,
    setIsAddDialogOpen,
    newAccountName,
    setNewAccountName,
    newAccountPlatform,
    setNewAccountPlatform,
    isCreating,
    handleCreateAccount
  } = useAccountCreation(fetchAccounts);
  
  const {
    apiKey,
    setApiKey,
    apiSecret,
    setApiSecret,
    isSaving,
    handleSaveCredentials
  } = useApiCredentials(fetchAccounts);
  
  const {
    isSyncing,
    accountAnalysis,
    isAnalyzing,
    handleSyncAccount
  } = useAccountSync(fetchAccounts);
  
  const {
    isChangingMode,
    handleChangeTradingMode
  } = useTradingMode(fetchAccounts);

  return {
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
    isAnalyzing,
    isChangingMode,
    fetchAccounts,
    handleCreateAccount,
    handleSaveCredentials,
    handleSyncAccount,
    handleToggleAccountStatus,
    handleChangeTradingMode
  };
};
