import { Model } from 'mongoose';
import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserDto } from './dto/user.dto';
import { User } from '../../common/models/user';
import { TRADE_MODEL_TOKEN } from './../../../server.constants';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(TRADE_MODEL_TOKEN) private readonly userModel: Model<User>
  ) { }

  async create(createUserDto: UserDto) {
    const createdUser = new this.userModel(createUserDto);
    return await createdUser.save();
  }

  async getUserById(id: any) {
    return await this.userModel.find({ _id: id },{}).exec();
  }

}
