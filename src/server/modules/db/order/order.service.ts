import { OrderSchema } from './shemas/order.shema';
import { OrderDto } from './dto/order.dto';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './../../common/models/order';
import { ORDER_MODEL_TOKEN} from './../../../server.constants';
import * as mongoose from 'mongoose';

@Injectable()
export class OrderService {
  constructor(@InjectModel(ORDER_MODEL_TOKEN) private readonly orderModel: Model<Order>) { }

  async create(createOrderDto: OrderDto) {
    const createdOrder = new this.orderModel(createOrderDto);
    return await createdOrder.save();
  }

  async addNewOrder(data: Order) {
    const createdOrder = await new this.orderModel(data);
    await createdOrder.save();
  }

  async updateStatusOrder(arbitOrderId: string, typeUpdateOrder: string, exchangeOrderId: string, statusOrder: string, reasonRejected: string) {
    await this.orderModel.updateOne({ arbitrageId: arbitOrderId, typeOrder: typeUpdateOrder }, {
      $set: {
        exchangeId: exchangeOrderId, status: statusOrder, reason: reasonRejected,
      }
    });
  }
  async findOrderByIdExchange(arbitId: string, orderType: string, exch: string) {
    return await this.orderModel.findOne({arbitrageId: arbitId, typeOrder: orderType, exchange: exch});
  }

  async findOrderById(arbitValueId: string, typeOppositeOrder: string): Promise<Order> {
    return await this.orderModel.findOne({arbitrageId: arbitValueId, typeOrder: typeOppositeOrder});
  }

  async getOrderByPeriod(startDate: number, endDate: number, asset: string): Promise<Order[]> {
    return await this.orderModel.find({ time: { $gte: startDate, $lt: endDate }, pair: { $regex: asset, $options: 'm' } },
      {
        _id: 0, exchange: 1, pair: 1, price: 1, size: 1, typeOrder: 1, statusOrder: 1, fee: 1,
        arbitrageId: 1, exchangeId: 1, deviationPrice: 1, time: 1, status: 1, reason: 1
      }).exec();
  }

  async getSameStatusOrder(searchStatus: string, comparedTime: number): Promise<Order[]> {
    return await this.orderModel.find({ status: searchStatus, time: {$lt: comparedTime } },
      {
        _id: 0, exchange: 1, pair: 1, price: 1, size: 1, typeOrder: 1, statusOrder: 1,
        arbitrageId: 1, exchangeId: 1, time: 1, status: 1, host: 1, port: 1
      }).exec();
  }

  async getSameStatusOrders(searchStatus: string, comparedTime: number, typeSendOrder: string): Promise<Order[]> {
    return await this.orderModel.find({ status: searchStatus, time: {$lt: comparedTime }, typeOrder: typeSendOrder},
      {
        _id: 0, exchange: 1, pair: 1, price: 1, size: 1, typeOrder: 1, statusOrder: 1,
        arbitrageId: 1, exchangeId: 1, time: 1, status: 1, host: 1, port: 1
      }).exec();
  }
  async checkOpenOrders(id: string, searchStatus: string, typeSendOrder: string): Promise<number> {
    return await this.orderModel.find({arbitrageId: id, status: searchStatus, typeOrder: typeSendOrder}).count();
  }
}
