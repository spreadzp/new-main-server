import { tradesProviders } from './trade.providers';
import { TradeSchema } from './shemas/trade.shema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TradeController } from './trade.controller';
import { TradeService } from './trade.service';
import { DatabaseModule } from './../../database/database.module';
import { ExchangeSchema } from '../exchange/shemas/exchange.shema';
import { ExchangeService } from '../exchange/exchange.service';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([
      { name: 'Trade', schema: TradeSchema },
      { name: 'Exchange', schema: ExchangeSchema },
    ]),

  ],
  controllers: [TradeController],
  providers: [TradeService, ExchangeService, ...tradesProviders],
  exports: [TradeService],
})
export class TradeModule { }
