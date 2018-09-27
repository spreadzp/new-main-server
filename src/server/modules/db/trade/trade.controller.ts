import { Controller, Get, Post, Body, Res, Request, Inject } from '@nestjs/common';
import { TradeService } from './trade.service';
import { Trade } from '../../common/models/trade';
import { TradeDto } from './dto/trade.dto';
import { ExchangeService } from '../exchange/exchange.service';
import { PureTrade } from '../../common/models/pureTrade';

@Controller('trades')
export class TradeController {
    constructor(
        private readonly tradesService: TradeService,
        private readonly exchangeService: ExchangeService
    ) { }

    @Post('create')
    async create(@Body() tradeDto: TradeDto) {
        console.log('create root! :');
        this.tradesService.create(tradeDto);
    }

   /*  @Get('all')
    async findAll(): Promise<Trade[]> {
        const trades = await this.tradesService.findAll();
        return trades;
    } */

    @Get('find/')
    async getTradeByPeriod(@Request() req: any): Promise<Trade[]> {
        const trades = await this.tradesService.getTradeByPeriod(req.query.startDate, req.query.endDate, req.query.asset);
        return trades;
    }

    @Get('statistic/')
    async getStatistic(@Request() req: any): Promise<any[]> {
        const trades = await this.tradesService.getTradeStatisticByPeriod (
            req.query.startDate, req.query.endDate, req.query.asset, req.query.typeOrder);
        return trades;
    }

    @Get('find-by-id/')
    async getTradesById(@Request() req: any): Promise<any[]> {
        const trades = await this.tradesService.getTradesById (req.query.id);
        console.log('trades :', trades);
        return trades;
    }

    @Get('convert-pure-trade/')
    async convertPureTrade(@Request() req: any): Promise<PureTrade> {
        const trades = await this.tradesService.convertToPureTrade (req.query.id, req.query.rates);
        console.log('trades :', trades);
        return trades;
    }

    @Post('save')
    async saveNew(@Body() data: Trade) {
        const trade = await this.tradesService.addNewData(data);
    }

    @Get('**')
    notFoundPage(@Res() res: any) {
        res.redirect('/');
    }
}