// Update imports to use the new services
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Calendar as CalendarIcon, Download, FileDown, FilterX, Search, Sliders } from "lucide-react";
import { format } from "date-fns";
import TradeTable from "./components/TradeTable";
import TradeChart from "./components/TradeChart";
import TradeStatistics from "./components/TradeStatistics";
import FilterControls from "./components/FilterControls";
import { cn } from "@/lib/utils";
import { syncAccount } from "@/services/accounts/tradingService";

interface Trade {
  id: string;
  symbol: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  profit: number;
  date: Date;
  type: "buy" | "sell";
}

const sampleTrades: Trade[] = [
  {
    id: "1",
    symbol: "BTCUSD",
    entryPrice: 27000,
    exitPrice: 28000,
    quantity: 0.1,
    profit: 100,
    date: new Date(),
    type: "buy",
  },
  {
    id: "2",
    symbol: "ETHUSD",
    entryPrice: 1800,
    exitPrice: 1700,
    quantity: 0.5,
    profit: -50,
    date: new Date(),
    type: "sell",
  },
];

const Index = () => {
  const [trades, setTrades] = useState<Trade[]>(sampleTrades);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");

  useEffect(() => {
    // Fetch trades from API or database here
    // For now, using sampleTrades
    setTrades(sampleTrades);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-hamzah-800 dark:text-hamzah-100">
            سجل التداولات
          </h1>
          <p className="text-hamzah-600 dark:text-hamzah-300">
            تحليل مفصل لجميع التداولات التي تمت على حسابك
          </p>
        </div>
        <div className="flex space-x-2 space-x-reverse">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 ml-2" />
            تصدير البيانات
          </Button>
          <Button size="sm">
            <FileDown className="h-4 w-4 ml-2" />
            تحميل تقرير
          </Button>
        </div>
      </div>

      <Tabs defaultValue="table" className="space-y-4">
        <TabsList>
          <TabsTrigger value="table">جدول التداولات</TabsTrigger>
          <TabsTrigger value="chart">الرسم البياني</TabsTrigger>
          <TabsTrigger value="statistics">الإحصائيات</TabsTrigger>
        </TabsList>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="اختر الحساب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="account1">حساب 1</SelectItem>
                <SelectItem value="account2">حساب 2</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"ghost"}
                  className={cn(
                    "pl-3.5 font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>اختر تاريخ</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0"
                align="start"
                side="bottom"
              >
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) =>
                    date > new Date() || date < new Date("2020-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button variant="ghost" size="sm">
              <FilterX className="h-4 w-4 ml-2" />
              إزالة الفلاتر
            </Button>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <Input
              placeholder="ابحث عن تداولات..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
            <Search className="h-5 w-5 text-hamzah-500 dark:text-hamzah-400 mr-2" />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Sliders className="h-4 w-4 ml-2" />
                  خيارات متقدمة
                </Button>
              </SheetTrigger>
              <SheetContent className="sm:max-w-lg">
                <SheetHeader>
                  <SheetTitle>خيارات متقدمة</SheetTitle>
                  <SheetDescription>
                    تخصيص الفلاتر والخيارات المتقدمة لعرض التداولات.
                  </SheetDescription>
                </SheetHeader>
                <Separator className="my-4" />
                <FilterControls />
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <TabsContent value="table" className="space-y-4">
          <TradeTable trades={trades} />
        </TabsContent>
        <TabsContent value="chart">
          <TradeChart trades={trades} />
        </TabsContent>
        <TabsContent value="statistics">
          <TradeStatistics trades={trades} />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default Index;
