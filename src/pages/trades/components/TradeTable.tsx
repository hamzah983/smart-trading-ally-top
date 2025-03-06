
import { Loader2, ArrowUp, ArrowDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Trade {
  id: string;
  account_id: string;
  symbol: string;
  type: string;
  entry_price: number;
  lot_size: number;
  stop_loss: number | null;
  take_profit: number | null;
  status: string;
  pnl: number | null;
  created_at: string;
  closed_at: string | null;
}

interface TradeTableProps {
  trades: Trade[];
  loading: boolean;
  showCloseButton?: boolean;
  onCloseTrade?: (id: string) => void;
}

const TradeTable = ({ trades, loading, showCloseButton = true, onCloseTrade }: TradeTableProps) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }
  
  if (trades.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        لا توجد صفقات للعرض
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>الرمز</TableHead>
            <TableHead>النوع</TableHead>
            <TableHead>سعر الدخول</TableHead>
            <TableHead>حجم العقد</TableHead>
            <TableHead>وقف الخسارة</TableHead>
            <TableHead>جني الربح</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>الربح/الخسارة</TableHead>
            <TableHead>التاريخ</TableHead>
            {showCloseButton && <TableHead></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((trade) => (
            <TableRow key={trade.id} className="hover:bg-hamzah-100/50 dark:hover:bg-hamzah-800/50 transition-colors">
              <TableCell className="font-medium">{trade.symbol}</TableCell>
              <TableCell>
                {trade.type === 'buy' ? (
                  <span className="flex items-center text-green-600">
                    <ArrowUp className="w-4 h-4 mr-1" /> شراء
                  </span>
                ) : (
                  <span className="flex items-center text-red-600">
                    <ArrowDown className="w-4 h-4 mr-1" /> بيع
                  </span>
                )}
              </TableCell>
              <TableCell>{trade.entry_price}</TableCell>
              <TableCell>{trade.lot_size}</TableCell>
              <TableCell>{trade.stop_loss || '—'}</TableCell>
              <TableCell>{trade.take_profit || '—'}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  trade.status === 'open' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                }`}>
                  {trade.status === 'open' ? 'مفتوحة' : 'مغلقة'}
                </span>
              </TableCell>
              <TableCell>
                {trade.pnl !== null ? (
                  <span className={trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {trade.pnl >= 0 ? '+' : ''}{trade.pnl}$
                  </span>
                ) : '—'}
              </TableCell>
              <TableCell>
                {new Date(trade.created_at).toLocaleDateString('ar-SA')}
              </TableCell>
              {showCloseButton && trade.status === 'open' && (
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onCloseTrade && onCloseTrade(trade.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <X className="w-4 h-4 mr-1" />
                    إغلاق
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TradeTable;
