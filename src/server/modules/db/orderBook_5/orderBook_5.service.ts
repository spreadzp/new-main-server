import { OrderBookDto } from './../orderBook/dto/orderBook.dto';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { OrderBook } from '../../common/models/orderBook';
import { ORDER_5_BOOK_MODEL_TOKEN } from './../../../server.constants';

@Injectable()
export class Order5BookService {
  constructor(@InjectModel(ORDER_5_BOOK_MODEL_TOKEN) private readonly orderBookModel: Model<OrderBook>) { }

  async create(createOrderBookDto: OrderBookDto) {
    const createdOrderBook = new this.orderBookModel(createOrderBookDto);
    return await createdOrderBook.save();
  }

  async addNewData(data: OrderBook) {
    const createdOrderBook = await new this.orderBookModel(data);
    await createdOrderBook.save();
  }

  async findAll() {
    return await this.orderBookModel.find().exec();
  }

  async getOrderBookByPeriod(startDate: number, endDate: number, asset: string, skip: number) {
    console.log('skip :', skip);
    const response = await this.orderBookModel.find({ time: { $gte: startDate, $lt: endDate }, pair: { $regex: asset, $options: 'm' } },
      { _id: 0, exchangeName: 1, pair: 1, bid: 1, bidVolume: 1, ask: 1, askVolume: 1, time: 1 })
      .skip(skip)
      .limit(40000);
    return response;
  }

  async getOrderBookByPeriod1(startDate: number, endDate: number, asset: string, skip: number) {

    const response = await this.orderBookModel.find({ time: { $gte: startDate, $lt: endDate }, crypto: asset },
      { _id: 0, exchangeName: 1, pair: 1, bid: 1, bidVolume: 1, ask: 1, askVolume: 1, time: 1 }).limit(40000);
    console.log(`response ${skip}`, response.length);
    return response;
  }

  async getOrderBookByStamp(startDate: number, endDate: number, asset: string) {
    console.log('startDate , endDate :', startDate, endDate);
    const response = await this.orderBookModel.find({ time: { $gte: startDate, $lt: endDate } },
      { _id: 0, exchangeName: 1, pair: 1, bid: 1, bidVolume: 1, ask: 1, askVolume: 1, time: 1 });
    console.log('response.length :', response.length);
    return response;
  }

  async getCountItems(startDate: number, endDate: number, asset: string) {
    const count = await this.orderBookModel.find({ time: { $gte: startDate, $lt: endDate }, pair: { $regex: asset, $options: 'm' } },
      { _id: 0, exchangeName: 1, pair: 1, bid: 1, bidVolume: 1, ask: 1, askVolume: 1, time: 1 }).count();
    return count;
  }
  async getLastAsk(exchange: string, tradePair: string) {
    return await this.orderBookModel.findOne({ exchangeName: exchange, pair: tradePair, time: {} },
      { _id: 0, ask: 1 });
  }
  async getLastBid(exchange: string, tradePair: string) {
    return await this.orderBookModel.findOne({ exchangeName: exchange, pair: tradePair, time: {} },
      { _id: 0, bid: 1 });
  }
}
