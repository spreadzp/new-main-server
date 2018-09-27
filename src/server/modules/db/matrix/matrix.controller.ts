import { Controller, Get, Post, Body, Param, HttpStatus, Res, Request, Delete } from '@nestjs/common';
import { MatrixService } from './matrix.service';
import { Matrix } from '../../common/models/matrix';
import { MatrixDto } from './dto/matrix.dto';

@Controller('matrix')
export class MatrixController {
  constructor(private readonly MatrixService: MatrixService) { }

  @Post('create')
  async create(@Body() MatrixDto: MatrixDto) {
    console.log('MatrixDto :', MatrixDto);
    this.MatrixService.create(MatrixDto);
  }

  @Get('available')
  async available(@Res() res: any) {
    console.log('available!! :');
    this.MatrixService.findAll({ history: false }).then(
      (result: any) => { return res.status(200).send(result) },
      (error: any) => { return res.status(400).send(error) },
    );
  }

  // Получить из истории
  @Get('history')
  async history(@Res() res: any) {
    this.MatrixService.findAll({ history: true }).then(
      (result: any) => { return res.status(200).send(result) },
      (error: any) => { return res.status(400).send(error) },
    );
  }
  // Полоить матрицу в историю
  @Post('history')
  async setAsHistory(@Body() id: any) {
    await this.MatrixService.setToHistory(id);
  }

  @Post('delete')
  async deleteMatrix(@Body() data: Matrix) {
    console.log('data :', data);
    await this.MatrixService.deleteMatrix(data);
  }

  @Get('**')
  notFoundPage(@Res() res: any) {
    res.redirect('/');
  }
}