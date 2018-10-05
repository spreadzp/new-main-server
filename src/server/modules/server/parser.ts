import { OrderBook } from './../common/models/orderBook';
import { setInterval } from 'timers';
import { MatrixService } from './../db/matrix/matrix.service';
import { Exchange } from './../common/models/exchange';
import { ExchangeService } from './../db/exchange/exchange.service';
import { Controller } from '@nestjs/common';
import { UUID } from 'angular2-uuid';
import { Order } from './../common/models/order';
import { ExchangeData } from './../common/models/exchangeData';
import { CircleArbitrage } from './../common/models/circleArbitrage';
import { Trade } from './../common/models/trade';
import { OrderBookService } from './../db/orderBook/orderBook.service';
import { ArbitrageBalanceService } from './../db/arbit-balance/arbit-balance.service';
import { ArbitrageBalance } from './../common/models/arbitrageBalance';
import { StateTrading } from './../common/models/stateTrading';
import { ForexLoader } from './forex-loader';
import { SERVER_CONFIG } from './../../server.constants';
import { TradeService } from '../db/trade/trade.service';
import { PureTrade } from '../common/models/pureTrade';
import * as dotenv from 'dotenv';
import { Matrix } from '../common/models/matrix';
import { Order5BookService } from '../db/orderBook_5/orderBook_5.service';
dotenv.config();

let responseForexResource: { responseContent: { body: number } };
let fiatPrices: [any][number];

@Controller()
export class Parser {
    casheOrderBook: any[] = [];
    casheOrderBook5: any[] = [];
    exchangeData: ExchangeData[] = [];
    stateTrading: StateTrading[] = [];
    forexLoader: ForexLoader;
    matrixes: Matrix[] = [];
    bidAskSpread: any = [];
    rate: Exchange[] = [];
    closeSecondOrders: any[] = [];
    sentOrders: {
        arbitId: string, secondSellExchange: string, secondSellOrder: boolean,
        secondBuyExchange: string, secondBuyOrder: boolean, timeSendOrder: number
    }[] = [];

    constructor(
        private readonly orderBooksService: OrderBookService,
        private readonly order5BooksService: Order5BookService,
        private readonly exchangeService: ExchangeService,
        private readonly arbitrageBalanceService: ArbitrageBalanceService,
        private readonly tradeService: TradeService,
        private readonly matrixService: MatrixService) {
        this.forexLoader = new ForexLoader();
        this.getRates();
        this.getCurrentMatrix();
    }

    async getCurrentMatrix() {
        this.matrixes = await this.matrixService.findAll({ history: false });
    }

    async getRates() {
        this.rate = await this.exchangeService.findAll();
    }

    getForexPrices() {
        if (responseForexResource === undefined) {
            const pair = SERVER_CONFIG.forexPairs.split(',');
            responseForexResource = this.forexLoader.getNewFiatPrice([pair]);
        } else {
            if (responseForexResource.responseContent !== undefined) {
                const prices = responseForexResource.responseContent.body;
                fiatPrices = this.forexLoader.fiatParser(prices);
            }
        }
    }

    startSaverOrderBooks() {
        setInterval(() => {
            if (this.casheOrderBook.length) {
                for (const data of this.casheOrderBook) {
                    this.orderBooksService.addNewData(data);
                }
            }
            this.casheOrderBook = [];
        }, SERVER_CONFIG.timeStampAnalize);
        setInterval(() => {
            if (this.casheOrderBook5.length) {
                for (const data5 of this.casheOrderBook5) {
                    this.order5BooksService.addNewData(data5);
                }
            }
            this.casheOrderBook5 = [];
        }, SERVER_CONFIG.timeStampFront);
        this.startReseterExchangeData();
    }

    startReseterExchangeData() {
        setInterval(() => {
            this.exchangeData = [];
        }, SERVER_CONFIG.timeAgoArbitrage);
    }

    addNewArbitrageTrade(trade: Trade) {
        // this.arbitrageBalanceService.
        return this.tradeService.convertToPureTrade(trade, this.rate);
    }

    parseTcpMessage(data: any) {
        const exchangePair = data.payload.method.split(' ');
        const orderBook = data.payload.params.quote;
        const host = data.payload.params.host;
        const port = data.payload.params.port;
        return { exchangePair, orderBook, host, port };
    }

    parseSentOrder(data: any) {
        const responseOrderData = data.payload.params[0];
        if (!fiatPrices) {
            this.getForexPrices();
        }
    }

    calculateAskBid(newPrices: { exchangePair: any, orderBook: any, host: string, port: number }) {
        let currentForexPair: string, bids, asks;
        if (!fiatPrices) {
            this.getForexPrices();
        }
        if (newPrices.exchangePair[1] && fiatPrices) {
            currentForexPair = this.getNameFiatForex(newPrices.exchangePair[1]);
            bids = this.convertToUsdPrice(currentForexPair, newPrices.orderBook.bids);
            asks = this.convertToUsdPrice(currentForexPair, newPrices.orderBook.asks);

            this.setOldStatusPrice(
                newPrices.orderBook, newPrices.exchangePair, bids, asks,
                newPrices.host, newPrices.port, currentForexPair);
        }
    }

