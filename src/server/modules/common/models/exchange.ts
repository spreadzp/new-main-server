import { Document } from 'mongoose';

export interface Exchange extends Document {
    readonly exchangeName: string;
    readonly makerFee: number;
    readonly takerFee: number;
}
