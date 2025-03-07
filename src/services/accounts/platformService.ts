
import { TradingPlatform } from "@/services/binance/types";

/**
 * Get all supported trading platforms
 */
export const getSupportedPlatforms = async (): Promise<TradingPlatform[]> => {
  return [
    {
      id: 'binance',
      name: 'Binance',
      logo: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png',
      description: 'أكبر منصة تداول للعملات الرقمية في العالم',
      url: 'https://www.binance.com',
      supported: true,
      supports_forex: false,
      supports_stocks: false,
      supports_indices: false,
      supports_commodities: false,
      supports_crypto: true,
      supports_bonds: false,
      supports_etfs: false,
      supports_futures: true,
      connection_method: 'api'
    },
    {
      id: 'bybit',
      name: 'Bybit',
      logo: 'https://cryptologos.cc/logos/bybit-logo.png',
      description: 'منصة تداول موثوقة للعملات الرقمية والعقود الآجلة',
      url: 'https://www.bybit.com',
      supported: true,
      supports_forex: false,
      supports_stocks: false,
      supports_indices: false,
      supports_commodities: false,
      supports_crypto: true,
      supports_bonds: false,
      supports_etfs: false,
      supports_futures: true,
      connection_method: 'api'
    },
    {
      id: 'kucoin',
      name: 'KuCoin',
      logo: 'https://cryptologos.cc/logos/kucoin-token-kcs-logo.png',
      description: 'منصة تداول عالمية متكاملة للعملات الرقمية',
      url: 'https://www.kucoin.com',
      supported: true,
      supports_forex: false,
      supports_stocks: false,
      supports_indices: false,
      supports_commodities: false,
      supports_crypto: true,
      supports_bonds: false,
      supports_etfs: false,
      supports_futures: true,
      connection_method: 'api'
    },
    {
      id: 'mt4',
      name: 'MT4',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Metatrader_logo.png',
      description: 'منصة تداول الفوركس والعقود مقابل الفروقات الأكثر شعبية',
      url: 'https://www.metatrader4.com',
      supported: true,
      supports_forex: true,
      supports_stocks: true,
      supports_indices: true,
      supports_commodities: true,
      supports_crypto: false,
      supports_bonds: true,
      supports_etfs: true,
      supports_futures: true,
      connection_method: 'mt_protocol'
    },
    {
      id: 'mt5',
      name: 'MT5',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Metatrader_logo.png',
      description: 'منصة التداول المتقدمة من MetaQuotes',
      url: 'https://www.metatrader5.com',
      supported: true,
      supports_forex: true,
      supports_stocks: true,
      supports_indices: true,
      supports_commodities: true,
      supports_crypto: true,
      supports_bonds: true,
      supports_etfs: true,
      supports_futures: true,
      connection_method: 'mt_protocol'
    }
  ];
};

/**
 * Gets the recommended trading pairs for small balance accounts
 */
export const getRecommendedPairsForSmallBalance = async (): Promise<string[]> => {
  return [
    'BTCUSDT',  // Bitcoin
    'ETHUSDT',  // Ethereum
    'BNBUSDT',  // Binance Coin
    'ADAUSDT',  // Cardano
    'DOGEUSDT', // Dogecoin
    'XRPUSDT',  // Ripple
    'TRXUSDT',  // TRON
    'LTCUSDT',  // Litecoin
    'DOTUSDT',  // Polkadot
    'MATICUSDT' // Polygon
  ];
};