    private setOldStatusPrice(
        orderBook: any, exchangePair: any, bidsNewOrder: any, asksNewOrder: any, hostNewOrder: string,
        portNewOrder: number, currentForexPair: any) {
        let createdExchangeField = false;
        // если ничего это первая запись
        if (!this.exchangeData && orderBook.bids !== undefined
            && orderBook.asks !== undefined) {
            this.exchangeData = [
                {
                    exchange: exchangePair[0],
                    pair: exchangePair[1],
                    bids: bidsNewOrder,
                    bidVolumes: orderBook.bids[0][1],
                    asks: asksNewOrder,
                    askVolumes: orderBook.asks[0][1],
                    currentStatus: Date.now(),
                    status: true,
                    spread: 0,
                    host: hostNewOrder,
                    port: portNewOrder,
                    time: Date.now().toString(),
                },
            ];
        }// здесь всегда перезаписываются новые цены для существующей биржи и пары для остальных на -1 уменьшается data.currentStatus
        if (bidsNewOrder && asksNewOrder) {
            for (const data of this.exchangeData) {
                if (data.exchange === exchangePair[0]
                    && data.pair === exchangePair[1]
                    && orderBook.bids !== undefined && orderBook.asks !== undefined) {
                    data.pair = exchangePair[1];
                    data.bids = bidsNewOrder;
                    data.bidVolumes = orderBook.bids[0][1];
                    data.asks = asksNewOrder;
                    data.askVolumes = orderBook.asks[0][1];
                    data.currentStatus = Date.now();
                    data.host = hostNewOrder;
                    data.port = portNewOrder;
                    data.time = Date.now().toString();
                    createdExchangeField = true;
                }
                /*  else {
                     data.currentStatus -= 1;
                 } */
            }
        }
        // если биржа новая те в this.exchangeData ее не было
        if (!createdExchangeField && fiatPrices && exchangePair[1]) {
            bidsNewOrder = this.convertToUsdPrice(currentForexPair, orderBook.bids);
            asksNewOrder = this.convertToUsdPrice(currentForexPair, orderBook.asks);
            if (orderBook.bids !== undefined && orderBook.asks !== undefined) {
                this.exchangeData.push({
                    exchange: exchangePair[0],
                    pair: exchangePair[1],
                    bids: bidsNewOrder,
                    bidVolumes: orderBook.bids[0][1],
                    asks: asksNewOrder,
                    askVolumes: orderBook.asks[0][1],
                    currentStatus: Date.now(),
                    spread: 0,
                    host: hostNewOrder,
                    port: portNewOrder,
                    time: Date.now().toString(),
                    status: true,
                });
            }
        }
        return { bidsNewOrder, asksNewOrder, hostNewOrder, portNewOrder, createdExchangeField };
    }

    private convertToUsdPrice(currentForexPair: any, currentPrice: any) {
        return (currentForexPair !== undefined) ? (currentForexPair === 'USDJPY') ?
            [[+currentPrice[0][0] / +fiatPrices[currentForexPair][0], 0]] :
            [[+currentPrice[0][0] * +fiatPrices[currentForexPair][0], 0]] :
            currentPrice;
    }

    private fromUsdToFiatPrice(exchangePair: any, currentPrice: any) {
        const currentForexPair = this.getNameFiatForex(exchangePair);
        if (currentForexPair && fiatPrices[currentForexPair]) {
            return (currentForexPair === 'USDJPY') ?
                [[+currentPrice[0][0] * +fiatPrices[currentForexPair][0], 0]] :
                [[+currentPrice[0][0] / +fiatPrices[currentForexPair][0], 0]];
        } else {
            return currentPrice;
        }
    }

    replaceCancelledOrderByNewOrder(trade: Trade) {
        const currentOrderBooks = this.fetchOrderBook();
        let maxBuyPrise: number;
        let minSellPrise: number;
        const orders: any[] = [];

        if (currentOrderBooks) {
            maxBuyPrise = this.getMinAsk(currentOrderBooks);
            minSellPrise = this.getMaxBid(currentOrderBooks);
        }
        const sellExchange = currentOrderBooks.find((data: any) => {
            return data.bids === minSellPrise;
        });
        const buyExchange = currentOrderBooks.find((data: any) => {
            return data.asks === maxBuyPrise;
        });
        const newExchange: ExchangeData = (trade.typeOrder === 'sell') ? sellExchange : buyExchange;
        if (this.stateTrading) {
            this.stateTrading.forEach((tradeItem, index, array) => {
                if (tradeItem.arbitrageId === trade.arbitrageId && tradeItem.typeOrder === trade.typeOrder) {
                    this.stateTrading[index].exchange = newExchange.exchange;
                    this.stateTrading[index].pair = newExchange.pair;
                    this.stateTrading[index].host = newExchange.host;
                    this.stateTrading[index].port = newExchange.port;
                }
                const order = {
                    pair: this.stateTrading[index].pair,
                    exchange: this.stateTrading[index].exchange,
                    price: this.getCurrentPriceExchange(this.stateTrading[index].exchange, this.stateTrading[index].pair,
                        this.stateTrading[index].typeOrder),
                    volume: this.stateTrading[index].volume,
                    size: this.stateTrading[index].size,
                    origSize: this.stateTrading[index].origSize,
                    remainingSize: this.stateTrading[index].remainingSize,
                    typeOrder: this.stateTrading[index].typeOrder,
                    deviationPrice: +SERVER_CONFIG.deviationPrice,
                    fee: +SERVER_CONFIG.fee,
                    exchangeId: '',
                    host: this.stateTrading[index].host,
                    port: this.stateTrading[index].port,
                    arbitrageId: this.stateTrading[index].arbitrageId,
                    time: Date.now().toString(),
                    status: 'open',
                    reason: ''
                };
                orders.push(order);
            });
        }
        return orders;
    }

