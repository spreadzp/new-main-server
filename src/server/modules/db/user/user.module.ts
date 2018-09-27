import { UsersProviders } from './user.providers';
import { UserSchema } from './shemas/user.shema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { DatabaseModule } from './../../database/database.module';
import { ExchangeSchema } from '../exchange/shemas/exchange.shema';
import { ExchangeService } from '../exchange/exchange.service';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Exchange', schema: ExchangeSchema },
    ]),

  ],
  controllers: [UserController],
  providers: [UserService, ExchangeService, ...UsersProviders],
  exports: [UserService],
})
export class UserModule { }
