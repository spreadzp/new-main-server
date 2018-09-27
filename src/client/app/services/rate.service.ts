import { EventEmitter, Injectable } from '@angular/core';
import { Rate } from '../shared/models/rate';
import { ApiService } from './api.service';
@Injectable()
export class RateService {
    public rateCreated: EventEmitter<Rate> = new EventEmitter();

    private rates: Rate[] = [
        new Rate('Bitfinex', 0.2, 0.1),
        new Rate('Bittrex', 0.25, 0.2),
        new Rate('HitBtc', 0.2, 0.1)
    ];

    constructor(private apiService: ApiService) { }

    getRates<T>(url: string) {
      return this.apiService.get<T>(url);
    }

    public addRate(rate: Rate) {
        this.apiService.post('rates/save' , rate);
    }

    public removeRate(rate: Rate) {
        this.apiService.delete('rates/delete', rate);
    }

    public addRates(rates: Rate[]): void {
        this.rates.push(...rates);
    }
}
