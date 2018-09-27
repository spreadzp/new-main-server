import { PureTrade } from '../../../common/models/pureTrade';
import * as mongoose from 'mongoose';

export class ArbitrageBalanceDto {
  readonly arbitrageId: string;
  readonly firstCickleBuy: PureTrade;
  readonly firstCickleSell: PureTrade;
  readonly secondCickleBuy: [PureTrade];
  readonly secondCickleSell: [PureTrade];
  readonly closeSecondCickle: boolean;
  matrixId: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
}