    orderFullFilled(trade: any) {
        let fullfilledOrder = false;
        let fullfilledOppositeOrder = false;
        if (this.stateTrading) {
            // console.log(' /////////package-lock.json***********stateTrading :', this.stateTrading);
            this.stateTrading.forEach((tradeItem, index, array) => {
                if (tradeItem.arbitrageId === trade.arbitrageId && tradeItem.typeOrder === trade.typeOrder) {
                    // console.log('1this.stateTrading[index].remainingSize :', this.stateTrading[index].remainingSize);
                    if (this.stateTrading[index].remainingSize === 0) {
                        fullfilledOrder = true;
                    }
                }
                if (tradeItem.arbitrageId === trade.arbitrageId && tradeItem.typeOrder !== trade.typeOrder) {
                    // console.log('2this.stateTrading[index].remainingSize :', this.stateTrading[index].remainingSize);
                    if (this.stateTrading[index].remainingSize === 0) {
                        fullfilledOppositeOrder = true;
                    }
                }
            });
        }
        if (fullfilledOrder && fullfilledOppositeOrder) {
            this.stateTrading = this.stateTrading.filter((currentTrade: StateTrading) => {
                if (currentTrade.remainingSize !== 0) {
                    return currentTrade;
                }
            });
        }
        // console.log('262fullfilledOrder && fullfilledOppositeOrder :', fullfilledOrder, fullfilledOppositeOrder);
        return !this.stateTrading.length || fullfilledOrder && fullfilledOppositeOrder;

    }

    subTradedVolume(trade: any) {
        console.log('268subTradedVolume :');
        if (this.stateTrading) {
            this.stateTrading.forEach((tradeItem, index, array) => {
                if (tradeItem.typeOrder === trade.typeOrder && tradeItem.arbitrageId === trade.arbitrageId
                    && this.stateTrading[index].remainingSize >= +trade.size) {
                    this.stateTrading[index].percentFullFilled += +trade.size / this.stateTrading[index].volume;
                    this.stateTrading[index].remainingSize -= +trade.size;
                }
            });
        }

    }

    setStatusTrade(order: Order) {
        let newOrderFlag = true;
        const newOrder: StateTrading = {
            exchange: order.exchange,
            pair: order.pair,
            typeOrder: order.typeOrder,
            volume: order.volume,
            size: order.size,
            origSize: order.origSize,
            remainingSize: order.remainingSize,
            percentFullFilled: 0,
            arbitrageId: order.arbitrageId,
            host: order.host,
            port: order.port,
            sendOrder: false
        };
        if (this.stateTrading) {
            for (const tradeItem of this.stateTrading) {
                if (tradeItem.exchange === order.exchange
                    && tradeItem.pair === order.pair
                    && tradeItem.typeOrder === order.typeOrder
                    && tradeItem.arbitrageId === order.arbitrageId
                ) {
                    // tradeItem.canTrade = false;
                    newOrderFlag = false;
                } else {
                    newOrderFlag = true;
                }
            }
            if (newOrderFlag) {
                this.stateTrading.push(newOrder);
            }
        } else {
            this.stateTrading.push(newOrder);
        }
        // console.log('this.stateTrading :', this.stateTrading);
    }

    getNameFiatForex(fiat: string) {
        if (fiatPrices) {
            const assetFiat = fiat.split('-');
            if (assetFiat[1] !== 'USD') {
                const key = Object.keys(fiatPrices);
                const searchFiat = key.find((element) => {
                    return element.includes(assetFiat[1]);
                });
                return searchFiat;
            }
        }
    }

    getShortCryptoName(pair: string) {
        let cryptoName = pair.split('-')[0];
        if (['XBT', 'someNameBtc'].indexOf(cryptoName) !== -1) {
            cryptoName = 'BTC';
        }
        return cryptoName;
    }

    addNewOrderBookData(): ExchangeData[] {
        if (this.exchangeData) {
            const currentOrderBooks = this.fetchOrderBook();
            if (currentOrderBooks) {
                for (const iterator of currentOrderBooks) {
                    if (iterator.bids !== 0 && iterator.asks !== 0) {
                        const newOrderBookData: any = {
                            exchangeName: iterator.exchange, pair: iterator.pair,
                            crypto: this.getShortCryptoName(iterator.pair),
                            bid: iterator.bids, bidVolume: iterator.bidVolumes, ask: iterator.asks,
                            askVolume: iterator.askVolumes, time: Date.now(),
                        };
                        this.addCasheOrderBook(newOrderBookData, this.casheOrderBook);
                        this.addCasheOrderBook(newOrderBookData, this.casheOrderBook5);
                        // this.orderBooksService.addNewData(newOrderBookData); // перенести в другое место сохранение
                    }
                }
                return currentOrderBooks;
            }
        }
    }

    addCasheOrderBook(newOrderBookData: any, cashe: any[]) {
        const index = cashe.findIndex(item => {
            return item.exchangeName === newOrderBookData.exchangeName &&
                item.pair === newOrderBookData.pair;
        });
        if (index !== -1) {
            cashe[index].bid = (newOrderBookData.bid > cashe[index].bid) ?
                newOrderBookData.bid : cashe[index].bid;
            cashe[index].ask = (newOrderBookData.ask < cashe[index].ask) ?
                newOrderBookData.ask : cashe[index].ask;
        } else {
            cashe.push(newOrderBookData);
        }
    }

    fetchOrderBook(): ExchangeData[] {
        return this.exchangeData.map(data => ({
            exchange: data.exchange, pair: data.pair,
            bids: data.bids[0][0], bidVolumes: data.bids[0][1], asks: data.asks[0][0], askVolumes: data.asks[0][1], time: Date.now().toString(),
            currentStatus: data.currentStatus, host: data.host, port: data.port, status: true,
            spread: 0,
        }));
    }

    getExchangePrice(exchange: string, pair: string, typePrice: string): ExchangeData {
        return this.exchangeData.find(data => {
            return data.exchange === exchange && data.pair === pair && data.currentStatus > (Date.now() - SERVER_CONFIG.timeAgoArbitrage);
        });
    }

    getCurrentPrice(): ExchangeData[] {
        return this.exchangeData.map(data => ({
            exchange: data.exchange, pair: data.pair, bids: data.bids[0][0], bidVolumes: data.bids[0][1], asks: data.asks[0][0],
            askVolumes: data.asks[0][1], spread: ((data.asks[0][0] / data.bids[0][0]) - 1) * 100, currentStatus: data.currentStatus,
            status: (data.currentStatus > Date.now() - SERVER_CONFIG.timeAgoArbitrage), host: data.host, port: data.port, time: Date.now().toString(),
        }));
    }

