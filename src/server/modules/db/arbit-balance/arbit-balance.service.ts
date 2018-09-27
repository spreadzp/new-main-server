import { ArbitrageBalanceDto } from './dto/arbit-balance.dto';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ARBITRAGE_BALANCE_MODEL_TOKEN } from './../../../server.constants';
import { ArbitrageBalance } from '../../common/models/arbitrageBalance';
import { TradeService } from '../trade/trade.service';
import { PureTrade } from '../../common/models/pureTrade';
import { CircleArbitrage } from '../../common/models/circleArbitrage';

@Injectable()
export class ArbitrageBalanceService {
  constructor(
    @InjectModel(ARBITRAGE_BALANCE_MODEL_TOKEN) private readonly arbitrageBalanceModel: Model<ArbitrageBalance>
  ) { }

  async create(createArbitrageBalanceDto: ArbitrageBalanceDto) {
    const createdArbitrageBalance = new this.arbitrageBalanceModel(createArbitrageBalanceDto);
    return await createdArbitrageBalance.save();
  }
  async createWithID(UUID: String) {
    const createdArbitrageBalance = new this.arbitrageBalanceModel({
      arbitrageId: UUID
    });
    return await createdArbitrageBalance.save();
  }

  async addNewData(data: ArbitrageBalance) {
    const createdArbitrageBalance = new this.arbitrageBalanceModel(data);
    await createdArbitrageBalance.save();
  }

  async deleteArbitrageBalance(data: ArbitrageBalance) {
    const arbitrageBalance = await new this.arbitrageBalanceModel(data);
    await arbitrageBalance.remove();
  }

  async getIdNotClocedArbitOrders(secondStatus: boolean) {
    return await this.arbitrageBalanceModel.find({ closeSecondCickle: secondStatus },
      { _id: 0, arbitrageId: 1 });
  }
  async findAll() {
    return await this.arbitrageBalanceModel.find().exec();
  }

  /* async closeSecondCircleBuy(trade: PureTrade, arbitId: string) {
    return await this.arbitrageBalanceModel.findOneAndUpdate({ arbitrageId: arbitId },
      { $push: { secondCickleBuy: trade } });
  } */

  async openFirstCircle(trade: PureTrade, arbitId: string) {
    const options = {
      [trade.typeOrder === 'sell' ? 'firstCickleSell' : 'firstCickleBuy']: trade
    };
    return await this.arbitrageBalanceModel.findOneAndUpdate({ arbitrageId: arbitId },
      options, { upsert: true, new: true });
  }

  async closeSecondCircleOrders(trade: PureTrade, arbitId: string) {
    const options = {
      [trade.typeOrder === 'sell' ? 'secondCickleSell' : 'secondCickleBuy']: trade
    };
    return await this.arbitrageBalanceModel.findOneAndUpdate({ arbitrageId: arbitId },
      { $push: options});
  }

  async closeSecondCircleStatus(arbitId: string) {
    return await this.arbitrageBalanceModel.findOneAndUpdate({ arbitrageId: arbitId },
      { closeSecondCickle: true});
  }

  async addNewTrade(trade: PureTrade, arbitId: string) {
    if (trade) {
      const arbitrageBook: { [key: string]: any } = await this.arbitrageBalanceModel.findOne({ arbitrageId: arbitId }).exec();
      const propertyFirst = trade.typeOrder === 'sell' ? 'firstCickleSell' : 'firstCickleBuy';
      if (JSON.stringify(arbitrageBook[propertyFirst]) === '{}') {
        this.openFirstCircle(trade, arbitId);
      } else {
        this.closeSecondCircleOrders(trade, arbitId);
      }
    }
  }

  async getActiveTrades() {
    const arbitrageBook: any = await this.arbitrageBalanceModel.find({ closeSecondCickle: false }).exec();
   //  console.log('arbitrageBook :', arbitrageBook);
    return arbitrageBook;
  }

  async findArbitrageById(arbitId: string) {
    return await this.arbitrageBalanceModel.findOne({ arbitrageId: arbitId },
      {
        _id: 0, arbitrageId: 1, firstCickleBuy: 1, firstCickleSell: 1, secondCickleBuy: 1, secondCickleSell: 1,
        closeSecondCickle: 1,
      }).exec();
  }
}
