import * as mongoose from 'mongoose';

export const ArbitrageSchema = new mongoose.Schema({
    arbitrageId: String,
    balanceVolume: Number,
    assetVolume: Number,
    asset: String,
    closeSecondCickle: Boolean,
});
