import { Module } from '@nestjs/common';
import { exchangesProviders } from './exchange.providers';
import { ExchangeController } from './exchange.controller';
import { ExchangeService } from './exchange.service';
import { DatabaseModule } from './../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ExchangeController],
  providers: [ExchangeService, ...exchangesProviders],
})
export class ExchangeModule { }
