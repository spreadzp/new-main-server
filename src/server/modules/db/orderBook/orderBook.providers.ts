import { OrderBookSchema } from './shemas/orderBook.shema';
import { Connection } from 'mongoose';
import { ORDER_BOOK_MODEL_TOKEN, DB_CONNECTION_TOKEN} from './../../../server.constants';
import { getModelToken } from '@nestjs/mongoose';

export const orderBooksProviders = [
  {
    provide: getModelToken(ORDER_BOOK_MODEL_TOKEN),
    useFactory: (connection: Connection) => connection.model('OrderBook', OrderBookSchema),
    inject: [DB_CONNECTION_TOKEN],
  },
];
