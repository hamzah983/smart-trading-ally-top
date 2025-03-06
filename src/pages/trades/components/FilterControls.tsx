
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilterControlsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  dateFilter: string;
  setDateFilter: (filter: string) => void;
  symbolFilter: string;
  setSymbolFilter: (filter: string) => void;
  symbols: string[];
}

const FilterControls = ({ 
  searchQuery, 
  setSearchQuery, 
  dateFilter, 
  setDateFilter, 
  symbolFilter, 
  setSymbolFilter, 
  symbols 
}: FilterControlsProps) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <div className="relative flex-grow md:flex-grow-0 md:w-64">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="بحث عن صفقة..."
          className="pr-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <Select value={symbolFilter} onValueChange={setSymbolFilter}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="جميع الرموز" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">جميع الرموز</SelectItem>
          {symbols.filter(s => s !== 'all').map((symbol) => (
            <SelectItem key={symbol} value={symbol}>{symbol}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select value={dateFilter} onValueChange={setDateFilter}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="فترة التداول" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">كل الفترات</SelectItem>
          <SelectItem value="today">اليوم</SelectItem>
          <SelectItem value="yesterday">الأمس</SelectItem>
          <SelectItem value="week">آخر أسبوع</SelectItem>
          <SelectItem value="month">آخر شهر</SelectItem>
        </SelectContent>
      </Select>
      
      <Button variant="outline" size="icon" className="ml-auto">
        <Filter className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default FilterControls;
