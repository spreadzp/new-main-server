import { Connection } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { ORDER_MODEL_TOKEN, DB_CONNECTION_TOKEN} from './../../../server.constants';
import { OrderSchema } from './shemas/order.shema';

export const ordersProviders = [
  {
    provide: getModelToken(ORDER_MODEL_TOKEN),
    useFactory: (connection: Connection) => connection.model(ORDER_MODEL_TOKEN, OrderSchema),
    inject: [DB_CONNECTION_TOKEN],
  },
];
