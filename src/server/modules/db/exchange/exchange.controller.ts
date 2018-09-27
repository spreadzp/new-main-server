import { Controller, Get, Post, Body, Param, HttpStatus, Res, Request, Delete } from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import { Exchange } from '../../common/models/exchange';
import { ExchangeDto } from './dto/exchange.dto';

@Controller('rates')
export class ExchangeController {
  constructor(private readonly exchangeService: ExchangeService) {}

  @Post('create')
  async create(@Body() exchangeDto: ExchangeDto) {
    console.log('create root! :');
    this.exchangeService.create(exchangeDto);
  }

  @Get('all')
  async findAll(): Promise<Exchange[]> {
    const exchanges = await this.exchangeService.findAll();
    return exchanges;
  }

  @Get('rate-exchange')
  async getExchange(@Request() req: any): Promise<number> {
    console.log('req.query.exchange, req.query.typeRate :', req.query.exchange, req.query.typeRate);
    const exchange = await this.exchangeService.getRateFromExchange(req.query.exchange, req.query.typeRate);
    return exchange;
  }

  @Post('save')
  async saveNewExchange(@Body() data: Exchange)  {
    const exchanges = await this.exchangeService.addNewData(data);
  }

  @Post('delete')
  async deleteExchange(@Body() data: Exchange)  {
    console.log('data :', data);
    await this.exchangeService.deleteExchange(data);
  }

  @Get('**')
  notFoundPage(@Res() res: any) {
    res.redirect('/');
  }
}