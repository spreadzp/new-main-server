import * as mongoose from 'mongoose';

export const OrderSchema = new mongoose.Schema({
    exchange: String,
    pair: String,
    price: Number,
    volume: Number,
    size: Number,
    origSize: Number,
    remainingSize: Number,
    typeOrder: String,
    fee: Number,
    arbitrageId: String,
    exchangeId: String,
    deviationPrice: Number,
    time: String,
    host: String,
    port: Number,
    status: String,
    reason: String,
});