    getExchange(exch: string, pair: string) {
        return this.exchangeData.find(exchange => {
            return exchange.exchange === exch && exchange.pair === pair;
        });
    }

    // создание противоположного ордера для закрытия на основании сделки из 1 полуцикла
    convertPureTradeToOrder(trade: PureTrade, arbitId: string) {
        const currentExchange = this.getExchange(trade.exchange, trade.pair);
        const newTypeOrder = (trade.typeOrder === 'sell') ? 'buy' : 'sell';
        if (currentExchange) {
            const lastPrice = (newTypeOrder === 'sell') ? currentExchange.bids[0][0] : currentExchange.asks[0][0];
            let order = {};
            if (currentExchange) {
                order = {
                    exchange: trade.exchange,
                    pair: trade.pair,
                    price: lastPrice,
                    volume: trade.size,
                    size: trade.size,
                    origSize: trade.size,
                    remainingSize: trade.size,
                    typeOrder: newTypeOrder,
                    fee: 0.01,
                    arbitrageId: arbitId,
                    exchangeId: '',
                    deviationPrice: 0.01,
                    time: Date.now(),
                    host: currentExchange.host,
                    port: currentExchange.port,
                    status: 'open',
                    reason: ''
                };
            }
            return order;
        }
    }

    // формируем ордера для закрытия 2 полуцикла
    closeSecondArbitrage(trades: PureTrade[], arbitrageId: string): any[] {
        const orders: any[] = [];
        for (const trade of trades) {
            const order = this.convertPureTradeToOrder(trade, arbitrageId);
            if (JSON.stringify(order) !== '{}' || order !== undefined) {
                orders.push(order);
            } else {
                console.log('start order book price :');
            }
        }
        return orders;
    }

    defineTotalCurrentProfit(
        pureSellPrice: number, pureBuyPrice: number, closeSell: number, closeSellRate: number, closeBuy: number, closeBuyRate: number) {
        const profit = pureSellPrice + closeBuy - pureBuyPrice - closeSell;
        return profit;
    }

    removeCheckerSentOrders(arbitId: string) {
        // console.log('1this.sentOrders :', this.sentOrders);
        if (this.sentOrders) {
            this.sentOrders = this.sentOrders.filter((currentSentOrders: { arbitId: string }) => {
                if (currentSentOrders.arbitId !== arbitId) {
                    return currentSentOrders;
                }
            });
            // console.log('2this.sentOrders :', this.sentOrders);
        }
    }

    setCurrentTimeSentOrder(time: number, arbitId: string) {
        for (const order of this.sentOrders) {
            if (order.arbitId === arbitId) {
                order.timeSendOrder = time;
            }
        }
    }

    haveSentOrder(arbitId: string) {
        if (this.sentOrders) {
            const idSentOrder = this.sentOrders.find(item => item.arbitId === arbitId);
            return (idSentOrder) ? true : false;
        } else {
            return false;
        }
    }

    /* проверка отправляли ли уже заявку 2 цикла на покупку */
    checkFullfiledArbitrage(arbitId: string) {
        const checkingOrder = this.sentOrders.find(order => order.arbitId === arbitId);
        // console.log(' ******* checkFullfiledArbitrage :', checkingOrder);
        if (checkingOrder) {
            return checkingOrder.secondBuyOrder && checkingOrder.secondSellOrder;
        } else {
            return false;
        }
    }

    /* проверка отпрвляли ли уже заявку 2 цикла на покупку */
    checkSecondBuy(arbitId: string) {
        const checkingOrder = this.sentOrders.find(order => order.arbitId === arbitId);
        if (checkingOrder) {
            return checkingOrder.secondBuyOrder;
        } else {
            return false;
        }
    }

    checkSecondSell(arbitId: string) {
        const checkingOrder = this.sentOrders.find(order => order.arbitId === arbitId);
        if (checkingOrder) {
            return checkingOrder.secondSellOrder;
        } else {
            return false;
        }
    }

    defineMatrixesForPairExchange(pair: string, exch: string) {
        const currentMatrixes = this.matrixes.filter(matrix => matrix.name === pair);  // matrix.)
    }

    changeStatusInSentOrders(arbitId: string, typeOrder: string) {
        for (const sentOrder of this.sentOrders) {
            if (sentOrder.arbitId === arbitId) {
                (typeOrder === 'sell') ? sentOrder.secondSellOrder = true : sentOrder.secondBuyOrder = true;

            }
        }
    }

    changeStatusSecondOrders(arbitrageId: string) {
        this.arbitrageBalanceService.closeSecondCircleStatus(arbitrageId);
    }

    expiredTimeSendNotConfirmOrders(time: number) {
        const notConfirmOrders = this.sentOrders.filter(orders => (orders.timeSendOrder + 3600) < time);
        return notConfirmOrders;
    }

