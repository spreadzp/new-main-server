import * as mongoose from 'mongoose';

const ObjectId = mongoose.Schema.Types.ObjectId;
export const ArbitrageBalanceSchema = new mongoose.Schema({
    arbitrageId: String,
    matrixId: ObjectId,
    userId: ObjectId, //Хоть у нас и есть matrixId по которому мы быстро пользователя вычислим, будут ситуации где выгодней этого не делать
    firstCickleBuy: { price: Number, size: Number, typeOrder: String, exchange: String, pair: String, exchangeId: String, rate: Number },
    firstCickleSell: { price: Number, size: Number, typeOrder: String, exchange: String, pair: String, exchangeId: String, rate: Number },
    secondCickleBuy: [{ price: Number, size: Number, typeOrder: String, exchange: String, pair: String, exchangeId: String, rate: Number }],
    secondCickleSell: [{ price: Number, size: Number, typeOrder: String, exchange: String, pair: String, exchangeId: String, rate: Number }],
    closeSecondCickle: {type: Boolean, default: false} ,
});
