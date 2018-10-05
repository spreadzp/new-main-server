import { Module } from '@nestjs/common';
import { order5BooksProviders } from './orderBook_5.providers';
import { OrderBookController } from './orderBook_5.controller';
import { Order5BookService } from './orderBook_5.service';
import { DatabaseModule } from './../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [OrderBookController],
  providers: [Order5BookService, ...order5BooksProviders],
})
export class Order5BookModule { }
