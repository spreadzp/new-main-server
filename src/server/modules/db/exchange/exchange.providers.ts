import { getModelToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ExchangeSchema } from './shemas/exchange.shema';
import { EXCHANGE_MODEL_TOKEN, DB_CONNECTION_TOKEN} from './../../../server.constants';

export const exchangesProviders = [
  {
    provide: getModelToken(EXCHANGE_MODEL_TOKEN),
    useFactory: (connection: Connection) => connection.model('Exchange', ExchangeSchema),
    inject: [DB_CONNECTION_TOKEN],
  },
];
