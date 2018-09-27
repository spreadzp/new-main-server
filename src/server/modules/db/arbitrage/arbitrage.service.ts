import { ArbitrageDto } from './dto/arbitrage.dto';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ARBITRAGE_MODEL_TOKEN} from './../../../server.constants';
import { Arbitrage } from '../../common/models/arbitrage';
import { TradeService } from '../trade/trade.service';

@Injectable()
export class ArbitrageService {
  constructor(
    @InjectModel(ARBITRAGE_MODEL_TOKEN) private readonly arbitrageModel: Model<Arbitrage>
  ) {}

  async create(createArbitrageDto: ArbitrageDto) {
    const createdArbitrage = new this.arbitrageModel(createArbitrageDto);
    return await createdArbitrage.save();
  }

  async addNewData(data: Arbitrage) {
    const createdArbitrage = new this.arbitrageModel(data);
    await createdArbitrage.save();
  }

  async deleteArbitrage(data: Arbitrage) {
    const arbitrage = await new this.arbitrageModel(data);
    await arbitrage.remove();
  }

  async getIdNotClocedArbitOrders(secondStatus: boolean) {
    return await this.arbitrageModel.find({closeSecondCickle: secondStatus},
    {_id: 0, arbitrageId: 1});
  }
  async findAll() {
    return await this.arbitrageModel.find().exec();
  }
}
