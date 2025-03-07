
import { useAccounts } from './useAccounts';
import { useAccountCreation } from './useAccountCreation';
import { useApiCredentials } from './useApiCredentials';
import { useAccountSync } from './useAccountSync';
import { useTradingMode } from './useTradingMode';
import { useMT5Connection } from './useMT5Connection';

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
    isTestingConnection,
    isResetting,
    handleTestConnection,
    handleSaveCredentials,
    handleResetConnection
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

  const {
    mt5Login,
    setMt5Login,
    mt5Password,
    setMt5Password,
    mt5Server,
    setMt5Server,
    isConnecting,
    isFetchingAssets,
    availableAssets,
    handleConnectMT5,
    fetchMT5Assets
  } = useMT5Connection(fetchAccounts);

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
    isTestingConnection,
    isResetting,
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
    handleTestConnection,
    handleResetConnection,
    handleSyncAccount,
    handleToggleAccountStatus,
    handleChangeTradingMode,
    // MT5 specific properties
    mt5Login,
    setMt5Login,
    mt5Password,
    setMt5Password,
    mt5Server,
    setMt5Server,
    isConnecting,
    isFetchingAssets,
    availableAssets,
    handleConnectMT5,
    fetchMT5Assets
  };
};
