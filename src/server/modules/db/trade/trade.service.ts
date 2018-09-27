import { Exchange } from '../../common/models/exchange';
import { Model } from 'mongoose';
import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TradeDto } from './dto/trade.dto';
import { Trade } from '../../common/models/trade';
import { TRADE_MODEL_TOKEN } from './../../../server.constants';
import { PureTrade } from '../../common/models/pureTrade';

@Injectable()
export class TradeService {
  constructor(
    @InjectModel(TRADE_MODEL_TOKEN) private readonly tradeModel: Model<Trade>
  ) { }

  async create(createTradeDto: TradeDto) {
    const createdTrade = new this.tradeModel(createTradeDto);
    return await createdTrade.save();
  }

  async addNewData(data: Trade) {
    const createdTrade = await new this.tradeModel(data);
    await createdTrade.save();
  }

  /*   async findAll(): Promise<Trade[]> {
      return await this.tradeModel.find().exec();
    } */
  async getTradeStatisticByPeriod(startDate: number, endDate: number, asset: string, type: string) {
    return await this.tradeModel.aggregate([{
      $match: { $and: [{ time: { $gte: startDate, $lt: endDate }, pair: { $regex: asset, $options: 'm' }, typeOrder: type }] },
    }, {
      $group: {
        _id: null,
        total: {
          $sum: '$volume'
        }
      }
    }]);
  }

  async getAssetFromExchange(exchangeName: string, asset: string, type: string) {
    return await this.tradeModel.aggregate([{
      $match: { $and: [{ exchange: exchangeName, pair: { $regex: asset, $options: 'm' }, typeOrder: type }] },
    }, {
      $group: {
        _id: null,
        total: {
          $sum: '$volume'
        },
        totalSumPrice: {
          $sum: '$price'
        }
      }
    }]);
  }

  async getTradeByPeriod(startDate: number, endDate: number, asset: string): Promise<Trade[]> {
    return await this.tradeModel.find({ time: { $gte: startDate, $lt: endDate }, pair: { $regex: asset, $options: 'm' } },
      {
        _id: 0, exchange: 1, pair: 1, price: 1, volume: 1, typeOrder: 1, arbitrageId: 1,
        exchOrderId: 1, time: 1,
      }).exec();
  }

  convertToPureTrade(trade: Trade, rate: Exchange[]): PureTrade {
    const rates  = rate.find(rateExc => rateExc.exchangeName === trade.exchange);
    const rateValue = (trade.typeOrder === 'sell') ? (1 - rates.makerFee / 100) : (1 + rates.takerFee / 100);
    const pureTrade: PureTrade = {
    exchange: trade.exchange,
    exchangeId: trade.exchOrderId,
    pair: trade.pair,
    price: trade.price * rateValue,
    size: trade.size,
    typeOrder: trade.typeOrder
    };
    return pureTrade;
  }

  /* convertToPureTrade(trade: Trade, rateService: RateService): PureTrade {
    let pureTrade: PureTrade;
    
     return rateService.findExchange(trade.exchange).then(
      (result)=>{
        if(result)
        {
          const rateValue = (trade.typeOrder == 'sell')? result.makerFee : result.takerFee;
          pureTrade.exchange = trade.exchange;
          pureTrade.exchangeId = trade.exchOrderId;
          pureTrade.pair = trade.pair;
          pureTrade.price = (trade.price * (1  + rateValue) / 100 );
          pureTrade.size = trade.size;
          pureTrade.typeOrder = trade.typeOrder;

          return pureTrade;
        }
      },
      (error)=>{
        console.log('convertToPureTrade => ERROR %j',error);
        return pureTrade;
      },
    )
    
  } */

  async getTradesById(arrayArbitrageId: string[]): Promise<Trade[]> {
    console.log('arrayArbitrageId :', arrayArbitrageId);
    return await this.tradeModel.find({ arbitrageId: { $in: arrayArbitrageId } },
      {
        _id: 0, exchange: 1, pair: 1, price: 1, volume: 1, typeOrder: 1, arbitrageId: 1,
        exchOrderId: 1, time: 1,
      }).exec();
  }
}