    /* // вызвать getMatrix после строки 578?
        здесь нужно брать данные из матрицы для вычисления закрытия 2 полуцикла
     */
    async getNotClosedArbitrage(): Promise<any[]> {
        let deltaProfit = 0;

        const circlesArray: CircleArbitrage[] = [];
        const trades = await this.arbitrageBalanceService.getActiveTrades();
        if (trades) {
            //  проверка не закрытых арбитражей
            for (const trade of trades) {
                // есть ли биржи с 1 полуцикла
                if (trade.firstCickleSell.exchange && trade.firstCickleBuy.exchange) {
                    const rateSell = await this.rate.find(rate => rate.exchangeName === trade.firstCickleSell.exchange);
                    const rateBuy = await this.rate.find(rate => rate.exchangeName === trade.firstCickleBuy.exchange);

                    if (trade.secondCickleBuy.length && trade.secondCickleSell.length) {
                        this.changeStatusSecondOrders(trade.arbitrageId);
                        // есть ли ставки для этих бирж
                    } else if (rateSell && rateBuy) {
                        // считаем чистые цены закрытия 2 -го полуцикла (с вычетом fee)
                        const closeSellPrice = await this.getCurrentPriceExchange(
                            trade.firstCickleSell.exchange, trade.firstCickleSell.pair, 'buy') * (1 + rateSell.takerFee / 100);
                        const closeBuyPrice = await this.getCurrentPriceExchange(
                            trade.firstCickleBuy.exchange, trade.firstCickleBuy.pair, 'sell') * (1 - rateBuy.takerFee / 100);
                        const currentArbitrage = await this.arbitrageBalanceService.findArbitrageById(trade.arbitrageId);
                        // фомируем потенциальные заявки закрытия и для вывода во фронт
                        const closeSell = {
                            price: closeSellPrice,
                            size: trade.firstCickleSell.size,
                            typeOrder: 'sell', // поменяется в
                            exchange: trade.firstCickleSell.exchange,
                            pair: trade.firstCickleSell.pair,
                            exchangeId: trade.firstCickleSell.exchangeId
                        };
                        const closeBuy = {
                            price: closeBuyPrice,
                            size: trade.firstCickleBuy.size,
                            typeOrder: 'buy',
                            exchange: trade.firstCickleBuy.exchange,
                            pair: trade.firstCickleBuy.pair,
                            exchangeId: trade.firstCickleBuy.exchangeId
                        };
                        // считаем дельту закрытия с учетом объёмов
                        deltaProfit = this.defineTotalCurrentProfit(
                            trade.firstCickleSell.price * trade.firstCickleSell.size,
                            trade.firstCickleBuy.price * trade.firstCickleBuy.size,
                            closeSellPrice * trade.firstCickleSell.size, rateSell.takerFee,
                            closeBuyPrice * trade.firstCickleBuy.size, rateBuy.takerFee);
                        // добавляем в массив возможный 2 й полуцикл  для отправки на фронт
                        circlesArray.push({
                            arbitrageId: trade.arbitrageId,
                            firstCircle: {
                                openSellTrade: trade.firstCickleSell,
                                openSellRate: rateSell,
                                openBuyTrade: trade.firstCickleBuy,
                                openBuyRate: rateBuy
                            },
                            secondCircle: {
                                closeSellTrade: closeSell,
                                closeSellRate: rateSell,
                                closeBuyTrade: closeBuy,
                                closeBuyRate: rateBuy
                            },
                        });
                        if (deltaProfit > +SERVER_CONFIG.profitTotalAbsolute) {
                            console.log('profit !!!!', trade.arbitrageId);
                            // если не закрыты 2-е полуциклы (или 1 из них)
                            if (!this.checkFullfiledArbitrage(trade.arbitrageId)) {
                                console.log(' // если не закрыты 2-е полуциклы (или 1 из них) :');
                                const orders = [];
                                // формируем заявки для 2 полуцикла для типов ордера еще не отправленного
                                // null if second order sent
                                const secondSell = this.checkSecondSell(trade.arbitrageId) ? null : closeSell;
                                const secondBuy = this.checkSecondBuy(trade.arbitrageId) ? null : closeBuy;
                                const currentOrder = {
                                    arbitId: trade.arbitrageId,
                                    secondSellExchange: trade.firstCickleSell.exchange,
                                    secondBuyExchange: trade.firstCickleBuy.exchange,
                                    secondSellOrder: false,
                                    secondBuyOrder: false,
                                    timeSendOrder: Date.now()
                                };
                                // наполняем массив для отправки заявок
                                if (secondBuy) {
                                    orders.push(secondBuy);
                                } else {
                                    this.changeStatusInSentOrders(trade.arbitrageId, 'sell');
                                }
                                if (secondSell) {
                                    orders.push(secondSell);
                                } else {
                                    this.changeStatusInSentOrders(trade.arbitrageId, 'buy');
                                }
                                console.log(' ++++++++++++orders.length :', orders.length);
                                // если заявки есть то
                                if (orders.length === 2) {
                                    // добавляем как отправленный 2 полуцикл
                                    console.log('добавляем как отправленный 2 полуцикл :');
                                    this.sentOrders.push(currentOrder);
                                    // вызываем закрытие 2-го полуцикла
                                    console.log('вызываем закрытие 2-го полуцикла :');
                                    this.closeSecondOrders = this.closeSecondArbitrage(
                                        orders, trade.arbitrageId);
                                } else {

                                }

                            }
                        } else {
                            // console.log('circlesArray :', await circlesArray);
                        }
                    }
                }
            }
        }
        return circlesArray;
    }

    getBidAskSpread() {
        const bidAskSpread = [];
        for (let i = 0; i < this.exchangeData.length; i++) {
            const index = (i !== this.exchangeData.length - 1) ? ((i > 0) ? (i - 1) : 1) : 0;
            if (this.rate) {
                const bidFeeExchange = this.rate.find(exchBid => exchBid.exchangeName === this.exchangeData[i].exchange).makerFee;
                const askFeeExchange = this.rate.find(exchAsk => exchAsk.exchangeName === this.exchangeData[index].exchange).makerFee;
                const coeffBidFee = 1 - bidFeeExchange / 100;
                const coeffAskFee = 1 + askFeeExchange / 100;
                const totalSumSell = this.exchangeData[index].bids[0][0] * coeffBidFee;
                const totalSumBuy = this.exchangeData[index].asks[0][0] * coeffAskFee;
                const currentExchangeBidAskSpread = {
                    firstSircleExchanges: `${this.exchangeData[i].exchange}-bid/${this.exchangeData[index].exchange}-ask`,
                    firstPair: `${this.exchangeData[i].pair}/${this.exchangeData[index].pair}`,
                    firstSpread: (this.exchangeData[i].bids[0][0] * coeffBidFee - this.exchangeData[index].asks[0][0] * coeffAskFee)
                        / this.exchangeData[index].asks[0][0] * coeffAskFee,
                    secondSircleExchanges: `${this.exchangeData[i].exchange}-ask/${this.exchangeData[index].exchange}-bid`,
                    secondPair: `${this.exchangeData[i].pair}/${this.exchangeData[index].pair}`,
                    secondSpread: (totalSumSell - totalSumBuy)
                        / ((totalSumSell > totalSumBuy) ? totalSumBuy : totalSumSell)
                };
                bidAskSpread.push(currentExchangeBidAskSpread);
            }
        }
        return { bidAsk: bidAskSpread };
    }

