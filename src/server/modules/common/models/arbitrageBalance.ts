import { Document } from 'mongoose';
import { PureTrade } from './pureTrade';
import * as mongoose from 'mongoose';

export interface ArbitrageBalance extends Document {
    readonly arbitrageId: string;
    readonly firstCickleBuy: PureTrade;
    readonly firstCickleSell: PureTrade;
    readonly secondCickleBuy: [PureTrade];
    readonly secondCickleSell: [PureTrade];
    readonly closeSecondCickle: boolean;
    readonly matrixId: mongoose.Schema.Types.ObjectId;
    readonly userId: mongoose.Schema.Types.ObjectId;
}