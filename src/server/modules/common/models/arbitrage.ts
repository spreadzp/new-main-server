import { Document } from 'mongoose';

export interface Arbitrage extends Document {
    readonly arbitrageId: string;
    readonly balanceVolume: number;
    readonly assetVolume: number;
    readonly asset: string;
    readonly closeSecondCickle: boolean;
}
