import { EventEmitter, Injectable } from '@angular/core';
import { Rate } from '../shared/models/rate';
import { ApiService } from './api.service';
import { Matrix } from '../shared/models/matrix';
@Injectable()
export class MatrixService {
    public rateCreated: EventEmitter<Rate> = new EventEmitter();

    private matrix: Matrix = {
            name: 'ETH',
            userId: '584fe811ed936fe74d8b466f', // Идентификатор пользовател, владельца матрицы. В будущем будет populate()
            // Каждая "дeльта" содержит в себе набор бирж ОТ и ДО (направление транзакции)
            deltas: [{
                from: '584fe811ed936fe74d8b466f', // eachange FROM
                to: '584fe811ed936fe74d8b466f', // exchange to
                deltaOpen: 0.1,
                deltaClose: 1,
            }],
            instruments: [{
                tradeAccount: '584fe811ed936fe74d8b466f',   // Торговый акканут
                exchangeId: '584fe811ed936fe74d8b466f',
                pair: 'ETH/BTC',
                server: 'Asia', //
                balance: { fiat: 10000, crypto: 100 },
                balancePaper: { fiat: 1000000, crypto: 10000 },
            }],
            deviation: 0.05,
            lotStep: 0.1,
            active: true,  // После публикации матрицы она не активна
            paper: false,   // Изначально торгуем реальными деньгами если не задано обратное
            history: false, // Нахо}
        };

    constructor(private apiService: ApiService) { }

    getMatrix<T>(url: string) {
        return this.apiService.get<T>(url);
    }

    public addMatrix(rate: any) {
        return this.apiService.post('matrix/create', this.matrix);
    }

    public removeMatrix(rate: any) {
        this.apiService.delete('rates/delete', rate);
    }

    /* public addRates(rates: Rate[]): void {
        this.rates.push(...rates);
    } */
}
