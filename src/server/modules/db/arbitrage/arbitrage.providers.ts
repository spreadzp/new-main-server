import { getModelToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ArbitrageSchema } from './shemas/arbitrage.shema';
import { ARBITRAGE_MODEL_TOKEN, DB_CONNECTION_TOKEN} from './../../../server.constants';

export const arbitragesProviders = [
  {
    provide: getModelToken(ARBITRAGE_MODEL_TOKEN),
    useFactory: (connection: Connection) => connection.model('Arbitrage', ArbitrageSchema),
    inject: [DB_CONNECTION_TOKEN],
  },
];
