
// Re-export types from binance/types.ts
export type { 
  PlaceOrderParams, 
  ClosePositionParams, 
  UpdateStopLossParams,
  SmartStrategyOptions,
  AutoManagementSettings 
} from './binance/types';

// Re-export other functionality as needed
export * from './binance';
