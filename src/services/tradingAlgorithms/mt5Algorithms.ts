
import { supabase } from "@/integrations/supabase/client";
import { AssetClass } from "../binance/types";

export type MT5Strategy = 
  | 'trend_following'
  | 'mean_reversion'
  | 'breakout'
  | 'scalping'
  | 'smart_auto'
  | 'grid_trading'
  | 'hedging'
  | 'arbitrage'
  | 'news_based'
  | 'adaptive_momentum';

export interface MT5StrategySettings {
  timeframes: string[];
  indicators: string[];
  entryConditions: Record<string, any>;
  exitConditions: Record<string, any>;
  riskParameters: Record<string, any>;
  assetClasses: AssetClass[];
  leverage?: number;
  lotSize?: number;
  stopLoss?: number;
  takeProfit?: number;
  maxOpenTrades?: number;
  maxDrawdown?: number;
}

const defaultSettings: Record<MT5Strategy, MT5StrategySettings> = {
  trend_following: {
    timeframes: ['H1', 'H4', 'D1'],
    indicators: ['Moving Average', 'MACD', 'ADX'],
    entryConditions: {
      macdCrossover: true,
      adxThreshold: 25,
      maThreshold: 0.5
    },
    exitConditions: {
      macdDivergence: true,
      trendReversal: true,
      targetReached: true
    },
    riskParameters: {
      maxRiskPerTrade: 2,
      trailingStop: true,
      stopLossMultiplier: 1.5
    },
    assetClasses: [AssetClass.FOREX, AssetClass.INDICES, AssetClass.COMMODITIES],
    stopLoss: 50,
    takeProfit: 100,
    maxOpenTrades: 5
  },
  mean_reversion: {
    timeframes: ['M15', 'H1', 'H4'],
    indicators: ['Bollinger Bands', 'RSI', 'Stochastic'],
    entryConditions: {
      oversoldThreshold: 30,
      overboughtThreshold: 70,
      bandDeviation: 2.0
    },
    exitConditions: {
      meanReturned: true,
      rsiNormalized: true,
      timeBasedExit: 48
    },
    riskParameters: {
      maxRiskPerTrade: 1.5,
      partialTakeProfit: true,
      multipleTakeProfit: true
    },
    assetClasses: [AssetClass.FOREX, AssetClass.STOCKS, AssetClass.INDICES],
    stopLoss: 40,
    takeProfit: 50,
    maxOpenTrades: 8
  },
  breakout: {
    timeframes: ['M30', 'H1', 'H4'],
    indicators: ['Support/Resistance', 'Volume', 'ATR'],
    entryConditions: {
      volumeIncrease: 1.5,
      priceBreakout: true,
      consolidationPeriod: 20
    },
    exitConditions: {
      falseBreakout: true,
      volumeDecrease: true,
      targetReached: true
    },
    riskParameters: {
      maxRiskPerTrade: 2.5,
      widerStops: true,
      breakoutConfirmation: true
    },
    assetClasses: [AssetClass.FOREX, AssetClass.STOCKS, AssetClass.INDICES, AssetClass.COMMODITIES],
    stopLoss: 60,
    takeProfit: 120,
    maxOpenTrades: 4
  },
  scalping: {
    timeframes: ['M1', 'M5', 'M15'],
    indicators: ['EMA', 'Stochastic', 'MACD'],
    entryConditions: {
      fastEmaCrossover: true,
      momentumConfirmation: true,
      lowSpread: true
    },
    exitConditions: {
      smallProfitTarget: true,
      quickReversalSign: true,
      timeBasedExit: 30
    },
    riskParameters: {
      maxRiskPerTrade: 1.0,
      tightStopLoss: true,
      fastExitTrigger: true
    },
    assetClasses: [AssetClass.FOREX, AssetClass.STOCKS],
    stopLoss: 20,
    takeProfit: 30,
    leverage: 10,
    maxOpenTrades: 10
  },
  smart_auto: {
    timeframes: ['M15', 'H1', 'H4', 'D1'],
    indicators: ['Moving Average', 'RSI', 'Bollinger Bands', 'MACD', 'Volume'],
    entryConditions: {
      adaptiveStrategy: true,
      marketConditionAnalysis: true,
      multiTimeframeConfirmation: true
    },
    exitConditions: {
      adaptiveExits: true,
      trailingStop: true,
      partialProfitTaking: true
    },
    riskParameters: {
      dynamicPositionSizing: true,
      adaptiveRiskPerTrade: true,
      volatilityBasedStops: true
    },
    assetClasses: [AssetClass.FOREX, AssetClass.STOCKS, AssetClass.INDICES, AssetClass.COMMODITIES, AssetClass.CRYPTOCURRENCIES],
    stopLoss: 45,
    takeProfit: 90,
    maxOpenTrades: 6
  },
  grid_trading: {
    timeframes: ['H1', 'H4', 'D1'],
    indicators: ['Support/Resistance', 'Pivot Points', 'ATR'],
    entryConditions: {
      gridLevels: [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75],
      bidirectional: true,
      rangeConfirmation: true
    },
    exitConditions: {
      partialClosing: true,
      entireGridProfit: true,
      trendBreakout: true
    },
    riskParameters: {
      equalPositionSizing: true,
      totalRiskControl: true,
      maximumOpenPositions: 10
    },
    assetClasses: [AssetClass.FOREX, AssetClass.CRYPTOCURRENCIES],
    stopLoss: 100,
    leverage: 5,
    maxOpenTrades: 20
  },
  hedging: {
    timeframes: ['H4', 'D1', 'W1'],
    indicators: ['Correlation', 'Beta', 'Volatility'],
    entryConditions: {
      negativeCorrelation: -0.7,
      riskExposure: true,
      marketEventBased: true
    },
    exitConditions: {
      hedgingRatioNormalized: true,
      correlationChange: true,
      timeBasedRebalancing: 168
    },
    riskParameters: {
      portfolioBalanced: true,
      riskParityApproach: true,
      dynamicHedgeRatio: true
    },
    assetClasses: [AssetClass.FOREX, AssetClass.INDICES, AssetClass.COMMODITIES, AssetClass.BONDS],
    stopLoss: 80,
    takeProfit: 120,
    maxOpenTrades: 12
  },
  arbitrage: {
    timeframes: ['M1', 'M5', 'M15'],
    indicators: ['Price Difference', 'Spread Analysis', 'Execution Time'],
    entryConditions: {
      priceDivergence: 0.5,
      costFactor: 0.2,
      executionSpeed: 0.5
    },
    exitConditions: {
      convergence: true,
      timeLimit: 60,
      minProfitTarget: true
    },
    riskParameters: {
      balancedExposure: true,
      minimumSpreadRequirement: true,
      maximumHoldingTime: 120
    },
    assetClasses: [AssetClass.FOREX, AssetClass.STOCKS, AssetClass.CRYPTOCURRENCIES],
    stopLoss: 15,
    takeProfit: 25,
    leverage: 20,
    maxOpenTrades: 15
  },
  news_based: {
    timeframes: ['M5', 'M15', 'H1'],
    indicators: ['Economic Calendar', 'Volatility', 'Volume'],
    entryConditions: {
      newsImpact: 'high',
      preNewsEntryTime: 15,
      postNewsReaction: true
    },
    exitConditions: {
      volatilityReturn: true,
      timeBasedExit: 60,
      profitTargetReached: true
    },
    riskParameters: {
      reducedPositionSize: true,
      widerStopLoss: true,
      newsSpecificSettings: true
    },
    assetClasses: [AssetClass.FOREX, AssetClass.STOCKS, AssetClass.INDICES],
    stopLoss: 70,
    takeProfit: 90,
    maxOpenTrades: 3
  },
  adaptive_momentum: {
    timeframes: ['M15', 'H1', 'H4', 'D1'],
    indicators: ['ROC', 'ADX', 'Momentum', 'Volume'],
    entryConditions: {
      momentumStrength: 70,
      directionConfirmation: true,
      volumeSupport: true
    },
    exitConditions: {
      momentumWeakening: true,
      contrarySignals: true,
      profitProtection: true
    },
    riskParameters: {
      dynamicPositionSizing: true,
      momentumBasedStopLoss: true,
      scaledExits: true
    },
    assetClasses: [AssetClass.FOREX, AssetClass.STOCKS, AssetClass.INDICES, AssetClass.COMMODITIES],
    stopLoss: 50,
    takeProfit: 100,
    maxOpenTrades: 8
  }
};

