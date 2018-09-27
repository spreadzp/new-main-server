import { Connection } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { TradeSchema } from './shemas/trade.shema';
import { TRADE_MODEL_TOKEN, DB_CONNECTION_TOKEN} from './../../../server.constants';

export const tradesProviders = [
  {
    provide: getModelToken(TRADE_MODEL_TOKEN),
    useFactory: (connection: Connection) => connection.model('Trade', TradeSchema),
    inject: [DB_CONNECTION_TOKEN],
  },
];
