import * as mongoose from 'mongoose';

export const ExchangeSchema = new mongoose.Schema({
    exchangeName: String,
    makerFee: Number,
    takerFee: Number,
});
