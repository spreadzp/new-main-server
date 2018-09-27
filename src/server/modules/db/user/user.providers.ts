import { Connection } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { UserSchema } from './shemas/user.shema';
import { TRADE_MODEL_TOKEN, DB_CONNECTION_TOKEN} from './../../../server.constants';

export const UsersProviders = [
  {
    provide: getModelToken(TRADE_MODEL_TOKEN),
    useFactory: (connection: Connection) => connection.model('User', UserSchema),
    inject: [DB_CONNECTION_TOKEN],
  },
];