    getCurrentFiatPrice(): ExchangeData[] {
        return this.exchangeData.map(data => ({
            exchange: data.exchange, pair: data.pair, bids: this.fromUsdToFiatPrice(data.pair, data.bids), bidVolumes: data.bids[0][1],
            asks: this.fromUsdToFiatPrice(data.pair, data.asks), askVolumes: data.asks[0][1],
            spread: ((data.asks[0][0] / data.bids[0][0]) - 1) * 100, currentStatus: data.currentStatus,
            status: data.currentStatus > (Date.now() - SERVER_CONFIG.timeAgoArbitrage), host: data.host, port: data.port, time: Date.now().toString(),
        }));
    }

    /*    defineCurrentForexPair(cryptoPair: string) {
        return this.getNameFiatForex(cryptoPair);
    } */

    getCurrentPriceExchange(exchange: string, pair: string, typeTrade: string) {
        const exchangeItem = this.getCurrentFiatPrice().filter((exchangeData: ExchangeData) => {
            if (exchangeData.exchange === exchange && exchangeData.pair === pair) {
                return exchangeData;
            }
        });
        if (exchangeItem[0] && typeTrade === 'sell') {
            return exchangeItem[0].bids[0][0];
        }
        if (exchangeItem[0] && typeTrade === 'buy') {
            return exchangeItem[0].asks[0][0];
        }
    }

    changeSendStatusInPartialOrder(arbitId: string, typeOrder: string) {
        for (const partial of this.stateTrading) {
            if (partial.arbitrageId === arbitId && partial.typeOrder === typeOrder) {
                partial.sendOrder = true;
            }
        }
    }

    makePartialOrder(partialTrade: any): any {
        const partialOrder: any[] = [];
        let tradeVolume: number;
        //  console.log('651partialTrade.arbitrageId :', partialTrade.arbitrageId);
        // console.log('652object :', this.stateTrading);
        const partialStartOrder = this.stateTrading.find((currentTrade) => {
            return currentTrade.arbitrageId === partialTrade.arbitrageId && currentTrade.typeOrder === partialTrade.typeOrder;
        });

        let nextTrade: any = {};
        // console.log('partialStartOrder :', partialStartOrder);
        if (partialStartOrder && !partialStartOrder.sendOrder) {
            this.changeSendStatusInPartialOrder(partialTrade.arbitrageId, partialTrade.typeOrder);
            console.log(' =========come trade  :', partialTrade.arbitrageId, partialStartOrder.sendOrder);
            for (const trade of this.stateTrading) {
                if (trade.arbitrageId === partialTrade.arbitrageId && trade.typeOrder !== partialTrade.typeOrder
                ) {
                    tradeVolume = (trade.remainingSize - partialStartOrder.remainingSize);
                    nextTrade.exchange = trade.exchange;
                    nextTrade = trade;
                    nextTrade.origSize = trade.origSize;
                    nextTrade.typeOrder = (partialTrade.typeOrder === 'sell') ? 'buy' : 'sell';
                    nextTrade.size = (
                        (trade.remainingSize - partialStartOrder.remainingSize) > 0) ?
                        trade.remainingSize - partialStartOrder.remainingSize :
                        trade.remainingSize;
                    nextTrade.remainingSize = trade.remainingSize;
                }
            }
            // console.log('673partialOrder.push(order):');
            // console.log('nextTrade.size :', nextTrade.size);
        }

        if (nextTrade && nextTrade.size > 0) {
            const order = {
                pair: nextTrade.pair,
                exchange: nextTrade.exchange,
                price: this.getCurrentPriceExchange(nextTrade.exchange, nextTrade.pair, nextTrade.typeOrder),
                volume: nextTrade.volume,
                size: nextTrade.size,
                origSize: nextTrade.origSize,
                remainingSize: nextTrade.remainingSize,
                typeOrder: nextTrade.typeOrder,
                deviationPrice: +SERVER_CONFIG.deviationPrice,
                fee: +SERVER_CONFIG.fee,
                host: nextTrade.host,
                port: nextTrade.port,
                arbitrageId: partialTrade.arbitrageId,
                time: Date.now().toString(),
                statusOrder: 'open'
            };
            partialOrder.push(order);
            // console.log('720partialOrder.push(order):', order);
            return partialOrder;
        } else {
            const exchangeData = this.getCurrentFiatPrice();
            /*  console.log('724this.defineSellBuy(exchangeData) : removeCheckerSentOrders');
            this.removeCheckerSentOrders(partialTrade.arbitrageId); */
            // this.arbitrageBalanceService.closeSecondCircleStatus(partialTrade.arbitrageId);
            console.log('+++++  change statusSecond Sircle:', partialTrade.arbitrageId, '= true');
            // this.changeStatusSecondOrders(partialTrade.arbitrageId);
            // this.removeCheckerSentOrders(partialTrade.arbitrageId);
            console.log('makePartialOrder call defineSellBuy');
            return this.defineSellBuy(exchangeData);
        }
    }

    definePriceByForex(pair: string, price: number) {
        return (pair !== undefined) ? (pair === 'USDJPY') ?
            price * +fiatPrices[pair][0] :
            price / +fiatPrices[pair][0] :
            price;
    }

