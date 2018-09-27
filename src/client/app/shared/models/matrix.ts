export interface Matrix {
    name: string;
    userId: string; // Идентификатор пользовател, владельца матрицы. В будущем будет populate()

    // Каждая "дeльта" содержит в себе набор бирж ОТ и ДО (направление транзакции)
    deltas: [{
        from: string; // eachange FROM
        to: string; // exchange to
        deltaOpen: number;
        deltaClose: number;
    }];

    instruments: [{
        tradeAccount: string;   // Торговый акканут
        exchangeId: string;
        pair: string;
        server: string; //
        balance: { fiat: number, crypto: number };
        balancePaper: { fiat: number, crypto: number };
    }];

    deviation: number;
    lotStep: number;
    active: boolean;  // После публикации матрицы она не активна
    paper: boolean;   // Изначально торгуем реальными деньгами если не задано обратное
    history: boolean; // Нахо
}
