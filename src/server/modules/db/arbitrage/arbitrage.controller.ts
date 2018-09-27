import { Trade } from './../../common/models/trade';
import { Controller, Get, Post, Body, Param, HttpStatus, Res, Request, Delete } from '@nestjs/common';
import { ArbitrageService } from './arbitrage.service';
import { Arbitrage } from '../../common/models/arbitrage';
import { ArbitrageDto } from './dto/arbitrage.dto';
import { TradeService } from '../trade/trade.service';

@Controller('arbitrages')
export class ArbitrageController {
  constructor(
    private readonly arbitrageService: ArbitrageService,
    private readonly tradeService: TradeService
  ) { }

  @Post('create')
  async create(@Body() arbitrageDto: ArbitrageDto) {
    console.log('create root! :');
    this.arbitrageService.create(arbitrageDto);
  }

  @Get('all')
  async findAll(): Promise<Arbitrage[]> {
    console.log('findAll(): Promise<Arbitrage[] :');
    const arbitrages = await this.arbitrageService.findAll();
    return arbitrages;
  }

  @Post('save')
  async saveNewArbitrage(@Body() data: Arbitrage) {
    const arbitrages = await this.arbitrageService.addNewData(data);
  }

  @Get('noclosed')
  async getNotClocedArbitOrders(@Request() req: any): Promise<Trade[]> {
    const tmpArbitOrders = await this.arbitrageService.getIdNotClocedArbitOrders(
      req.query.closeSecond);
    const arbitOrders: string[] = [];
    for (const order of tmpArbitOrders) {
      arbitOrders.push(order.arbitrageId);
    }
    const trades = await this.tradeService.getTradesById(arbitOrders);
    return trades;
  }

  @Post('delete')
  async deleteArbitrage(@Body() data: Arbitrage) {
    console.log('data :', data);
    await this.arbitrageService.deleteArbitrage(data);
  }

  @Get('**')
  notFoundPage(@Res() res: any) {
    res.redirect('/');
  }
}
