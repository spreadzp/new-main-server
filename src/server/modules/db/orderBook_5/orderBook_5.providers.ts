import { OrderBookSchema } from './../orderBook/shemas/orderBook.shema';
import { Connection } from 'mongoose';
import { ORDER_5_BOOK_MODEL_TOKEN, DB_CONNECTION_TOKEN} from './../../../server.constants';
import { getModelToken } from '@nestjs/mongoose';

export const order5BooksProviders = [
  {
    provide: getModelToken(ORDER_5_BOOK_MODEL_TOKEN),
    useFactory: (connection: Connection) => connection.model('Order5Book', OrderBookSchema),
    inject: [DB_CONNECTION_TOKEN],
  },
];
