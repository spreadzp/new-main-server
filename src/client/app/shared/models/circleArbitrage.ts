import { Trade } from './trade';
export interface CircleArbitrage {
    arbitrageId: string;
    firstCircle: {
        openSellTrade: Trade; // получить с /server/modules/db/arbit-balance/arbit-balance.service.ts
        openSellRate: number; //для exchange из openSellTrade получить с /server/modules/db/rate/rate.service.ts
        openBuyTrade: Trade; // получить с /server/modules/db/arbit-balance/arbit-balance.service.ts
        openBuyRate: number; //для exchange из openBuyTrade получить с /server/modules/db/rate/rate.service.ts
    };
    secondCircle: {
        closeSellTrade: Trade; //для exchange из openSellTrade пока незакрыт 2й полуцикл данные  из getCurrentPrice(стр 346) => /server/modules/server/parser.ts
        closeSellRate: number; //для exchange из closeSellTrade получить с /server/modules/db/rate/rate.service.ts
        closeBuyTrade: Trade; //для exchange из openBuyTrade пока незакрыт 2й полуцикл данные  из getCurrentPrice(стр 346) => /server/modules/server/parser.ts
        closeBuyRate: number; //для exchange из closeBuyTrade получить с /server/modules/db/rate/rate.service.ts
    };
}
