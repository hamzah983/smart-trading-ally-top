import { useEffect, useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from './ui/use-toast';
import { getAccountBalance } from '@/services/binanceService';

const BinanceTrading = () => {
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [side, setSide] = useState('buy');
  const [type, setType] = useState('market');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const { toast } = useToast();

  const handleTrade = () => {
    toast({
      title: 'Trade initiated',
      description: `Attempting to ${side} ${quantity} ${symbol} at ${price || 'market price'}`,
    });
  };
  
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        // Replace getAccountInfo with getAccountBalance
        const balance = await getAccountBalance();
        console.log('Account balance:', balance);
      } catch (error) {
        console.error('Failed to fetch account balance:', error);
      }
    };

    fetchBalance();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Binance Trading</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select onValueChange={setSymbol}>
            <SelectTrigger>
              <SelectValue placeholder="Select Symbol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BTCUSDT">BTCUSDT</SelectItem>
              <SelectItem value="ETHUSDT">ETHUSDT</SelectItem>
              <SelectItem value="BNBUSDT">BNBUSDT</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={setSide}>
            <SelectTrigger>
              <SelectValue placeholder="Select Side" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="buy">Buy</SelectItem>
              <SelectItem value="sell">Sell</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Select onValueChange={setType}>
          <SelectTrigger>
            <SelectValue placeholder="Select Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="market">Market</SelectItem>
            <SelectItem value="limit">Limit</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        {type === 'limit' && (
          <Input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        )}

        <Button onClick={handleTrade}>Place Order</Button>
      </CardContent>
    </Card>
  );
};

export default BinanceTrading;
