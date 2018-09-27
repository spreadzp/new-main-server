import { Config, IEnvironmentConfig } from './config/config';

const env = process.env.NODE_ENV || 'development';

export const SERVER_CONFIG: IEnvironmentConfig = Config[env];

export const DB_CONNECTION_TOKEN: string = 'DbConnectionToken';
export const SERVER_CONFIG_TOKEN: string = 'ServerConfigToken';
export const USER_MODEL_TOKEN: string = 'UserModelToken';
export const MATRIX_MODEL_TOKEN: string = 'Matrix';
export const FACEBOOK_CONFIG_TOKEN: string = 'FacebookConfigToken';
export const TWITTER_CONFIG_TOKEN: string = 'TwitterConfigToken';
export const GOOGLE_CONFIG_TOKEN: string = 'GoogleConfigToken';
export const ORDER_BOOK_MODEL_TOKEN: string = 'OrderBook';
export const ORDER_MODEL_TOKEN: string = 'Order';
export const TRADE_MODEL_TOKEN: string = 'Trade';
export const EXCHANGE_MODEL_TOKEN: string = 'Exchange';
export const ARBITRAGE_MODEL_TOKEN: string = 'Arbitrage';
export const ARBITRAGE_BALANCE_MODEL_TOKEN: string = 'ArbitrageBalance';


export const MESSAGES = {
  UNAUTHORIZED_EMAIL_IN_USE: 'The email already exists',
  UNAUTHORIZED_INVALID_PASSWORD: 'Invalid password',
  UNAUTHORIZED_INVALID_EMAIL: 'The email does not exist',
  UNAUTHORIZED_UNRECOGNIZED_BEARER: 'Unrecognized bearer of the token'
};