    // здесь нужно вызывать getMatrix  потом определять разницу цен внутри матрицы
    async defineSellBuy(result: ExchangeData[]) {
        let ordersBot: Order[];
        let maxBuyPrise: number;
        let minSellPrise: number;
        let rateSeller: number;
        let rateBuyer: number;
        if (result.length) {
            maxBuyPrise = this.getMinAsk(result);
            minSellPrise = this.getMaxBid(result);
        }
        if (maxBuyPrise !== Infinity || minSellPrise !== -Infinity) {
            const sellExchange = result.find((data: any) => {
                if (data.bids.length) {
                    return data.bids[0][0] === minSellPrise;
                } else {
                    return data.bids === minSellPrise;
                }
            });
            const buyExchange = result.find((data: any) => {
                if (data.asks.length) {
                    return data.asks[0][0] === maxBuyPrise;
                } else {
                    return data.asks === maxBuyPrise;
                }
            });
            if (sellExchange && buyExchange) {
                const rateS = this.rate.find(rate => rate.exchangeName === sellExchange.exchange);
                const rateB = this.rate.find(rate => rate.exchangeName === buyExchange.exchange);
                if (rateS && rateB) {
                    rateSeller = rateS.makerFee;
                    rateBuyer = rateB.takerFee;
                }

                const marketSpread = (
                    (minSellPrise * (1 - rateSeller / 100) - maxBuyPrise * (1 + rateBuyer / 100)) / maxBuyPrise * (1 + rateBuyer / 100)) * 100;
                console.log('marketSpread > +SERVER_CONFIG.percentProfit :', marketSpread, +SERVER_CONFIG.percentProfit);
                // SERVER_CONFIG.percentProfit - это дельта open
                if (marketSpread > +SERVER_CONFIG.percentProfit) {
                    const countAssetSelled: any = await this.tradeService.getAssetFromExchange(sellExchange.exchange, sellExchange.pair, 'sell');
                    const countAssetSellerBuy: any = await this.tradeService.getAssetFromExchange(sellExchange.exchange, sellExchange.pair, 'buy');
                    const countAssetBuyed: any = await this.tradeService.getAssetFromExchange(buyExchange.exchange, buyExchange.pair, 'buy');
                    const countAssetBuyerSell: any = await this.tradeService.getAssetFromExchange(buyExchange.exchange, buyExchange.pair, 'sell');
                    /* console.log('countAssetSelled && countAssetBuyed :', countAssetSelled, countAssetBuyed);
                     console.log('countAssetSellerBuy ,countAssetBuyerSell :', countAssetSellerBuy, countAssetBuyerSell ); */
                    if (countAssetSelled.length && countAssetBuyed.length) {
                        let freeAssetSeller;
                        let freeCurrencySeller;
                        let freeAssetBuyer;
                        let freeCurrency;
                        if (countAssetSellerBuy.length && countAssetBuyerSell.length) {
                            console.log('second sircle :countAssetSellerBuy.length  && countAssetBuyerSell.length');
                            freeAssetSeller = SERVER_CONFIG.startAsset - +countAssetSelled[0].total + +countAssetSellerBuy[0].total;
                            freeCurrencySeller = SERVER_CONFIG.startCurrency +
                                +countAssetSelled[0].totalSumPrice - +countAssetSellerBuy[0].totalSumPrice;
                            freeAssetBuyer = SERVER_CONFIG.startAsset - +countAssetBuyerSell[0].total + +countAssetBuyed[0].total;
                            freeCurrency = SERVER_CONFIG.startCurrency + +countAssetBuyerSell[0].totalSumPrice - +countAssetBuyed[0].totalSumPrice;

                        } else {
                            freeAssetSeller = SERVER_CONFIG.startAsset - +countAssetSelled[0].total;
                            freeCurrencySeller = +countAssetSelled[0].totalSumPrice;
                            freeAssetBuyer = +countAssetBuyed[0].total;
                            freeCurrency = SERVER_CONFIG.startCurrency - +countAssetBuyed[0].totalSumPrice;
                        }
                        const freeAssets = SERVER_CONFIG.startAsset - (+countAssetSelled[0].total);
                        //  !!!!  countAssetBuyed[0].totalSumPrice / countAssetBuyed[0].total честь объём
                        const freeBuyerCurrency = SERVER_CONFIG.startCurrency - (+countAssetBuyed[0].totalSumPrice);
                        /* console.log('countAssetSelled :', freeAssets, Number(SERVER_CONFIG.tradeVolume),
                             freeBuyerCurrency, maxBuyPrise * Number(SERVER_CONFIG.tradeVolume)); */
                        // if (freeAssets > Number(SERVER_CONFIG.tradeVolume) &&
                        // freeBuyerCurrency > maxBuyPrise * Number(SERVER_CONFIG.tradeVolume)) {
                        if (freeAssetSeller > Number(SERVER_CONFIG.tradeVolume) && freeCurrency > maxBuyPrise * Number(SERVER_CONFIG.tradeVolume)) {
                            const buyForexPair: string = this.getNameFiatForex(buyExchange.pair);
                            const buyPrice = this.definePriceByForex(buyForexPair, maxBuyPrise);
                            const sellForexPair = this.getNameFiatForex(sellExchange.pair);
                            const sellPrice = this.definePriceByForex(sellForexPair, minSellPrise);
                            const arbitrageUnicId = UUID.UUID();

                            this.arbitrageBalanceService.createWithID(arbitrageUnicId);

                            const sellerOrder: any = {
                                pair: sellExchange.pair,
                                exchange: sellExchange.exchange,
                                price: sellPrice,
                                volume: Number(SERVER_CONFIG.tradeVolume),
                                size: Number(SERVER_CONFIG.tradeVolume),
                                origSize: Number(SERVER_CONFIG.tradeVolume),
                                remainingSize: Number(SERVER_CONFIG.tradeVolume),
                                typeOrder: 'sell',
                                fee: +SERVER_CONFIG.fee,
                                deviationPrice: +SERVER_CONFIG.deviationPrice,
                                host: sellExchange.host,
                                port: sellExchange.port,
                                arbitrageId: arbitrageUnicId,
                                time: Date.now().toString(),
                                statusOrder: 'open'
                            };
                            const buyerOrder: any = {
                                pair: buyExchange.pair,
                                exchange: buyExchange.exchange,
                                price: buyPrice,
                                volume: Number(SERVER_CONFIG.tradeVolume),
                                size: Number(SERVER_CONFIG.tradeVolume),
                                origSize: Number(SERVER_CONFIG.tradeVolume),
                                remainingSize: Number(SERVER_CONFIG.tradeVolume),
                                typeOrder: 'buy',
                                fee: +SERVER_CONFIG.fee,
                                deviationPrice: +SERVER_CONFIG.deviationPrice,
                                host: buyExchange.host,
                                port: buyExchange.port,
                                arbitrageId: arbitrageUnicId,
                                time: Date.now().toString(),
                                statusOrder: 'open'
                            };
                            return ordersBot = await this.setOrdersForTrade(sellerOrder, buyerOrder, sellExchange, marketSpread, buyExchange);
                            // console.log('ordersBot :', ordersBot);
                        } else {
                            console.log('free assets for sale', freeAssets, 'free buyer currency', freeBuyerCurrency);
                            return null;
                        }
                    }
                    // если не было еще сделок
                    else {
                        const buyForexPair: string = this.getNameFiatForex(buyExchange.pair);
                        const buyPrice = this.definePriceByForex(buyForexPair, maxBuyPrise);
                        const sellForexPair = this.getNameFiatForex(sellExchange.pair);
                        const sellPrice = this.definePriceByForex(sellForexPair, minSellPrise);
                        const arbitrageUnicId = UUID.UUID();

                        this.arbitrageBalanceService.createWithID(arbitrageUnicId);

                        const sellerOrder: any = {
                            pair: sellExchange.pair,
                            exchange: sellExchange.exchange,
                            price: sellPrice,
                            volume: Number(SERVER_CONFIG.tradeVolume),
                            size: Number(SERVER_CONFIG.tradeVolume),
                            origSize: Number(SERVER_CONFIG.tradeVolume),
                            remainingSize: Number(SERVER_CONFIG.tradeVolume),
                            typeOrder: 'sell',
                            fee: +SERVER_CONFIG.fee,
                            deviationPrice: +SERVER_CONFIG.deviationPrice,
                            host: sellExchange.host,
                            port: sellExchange.port,
                            arbitrageId: arbitrageUnicId,
                            time: Date.now().toString(),
                            statusOrder: 'open'
                        };
                        const buyerOrder: any = {
                            pair: buyExchange.pair,
                            exchange: buyExchange.exchange,
                            price: buyPrice,
                            volume: Number(SERVER_CONFIG.tradeVolume),
                            size: Number(SERVER_CONFIG.tradeVolume),
                            origSize: Number(SERVER_CONFIG.tradeVolume),
                            remainingSize: Number(SERVER_CONFIG.tradeVolume),
                            typeOrder: 'buy',
                            fee: +SERVER_CONFIG.fee,
                            deviationPrice: +SERVER_CONFIG.deviationPrice,
                            host: buyExchange.host,
                            port: buyExchange.port,
                            arbitrageId: arbitrageUnicId,
                            time: Date.now().toString(),
                            statusOrder: 'open'
                        };
                        console.log(' @@############ first order :');
                        return ordersBot = await this.setOrdersForTrade(sellerOrder, buyerOrder, sellExchange, marketSpread, buyExchange);
                    }
                }
            }
        }
        /*  if (!ordersBot){
             console.log('849defineSellBuy:' );
             await this.defineSellBuy(result);
         } */
        return await ordersBot;
    }

