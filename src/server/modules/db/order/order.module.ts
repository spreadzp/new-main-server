import { Module } from '@nestjs/common';
import { ordersProviders } from './order.providers';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { DatabaseModule } from './../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [OrderController],
  providers: [OrderService, ...ordersProviders],
})
export class OrderModule { }
