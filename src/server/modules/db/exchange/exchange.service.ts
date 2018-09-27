import { ExchangeDto } from './dto/exchange.dto';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EXCHANGE_MODEL_TOKEN} from './../../../server.constants';
import { Exchange } from '../../common/models/exchange';

@Injectable()
export class ExchangeService {
  constructor(@InjectModel(EXCHANGE_MODEL_TOKEN) private readonly exchangeModel: Model<Exchange>) {}

  async create(createExchangeDto: ExchangeDto) {
    const createdExchange = new this.exchangeModel(createExchangeDto);
    return await createdExchange.save();
  }

  async addNewData(data: Exchange) {
    const createdExchange = new this.exchangeModel(data);
    await createdExchange.save();
  }

  async deleteExchange(data: Exchange) {
    const exchange = await new this.exchangeModel(data);
    console.log('exchange :', exchange);
    await exchange.remove();
  }

  async getRateFromExchange(exchange: string, typeRate: string) {
    const options = {
      _id: 0,
      [typeRate === 'maker' ? 'makerFee' : 'takerFee']: 1
    };
    const rate =  await this.exchangeModel.findOne({exchangeName: exchange}, options).exec();
    return rate[typeRate === 'maker' ? 'makerFee' : 'takerFee'];
  }

  async findAll() {
    return await this.exchangeModel.find().exec();
  }

  async findExchange(exchName: String) {
    return await this.exchangeModel.findOne({exchangeName: exchName}).exec();
  }
}
