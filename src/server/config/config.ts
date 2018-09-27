import { extractKey } from '../utilities/keys';

interface IEnvironmentConfig {
  rootPath: string;
  db: string;
  httpPort: number;
  tcpPort: number;
  wsPort: number;
  jwtSecret: string;
  domain: string;
  httpProtocol: string;
  wsProtocol: string;
  forexApiKey: string;
  forexPairs: string;
  percentProfit: number;
  deviationPrice: number;
  tradeVolume: number;
  fee: number;
  profitTotalAbsolute: number;
  startAsset: number;
  startCurrency: number;
}

interface IConfig {
  [key: string]: IEnvironmentConfig;
  development: IEnvironmentConfig;
  production: IEnvironmentConfig;
}

const rootPath = process.cwd();
const jwtSecret = extractKey(`${rootPath}/keys/jwt.private.key`);

const Config: IConfig = {
  development: {
    rootPath,
    db: 'mongodb://localhost:27017/orders-book',
    httpPort: 3001,
    tcpPort: 8000,
    wsPort: 1338,
    jwtSecret,
    domain: 'localhost',
    httpProtocol: 'http',
    wsProtocol: 'ws',
    forexApiKey: 'bfBuXo30skEAA0ES4Wz3lNQksUjcTuce',
    forexPairs: 'EURUSD,GBPUSD,USDJPY',
    percentProfit: -0.2,
    deviationPrice: 0.05,
    tradeVolume: 1,
    fee: 0.01,
    profitTotalAbsolute: -15,
    startAsset: 10,
    startCurrency: 50000

  },
  production: {
    rootPath,
    db: process.env.MONGODB_CONNECTION,
    httpPort: +process.env.HTTP_SERVER_PORT,
    tcpPort: +process.env.TCP_PORT,
    wsPort: +process.env.WS_PORT,
    jwtSecret: process.env.JWT_SECRET,
    domain: process.env.DOMAIN,
    httpProtocol: process.env.HTTP_PROTOCOL,
    wsProtocol: process.env.WS_PROTOCOL,
    forexApiKey: process.env.FOREX_API_KEY,
    forexPairs: process.env.FOREX_PAIRS,
    percentProfit: +process.env.PERCENT_PROFIT,
    deviationPrice: +process.env.DEVIATION_PRICE,
    tradeVolume: +process.env.TRADE_VOLUME,
    fee: +process.env.FEE,
    profitTotalAbsolute: +process.env.PROFIT_SECOND_CIRCLE,
    startAsset: +process.env.START_ASSET,
    startCurrency: +process.env.START_CURRERCY
  }
};

export {
  IEnvironmentConfig,
  IConfig,
  Config
};
