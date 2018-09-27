import { Module } from '@nestjs/common';
import { orderBooksProviders } from './orderBook.providers';
import { OrderBookController } from './orderBook.controller';
import { OrderBookService } from './orderBook.service';
import { DatabaseModule } from './../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [OrderBookController],
  providers: [OrderBookService, ...orderBooksProviders],
})
export class OrderBookModule { }
