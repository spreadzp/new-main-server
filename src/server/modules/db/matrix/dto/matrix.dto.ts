import * as mongoose from 'mongoose';

export class MatrixDto {
  name: string;
  userId: mongoose.Schema.Types.ObjectId; // Идентификатор пользовател, владельца матрицы. В будущем будет populate()

  // Каждая "дальта" содержит в себе набор бирж ОТ и ДО (направление транзакции)
  deltas: [{
    from: mongoose.Schema.Types.ObjectId; // eachange FROM
    to: mongoose.Schema.Types.ObjectId; // exchange to
    deltaOpen: number;
    deltaClose: number;
  }];

  instruments: [{
    tradeAccount: mongoose.Schema.Types.ObjectId;   // Торговый акканут
    exchangeId: mongoose.Schema.Types.ObjectId;
    pair: string;
    server: string; //
    balance: { fiat: number, crypto: number };
    balancePaper: { fiat: number, crypto: number };
  }];

  deviation: number;
  lotStep: number;

  active: boolean;  // После публикации матрицы она не активна
  paper: boolean;   // Изначально торгуем реальными деньгами если не задано обратное
  history: boolean; // Находится ли данная матрица в истории (не активна)

}
