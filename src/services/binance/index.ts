
// Export all functionality from the binance service modules
export * from './types';
export * from './accountService';
export * from './orderService';
export * from './tradingBotService';

// Initialize the trading client
import { updateSupabaseClientForTrading } from './accountService';

updateSupabaseClientForTrading().catch(error => {
  console.error('Failed to initialize trading client:', error);
});
