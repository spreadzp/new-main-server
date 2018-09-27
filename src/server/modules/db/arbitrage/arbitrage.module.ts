import { TradeSchema } from './../trade/shemas/trade.shema';
import { Module } from '@nestjs/common';
import { arbitragesProviders } from './arbitrage.providers';
import { ArbitrageController } from './arbitrage.controller';
import { ArbitrageService } from './arbitrage.service';
import { DatabaseModule } from './../../database/database.module';
import { TradeService } from '../trade/trade.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ArbitrageSchema } from './shemas/arbitrage.shema';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([
    { name: 'Trade', schema: TradeSchema },
    { name: 'Arbitrage', schema: ArbitrageSchema }
  ])],
  controllers: [ArbitrageController],
  providers: [TradeService, ArbitrageService, ...arbitragesProviders],
})
export class ArbitrageModule { }
