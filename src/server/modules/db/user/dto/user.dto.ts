import { ObjectId } from "bson";

export class UserDto {
    readonly username: String; //Имя пользователя
    readonly password: String; //Пароль
    tradeAccounts: [
      {
          name: String, //Имя
          exchangeFees: { makerFee: Number, takerFee: Number}, //коммиссия биржи
          exchangeId: ObjectId, //Айди биржы
          apiKey: String, //Ключ
          apiSecret: String, //Секрет
          apiUser: String //username, client-id и прочее
      }
    ];
    readonly dateCreate: Date
  }