    private setOrdersForTrade(
        sellerOrder: Order, buyerOrder: Order,
        sellExchange: any, marketSpread: number, buyExchange: any): Order[] {
        const ordersBot: Order[] = [];
        // console.log('**********sellerOrder && buyerOrder :', sellerOrder, 'buyerOrder', buyerOrder);
        if (sellerOrder && buyerOrder) {
            this.setStatusTrade(sellerOrder);
            this.setStatusTrade(buyerOrder);
        }
        ordersBot.push(sellerOrder);
        // console.log(`pair ${sellExchange.pair} sell: ${sellerOrder.exchange} ${sellerOrder.price}
        // spread: ${marketSpread}%`);

        return ordersBot;
    }
    parseTrades(newTrades: any): Trade[] {
        const trades: Trade[] = [];
        const tradedOrders = newTrades.payload.params[0];
        const host = newTrades.payload.params[1];
        const port = newTrades.payload.params[2];
        if (tradedOrders) {
            for (const trade of tradedOrders) {
                trades.push(trade);
            }
        }
        return trades;
    }

    getMaxBid(arr: any) {
        let len = arr.length, max = -Infinity;
        while (len--) {
            if (arr[len].bids.length) {
                if (Number(arr[len].bids[0][0]) > max) {
                    max = Number(arr[len].bids[0][0]);
                }
            } else {
                if (Number(arr[len].bids) > max) {
                    max = Number(arr[len].bids);
                }
            }

        }
        return max;
    }

    getMinAsk(arr: any) {
        let len = arr.length, min = Infinity;
        while (len--) {
            if (arr[len].asks.length) {
                if (Number(arr[len].asks[0][0]) < min) {
                    min = Number(arr[len].asks[0][0]);
                }
            } else {
                if (Number(arr[len].asks) < min) {
                    min = Number(arr[len].asks);
                }
            }

        }
        return min;
    }
}
