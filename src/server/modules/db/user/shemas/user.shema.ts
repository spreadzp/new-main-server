import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
    username: String, //Имя пользователя
    password: String, //Пароль
    tradeAccounts: [
        {
            name: String, //Имя биржи
            exchangeFees: { makerFee: Number, takerFee: Number}, //коммиссия биржи
            exchangeId: mongoose.Types.ObjectId, //Айди биржы
            apiKey: String, //Ключ
            apiSecret: String, //Секрет
            apiUser: String //username, client-id и прочее
        }
    ],
    dateCreate: Date
});
