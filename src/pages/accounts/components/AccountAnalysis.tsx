
import { AlertTriangle } from "lucide-react";

interface AccountAnalysisProps {
  accountAnalysis: {
    accountId?: string; // Made optional to match the interface
    isRealTrading: boolean;
    warnings?: string[];
    recommendedSettings?: {
      maxRiskPerTrade: number;
    };
  };
}

const AccountAnalysis = ({ accountAnalysis }: AccountAnalysisProps) => {
  return (
    <div className="mt-4 p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg">
      <h3 className="font-bold text-red-800 dark:text-red-300 mb-2 flex items-center">
        <AlertTriangle className="h-5 w-5 mr-2" />
        معلومات هامة عن التداول الحقيقي
      </h3>
      <ul className="list-disc list-inside space-y-1 text-red-700 dark:text-red-400">
        {accountAnalysis.warnings?.map((warning: string, index: number) => (
          <li key={index}>{warning}</li>
        ))}
      </ul>
      {accountAnalysis.recommendedSettings && (
        <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-700">
          <p className="font-medium text-red-800 dark:text-red-300">الإعدادات الموصى بها:</p>
          <p className="text-red-700 dark:text-red-400">الحد الأقصى للمخاطرة: {accountAnalysis.recommendedSettings.maxRiskPerTrade}%</p>
        </div>
      )}
    </div>
  );
};

export default AccountAnalysis;
