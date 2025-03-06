
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ChartData {
  id: string;
  symbol: string;
  date: string;
  profit: number;
  isProfit: boolean;
}

interface TradeChartProps {
  data: ChartData[];
  loading: boolean;
}

const TradeChart = ({ data, loading }: TradeChartProps) => {
  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hamzah-600"></div>
    </div>;
  }
  
  if (!data.length) {
    return <div className="text-center py-12 text-gray-500">
      لا توجد بيانات كافية للعرض
    </div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="h-80">
        <h3 className="text-lg font-medium mb-2">تحليل الأرباح والخسائر</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 10, 
              left: 10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="profit" stroke="#8884d8" name="الربح/الخسارة" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="h-80">
        <h3 className="text-lg font-medium mb-2">تصنيف الصفقات</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 10,
              left: 10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="profit" name="الربح/الخسارة">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.isProfit ? '#4ade80' : '#f87171'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TradeChart;