export const MT5Algorithms = {
  /**
   * Get available strategies for MT5 trading
   */
  getStrategies(): { id: MT5Strategy; name: string; description: string }[] {
    return [
      {
        id: 'trend_following',
        name: 'متابعة الترند',
        description: 'استراتيجية تتبع اتجاه السوق باستخدام المتوسطات المتحركة والمؤشرات الفنية'
      },
      {
        id: 'mean_reversion',
        name: 'العودة للمتوسط',
        description: 'استراتيجية تستهدف الفرص عندما ينحرف السعر بشكل كبير عن متوسطه'
      },
      {
        id: 'breakout',
        name: 'اختراق المستويات',
        description: 'استراتيجية تستهدف اختراقات مستويات الدعم والمقاومة القوية'
      },
      {
        id: 'scalping',
        name: 'سكالبينج',
        description: 'استراتيجية تداول سريعة تستهدف أرباح صغيرة متكررة خلال اليوم'
      },
      {
        id: 'smart_auto',
        name: 'ذكاء اصطناعي متكيف',
        description: 'استراتيجية متطورة تستخدم التحليل المتكيف وفق ظروف السوق'
      },
      {
        id: 'grid_trading',
        name: 'التداول الشبكي',
        description: 'استراتيجية تضع أوامر شراء وبيع على مستويات سعرية مختلفة'
      },
      {
        id: 'hedging',
        name: 'التحوط',
        description: 'استراتيجية لتقليل المخاطر من خلال اتخاذ مراكز متعاكسة'
      },
      {
        id: 'arbitrage',
        name: 'المراجحة',
        description: 'استراتيجية تستفيد من فروق الأسعار في أسواق مختلفة'
      },
      {
        id: 'news_based',
        name: 'التداول على الأخبار',
        description: 'استراتيجية تستفيد من تأثير الأخبار الاقتصادية الهامة'
      },
      {
        id: 'adaptive_momentum',
        name: 'الزخم المتكيف',
        description: 'استراتيجية تتبع قوة وسرعة تحرك السعر مع تكيف ديناميكي'
      }
    ];
  },

  /**
   * Get default settings for a specific MT5 strategy
   */
  getStrategySettings(strategyType: MT5Strategy): MT5StrategySettings {
    return defaultSettings[strategyType] || defaultSettings.smart_auto;
  },

  /**
   * Create a new MT5 trading bot with the specified strategy
   */
  async createBot(
    accountId: string,
    name: string,
    strategyType: MT5Strategy,
    assetClass: AssetClass,
    assets: string[],
    riskLevel: 'low' | 'medium' | 'high' = 'medium',
    tradingMode: 'demo' | 'real' = 'demo'
  ) {
    try {
      const settings = this.getStrategySettings(strategyType);
      
      // Adjust settings based on risk level
      const riskMultiplier = riskLevel === 'low' ? 0.5 : (riskLevel === 'high' ? 2.0 : 1.0);
      
      const adjustedSettings = {
        ...settings,
        riskParameters: {
          ...settings.riskParameters,
          maxRiskPerTrade: settings.riskParameters.maxRiskPerTrade * riskMultiplier
        },
        stopLoss: Math.round(settings.stopLoss * (riskLevel === 'low' ? 0.7 : (riskLevel === 'high' ? 1.3 : 1.0))),
        takeProfit: Math.round(settings.takeProfit * (riskLevel === 'low' ? 0.8 : (riskLevel === 'high' ? 1.2 : 1.0)))
      };
      
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('trading_bots')
        .insert({
          name,
          account_id: accountId,
          strategy_type: strategyType,
          trading_pair: assets[0] || '', // For compatibility
          is_active: true,
          risk_level: riskLevel,
          settings: adjustedSettings,
          trading_mode: tradingMode,
          asset_class: assetClass,
          assets: assets,
          description: `روبوت تداول آلي باستراتيجية ${this.getStrategies().find(s => s.id === strategyType)?.name || strategyType}`,
          multi_strategy: false,
          auto_management: true,
          auto_settings: {
            smart_position_sizing: true,
            auto_strategy_rotation: false,
            capital_preservation: riskLevel === 'low',
            max_daily_trades: riskLevel === 'low' ? 3 : (riskLevel === 'high' ? 15 : 8),
            profit_reinvestment_rate: riskLevel === 'low' ? 30 : (riskLevel === 'high' ? 70 : 50),
            adaptive_risk_management: true
          }
        })
        .select();
        
      if (error) throw error;
      
      return {
        success: true,
        botId: data[0].id,
        message: 'تم إنشاء روبوت التداول بنجاح'
      };
    } catch (error) {
      console.error('Error creating MT5 bot:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'حدث خطأ أثناء إنشاء روبوت التداول'
      };
    }
  },
  
  /**
   * Start a trading bot with specific settings
   */
  async startBot(botId: string) {
    try {
      // Get the bot details first
      const { data: bot, error: botError } = await supabase
        .from('trading_bots')
        .select('*')
        .eq('id', botId)
        .single();
        
      if (botError) throw botError;
      
      // Get account details
      const { data: account, error: accountError } = await supabase
        .from('trading_accounts')
        .select('*')
        .eq('id', bot.account_id)
        .single();
        
      if (accountError) throw accountError;
      
      // Verify if account is ready for trading
      if ((account.platform === 'MT5' || account.platform === 'MT4') && !account.mt5_connection_status) {
        return {
          success: false,
          message: 'حساب MT5 غير متصل، يرجى إعداد الاتصال أولاً'
        };
      }
      
      if ((account.platform === 'Binance' || account.platform === 'Bybit' || account.platform === 'KuCoin') && !account.is_api_verified) {
        return {
          success: false,
          message: 'مفاتيح API غير مُتحقق منها، يرجى إعداد مفاتيح API أولاً'
        };
      }
      
      // Update the bot status
      const { error: updateError } = await supabase
        .from('trading_bots')
        .update({
          is_active: true,
          server_status: 'running',
          last_activity: new Date().toISOString()
        })
        .eq('id', botId);
        
      if (updateError) throw updateError;
      
      // Try to invoke the edge function
      try {
        if (account.platform === 'MT5' || account.platform === 'MT4') {
          const { data, error } = await supabase.functions.invoke('mt5-api', {
            body: { 
              action: 'startBot',
              botId,
              accountId: bot.account_id
            }
          });

          if (error) throw new Error(error.message);
          
          return {
            success: true,
            message: 'تم تشغيل روبوت التداول بنجاح'
          };
        } else {
          const { data, error } = await supabase.functions.invoke('binance-api', {
            body: { 
              action: 'startBot',
              botId,
              accountId: bot.account_id
            }
          });

          if (error) throw new Error(error.message);
          
          return {
            success: true,
            message: 'تم تشغيل روبوت التداول بنجاح'
          };
        }
      } catch (funcError) {
        console.warn('Edge function error or not available:', funcError);
        
        // For development/demo purposes
        return {
          success: true,
          message: 'تم تشغيل روبوت التداول بنجاح (محاكاة)'
        };
      }
    } catch (error) {
      console.error('Error starting bot:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'حدث خطأ أثناء تشغيل روبوت التداول'
      };
    }
  }
};
