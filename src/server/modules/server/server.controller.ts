import { OrderBookService } from './../db/orderBook/orderBook.service';
import { ExchangeService } from './../db/exchange/exchange.service';
import { MatrixService } from './../db/matrix/matrix.service';
import { ServerTcpBot } from './server-tcp';
import { Controller, Get, Post, Body, Param, HttpStatus, Res, Request } from '@nestjs/common';
import { OrderService } from './../db/order/order.service';
import { TradeService } from './../db/trade/trade.service';
import { ArbitrageService } from '../db/arbitrage/arbitrage.service';
import { ArbitrageBalanceService } from '../db/arbit-balance/arbit-balance.service';

@Controller('sever-tcp')
export class ServerTcpController {
    serverTcp: ServerTcpBot;

    constructor(
        private readonly orderBooksService: OrderBookService,
        private readonly orderService: OrderService,
        private readonly tradeService: TradeService,
        private readonly exchangeService: ExchangeService,
        private readonly arbitrageBalanceService: ArbitrageBalanceService,
        private readonly matrixService: MatrixService
    ) {
        this.serverTcp = new ServerTcpBot(
            this.orderBooksService, this.orderService, this.tradeService,
             this.exchangeService, this.arbitrageBalanceService, this.matrixService);
    }

    @Get('start-server')
    startTcpServer() {
        this.serverTcp.createTcpServer();
    }

    @Get('start-arbitrage')
    startArbitrage() {
        this.serverTcp.startArbitrage();
    }

    @Get('stop-server')
    stopTcpServer() {
        this.serverTcp.stopTcpServer();
    }

    @Get('stop-arbitrage')
    stopArbitrage() {
        this.serverTcp.stopArbitrage();
    }

    @Get('current-price')
    currentPrices(@Res() res: any) {
        const currentPrice = this.serverTcp.getCurrentPrice();
        res.status(HttpStatus.OK).json(currentPrice);
    }

    @Get('exchange-price')
    lastExchangePrice(@Request() req: any) {
        const currentPrice = this.serverTcp.getExchangePrice(req.query.exchange, req.query.pair, req.query.typeOrder);
        console.log('currentPrice :', currentPrice);
        return currentPrice;
    }

    @Get('current-spread')
    currentSpread(@Res() res: any) {
        const currentSpread = this.serverTcp.getSpread();
        res.status(HttpStatus.OK).json(currentSpread);
    }

    @Get('close-second-arbitrage')
    async closeSecondArbitrage(@Request() req: any) {
        const currentArbitrage = await this.serverTcp.getFirstTradeArbitrage(req.query.id);
        if (currentArbitrage.length) {
            this.serverTcp.closeSecondArbitrage(currentArbitrage, req.query.id);
        }
    }

    @Get('current-arbitrages')
    async getCurrentArbitrage() {
        const currentArbitrages = await this.serverTcp.getCurrentArbitrage();
        return currentArbitrages;
    }
}
