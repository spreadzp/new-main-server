import { PureTrade } from './pureTrade';
import { Exchange } from './exchange';
//Pure 
export interface CircleArbitrage {
    arbitrageId: string;
    firstCircle: {
        openSellTrade: PureTrade; // получить с /server/modules/db/arbit-balance/arbit-balance.service.ts
        openSellRate: Exchange; //для exchange из openSellTrade получить с /server/modules/db/rate/rate.service.ts
        openBuyTrade: PureTrade; // получить с /server/modules/db/arbit-balance/arbit-balance.service.ts
        openBuyRate: Exchange; //для exchange из openBuyTrade получить с /server/modules/db/rate/rate.service.ts
    };
    secondCircle: {
        closeSellTrade: PureTrade; //для exchange из openSellTrade пока незакрыт 2й полуцикл данные  из getCurrentPrice(стр 346) => /server/modules/server/parser.ts
        closeSellRate: Exchange; //для exchange из closeSellTrade получить с /server/modules/db/rate/rate.service.ts
        closeBuyTrade: PureTrade; //для exchange из openBuyTrade пока незакрыт 2й полуцикл данные  из getCurrentPrice(стр 346) => /server/modules/server/parser.ts
        closeBuyRate: Exchange; //для exchange из closeBuyTrade получить с /server/modules/db/rate/rate.service.ts
    };
}
