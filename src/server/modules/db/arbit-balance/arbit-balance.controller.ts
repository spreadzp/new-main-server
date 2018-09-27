import { Trade } from './../../common/models/trade';
import { Controller, Get, Post, Body, Param, HttpStatus, Res, Request, Delete } from '@nestjs/common';
import { ArbitrageBalanceService } from './arbit-balance.service';
import { ArbitrageBalance } from '../../common/models/arbitrageBalance';
import { ArbitrageBalanceDto } from './dto/arbit-balance.dto';
import { TradeService } from '../trade/trade.service';
import { CircleArbitrage } from '../../common/models/circleArbitrage';

@Controller('arbit-balance')
export class ArbitrageBalanceController {
  constructor(
    private readonly arbitrageBalanceService: ArbitrageBalanceService,
    private readonly tradeService: TradeService
  ) { }

  @Post('create')
  async create(@Body() arbitrageBalanceDto: ArbitrageBalanceDto) {
    console.log('create root! :');
    this.arbitrageBalanceService.create(arbitrageBalanceDto);
  }

  @Post('add-new-trade')
  async addNewTrade(@Body() data: any) {
    if (data.closeTrade && data.arbitId) {
      this.arbitrageBalanceService.addNewTrade(data.closeTrade, data.arbitId);
    }
  }

  @Get('all')
  async findAll(): Promise<ArbitrageBalance[]> {
    const arbitrageBalances = await this.arbitrageBalanceService.findAll();
    return arbitrageBalances;
  }

  @Post('save')
  async saveNewArbitrageBalance(@Body() data: ArbitrageBalance) {
    const arbitrageBalances = await this.arbitrageBalanceService.addNewData(data);
  }

  @Get('noclosed')
  async getNotClocedArbitOrders(@Request() req: any): Promise<Trade[]> {
    const tmpArbitOrders = await this.arbitrageBalanceService.getIdNotClocedArbitOrders(
      req.query.closeSecond);
    const arbitOrders: string[] = [];
    for (const order of tmpArbitOrders) {
      arbitOrders.push(order.arbitrageId);
    }
    const trades = await this.tradeService.getTradesById(arbitOrders);
    return trades;
  }

  @Post('delete')
  async deleteArbitrageBalance(@Body() data: ArbitrageBalance) {
    console.log('data :', data);
    await this.arbitrageBalanceService.deleteArbitrageBalance(data);
  }

  @Get('**')
  notFoundPage(@Res() res: any) {
    res.redirect('/');
  }
}
