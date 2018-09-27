import { MongooseModule } from '@nestjs/mongoose';
import { TradeModule } from './modules/db/trade/trade.module';
import { OrderModule } from './modules/db/order/order.module';
import { ServerTcpModule } from './modules/server/server.module';
import { OrderBookModule } from './modules/db/orderBook/orderBook.module';
import { ExchangeModule } from './modules/db/exchange/exchange.module';
import { MatrixModule } from './modules/db/matrix/matrix.module';
// nest
import { Module } from '@nestjs/common';

// modules
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './modules/database/database.module';
import { UserModule } from './modules/user/user.module';
import { ArbitrageModule } from './modules/db/arbitrage/arbitrage.module';
import { ArbitrageBalanceModule } from './modules/db/arbit-balance/arbit-balance.module';
import { AngularUniversalModule } from './modules/angular-universal/angular-universal.module';
import { GraphqlModule } from './modules/graphql/graphql.module';
import { SERVER_CONFIG } from './server.constants';

@Module({
  imports: [
    MatrixModule,
    ExchangeModule,
    OrderBookModule,
    OrderModule,
    AuthModule,
    UserModule,
    ArbitrageModule,
    ArbitrageBalanceModule,
    TradeModule,
    ServerTcpModule,
    // GraphqlModule,
    MongooseModule.forRoot(SERVER_CONFIG.db),
    DatabaseModule,
    AngularUniversalModule.forRoot()
  ],
  controllers: [],
  providers: [],
})
export class ApplicationModule { }
