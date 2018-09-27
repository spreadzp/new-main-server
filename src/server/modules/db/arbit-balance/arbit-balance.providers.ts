import { getModelToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ArbitrageBalanceSchema } from './shemas/arbit-balance.shema';
import { ARBITRAGE_BALANCE_MODEL_TOKEN, DB_CONNECTION_TOKEN} from './../../../server.constants';

export const arbitrageBalancesProviders = [
  {
    provide: getModelToken(ARBITRAGE_BALANCE_MODEL_TOKEN),
    useFactory: (connection: Connection) => connection.model('ArbitrageBalance', ArbitrageBalanceSchema),
    inject: [DB_CONNECTION_TOKEN],
  },
];
