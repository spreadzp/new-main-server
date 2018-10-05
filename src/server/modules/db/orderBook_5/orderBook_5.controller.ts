import { Controller, Get, Post, Body, Param, HttpStatus, Res, Request } from '@nestjs/common';
import { Order5BookService } from './orderBook_5.service';
import { OrderBook } from '../../common/models/orderBook';
import { OrderBookDto } from './../orderBook/dto/orderBook.dto';

@Controller('order5Books')
export class OrderBookController {
  constructor(private readonly orderBooksService: Order5BookService) {}

  @Post('create')
  async create(@Body() orderBookDto: OrderBookDto) {
    console.log('create root! :');
    this.orderBooksService.create(orderBookDto);
  }

  @Get('all')
  async findAll(): Promise<OrderBook[]> {
    const orderBooks = await this.orderBooksService.findAll();
    return orderBooks;
  }

  @Get('order-books/')
  async getOrderBookByPeriod(@Request() req: any): Promise<OrderBook[]> {
    // console.log('req.query.skip', req.query.skip);
    const orderBooks = await this.orderBooksService.getOrderBookByPeriod(
      req.query.startDate, req.query.endDate, req.query.asset, +req.query.skip);
    return orderBooks;
  }

  @Get('ob-period/')
  async getOrderBookByStamp(@Request() req: any): Promise<OrderBook[]> {
    const orderBooks = await this.orderBooksService.getOrderBookByStamp(
      req.query.startDate, req.query.endDate, req.query.asset);
    return orderBooks;
  }

  @Get('count/')
  async getCountOrderBookByPeriod(@Request() req: any): Promise<number> {
    // console.log('req.query.skip', req.query.skip);
    const orderBooks = await this.orderBooksService.getCountItems(
      req.query.startDate, req.query.endDate, req.query.asset);
    return orderBooks;
  }

  @Post('save')
  async saveNew(data: OrderBook)  {
    const orderBooks = await this.orderBooksService.addNewData(data);
  }

  @Get('**')
  notFoundPage(@Res() res: any) {
    res.redirect('/');
  }
}