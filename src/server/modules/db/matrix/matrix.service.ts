import { MatrixDto } from './dto/matrix.dto';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MATRIX_MODEL_TOKEN } from './../../../server.constants';
import { Matrix } from '../../common/models/matrix';

@Injectable()
export class MatrixService {
  constructor(@InjectModel(MATRIX_MODEL_TOKEN) public readonly MatrixModel: Model<Matrix>) { }

  async create(createMatrixDto: MatrixDto) {
    const createdMatrix = new this.MatrixModel(createMatrixDto);
    return await createdMatrix.save();
  }

  async deleteMatrix(data: Matrix) {
    const Matrix = await new this.MatrixModel(data);
    await Matrix.remove();
  }

 /*  async findAll(query: any){
    return new Promise((resolve, reject) => {
      this.MatrixModel.find(query).exec((err, result: Matrix[]) => {
        if (err)
          return reject(err);
        if (result)
          return resolve(result);
      });
    });
  } */

  async findAll(query: any) {
    return await this.MatrixModel.find(query).exec();
  }

  async setToHistory(id: any) {
    return await this.MatrixModel.update({ _id: id }, { $set: { history: true, active: false } }).exec();
  }

  async findExchange(exchName: String) {
    return await this.MatrixModel.findOne({ exchangeName: exchName }).exec();
  }
}
