import * as mongoose from 'mongoose';

export const MatrixSchema = new mongoose.Schema({
    name: String,
    userId: mongoose.Schema.Types.ObjectId, // Идентификатор пользовател, владельца матрицы. В будущем будет populate()

    // Каждая "дальта" содержит в себе набор бирж ОТ и ДО (направление транзакции)
    deltas: [{
        from: mongoose.Schema.Types.ObjectId, // eachange FROM
        to: mongoose.Schema.Types.ObjectId, // exchange to
        deltaOpen: Number,
        deltaClose: Number
    }],

    instruments: [{
        tradeAccount: mongoose.Schema.Types.ObjectId,  // Торговый акканут
        exchangeId: mongoose.Schema.Types.ObjectId,
        pair: String,
        server: String,
        balance: { fiat: Number, crypto: Number },
        balancePaper: { fiat: Number, crypto: Number }
    }],

    deviation: Number,
    lotStep: Number,

    active: Boolean,  // После публикации матрицы она не активна
    paper: Boolean,   // Изначально торгуем реальными деньгами если не задано обратное
    history: Boolean // Находится ли данная матрица в истории (не активна)

});
