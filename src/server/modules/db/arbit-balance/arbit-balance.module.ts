import { TradeSchema } from './../trade/shemas/trade.shema';
import { Module } from '@nestjs/common';
import { arbitrageBalancesProviders } from './arbit-balance.providers';
import { ArbitrageBalanceController } from './arbit-balance.controller';
import { ArbitrageBalanceService } from './arbit-balance.service';
import { DatabaseModule } from './../../database/database.module';
import { TradeService } from '../trade/trade.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ArbitrageBalanceSchema } from './shemas/arbit-balance.shema';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([
    { name: 'Trade', schema: TradeSchema },
    { name: 'ArbitrageBalance', schema: ArbitrageBalanceSchema }
  ])],
  controllers: [ArbitrageBalanceController],
  providers: [TradeService, ArbitrageBalanceService, ...arbitrageBalancesProviders],
})
export class ArbitrageBalanceModule { }
