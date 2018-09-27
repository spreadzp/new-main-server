import { getModelToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { MatrixSchema } from './shemas/matrix.shema';
import { MATRIX_MODEL_TOKEN, DB_CONNECTION_TOKEN} from './../../../server.constants';

export const MatrixProviders = [
  {
    provide: getModelToken(MATRIX_MODEL_TOKEN),
    useFactory: (connection: Connection) => connection.model('Matrix', MatrixSchema),
    inject: [DB_CONNECTION_TOKEN],
  },
];
