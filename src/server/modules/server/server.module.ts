

import { ServerTcpController } from './server.controller';
import { OrderBookSchema } from './../db/orderBook/shemas/orderBook.shema';
import { OrderBookService } from './../db/orderBook/orderBook.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderService } from './../db/order/order.service';
import { OrderSchema } from './../db/order/shemas/order.shema';
import { TradeService } from './../db/trade/trade.service';
import { TradeSchema } from './../db/trade/shemas/trade.shema';
import { ExchangeSchema } from '../db/exchange/shemas/exchange.shema';
import { ExchangeService } from '../db/exchange/exchange.service';
import { ArbitrageBalanceSchema } from '../db/arbit-balance/shemas/arbit-balance.shema';
import { ArbitrageBalanceService } from '../db/arbit-balance/arbit-balance.service';
import { MatrixService } from './../db/matrix/matrix.service';
import { MatrixSchema } from './../db/matrix/shemas/matrix.shema';
import { Order5BookService } from '../db/orderBook_5/orderBook_5.service';

@Module({
  imports: [MongooseModule.forFeature([
    { name: 'OrderBook', schema: OrderBookSchema },
    { name: 'Order', schema: OrderSchema },
    { name: 'Trade', schema: TradeSchema },
    { name: 'Exchange', schema: ExchangeSchema },
    { name: 'ArbitrageBalance', schema: ArbitrageBalanceSchema },
    { name: 'Matrix', schema: MatrixSchema },
    { name: 'Order5Book', schema: OrderBookSchema },
  ])],
  controllers: [ServerTcpController],
  providers: [OrderBookService, OrderService, TradeService, ExchangeService,
     ArbitrageBalanceService, MatrixService, Order5BookService],
})
export class ServerTcpModule { }
