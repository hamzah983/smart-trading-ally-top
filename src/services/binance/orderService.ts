
import { supabase } from "@/integrations/supabase/client";
import { PlaceOrderParams, ClosePositionParams, UpdateStopLossParams } from "./types";

/**
 * Places an order on Binance - Enhanced for real trading verification
 */
export const placeOrder = async (params: PlaceOrderParams): Promise<any> => {
  try {
    console.log('Placing real order with params:', JSON.stringify(params));
    
    const { data, error } = await supabase.functions.invoke('binance-api', {
      body: { 
        action: 'place_order',
        accountId: params.accountId,
        data: {
          symbol: params.symbol,
          side: params.side,
          type: params.type,
          quantity: params.quantity.toString(),
          price: params.price?.toString(),
          stopLoss: params.stopLoss,
          takeProfit: params.takeProfit,
          realTrading: true // Force real trading flag
        }
      }
    });

    if (error) throw new Error(error.message);
    
    console.log('Order placed successfully:', JSON.stringify(data));
    
    // Verify the order was actually placed by querying its status
    if (data.orderId) {
      const verificationResult = await verifyOrderExecution(params.accountId, data.orderId, params.symbol);
      if (!verificationResult.success) {
        console.error('Order verification failed:', verificationResult.message);
        return {
          ...data,
          verified: false,
          verificationMessage: verificationResult.message
        };
      }
      
      console.log('Order verified successfully:', verificationResult.message);
      return {
        ...data,
        verified: true,
        verificationMessage: verificationResult.message
      };
    }
    
    return data;
  } catch (error) {
    console.error('Error placing Binance order:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to place order' 
    };
  }
};

/**
 * Verifies that an order was actually executed on Binance
 */
export const verifyOrderExecution = async (
  accountId: string,
  orderId: string,
  symbol: string
): Promise<{ success: boolean; message: string; orderStatus?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('binance-api', {
      body: { 
        action: 'verify_order',
        accountId,
        data: {
          orderId,
          symbol
        }
      }
    });

    if (error) throw new Error(error.message);
    
    return {
      success: data.orderExists === true,
      message: data.orderExists ? 'Order verified on Binance' : 'Order not found on Binance',
      orderStatus: data.orderStatus
    };
  } catch (error) {
    console.error('Error verifying order execution:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to verify order execution' 
    };
  }
};

/**
 * Closes a position on Binance with enhanced verification
 */
export const closePosition = async (params: ClosePositionParams): Promise<any> => {
  try {
    console.log('Closing real position with params:', JSON.stringify(params));
    
    const { data, error } = await supabase.functions.invoke('binance-api', {
      body: { 
        action: 'close_position',
        accountId: params.accountId,
        data: {
          symbol: params.symbol,
          orderId: params.orderId,
          tradeId: params.tradeId,
          quantity: params.quantity.toString(),
          pnl: params.pnl,
          realTrading: true // Force real trading flag
        }
      }
    });

    if (error) throw new Error(error.message);
    
    // Verify the position was actually closed
    if (data.success && params.orderId) {
      const verificationResult = await verifyPositionClosure(
        params.accountId, 
        params.orderId,
        params.symbol
      );
      
      return {
        ...data,
        verified: verificationResult.success,
        verificationMessage: verificationResult.message
      };
    }
    
    return data;
  } catch (error) {
    console.error('Error closing Binance position:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to close position' 
    };
  }
};

/**
 * Verifies that a position was actually closed on Binance
 */
export const verifyPositionClosure = async (
  accountId: string,
  orderId: string,
  symbol: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('binance-api', {
      body: { 
        action: 'verify_position_closure',
        accountId,
        data: {
          orderId,
          symbol
        }
      }
    });

    if (error) throw new Error(error.message);
    
    return {
      success: data.positionClosed === true,
      message: data.positionClosed 
        ? 'Position closure verified on Binance' 
        : 'Position may not be fully closed on Binance'
    };
  } catch (error) {
    console.error('Error verifying position closure:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to verify position closure' 
    };
  }
};

/**
 * Updates the stop loss for a position on Binance
 */
export const updateStopLoss = async (params: UpdateStopLossParams): Promise<any> => {
  try {
    const { data, error } = await supabase.functions.invoke('binance-api', {
      body: { 
        action: 'update_stop_loss',
        accountId: params.accountId,
        data: {
          symbol: params.symbol,
          orderId: params.orderId,
          tradeId: params.tradeId,
          stopPrice: params.stopPrice.toString()
        }
      }
    });

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Error updating Binance stop loss:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to update stop loss' 
    };
  }
};

/**
 * Executes a trade through a trading bot or manually with enhanced real trading verification
 */
export const executeTrade = async (
  accountId: string,
  symbol: string,
  type: 'buy' | 'sell',
  lotSize: number,
  stopLoss?: number,
  takeProfit?: number,
  botId?: string
): Promise<any> => {
  try {
    console.log('Executing real trade:', { accountId, symbol, type, lotSize });
    
    const { data, error } = await supabase.functions.invoke('trading-api', {
      body: { 
        action: 'execute_trade',
        accountId,
        botId,
        symbol,
        type,
        lotSize,
        stopLoss,
        takeProfit,
        realTrading: true // Force real trading mode
      }
    });

    if (error) throw new Error(error.message);
    
    // Verify the trade was executed
    if (data.success && data.orderId) {
      const verification = await verifyOrderExecution(
        accountId,
        data.orderId,
        symbol
      );
      
      return {
        ...data,
        verified: verification.success,
        verificationMessage: verification.message,
        orderStatus: verification.orderStatus
      };
    }
    
    return data;
  } catch (error) {
    console.error('Error executing trade:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to execute trade'
    };
  }
};
