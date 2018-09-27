import { Module } from '@nestjs/common';
import { MatrixProviders } from './matrix.providers';
import { MatrixController } from './matrix.controller';
import { MatrixService } from './matrix.service';
import { DatabaseModule } from './../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [MatrixController],
  providers: [MatrixService, ...MatrixProviders],
})
export class MatrixModule { }
