import { subscribe } from 'graphql';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Matrix } from '../../shared/models/matrix';
import { MatrixService } from '../../services/matrix.service';

@Component({
  selector: 'app-matrix',
  templateUrl: './matrix.component.html',
  styleUrls: ['./matrix.component.scss']
})
export class MatrixComponent implements OnInit {
  matrix: Matrix;
  constructor(
    private readonly matrixService: MatrixService,
    private readonly userService: UserService
  ) { }

  ngOnInit() {
    this.matrixService.getMatrix<Matrix>('matrix/available')
      .subscribe(data => {
        this.matrix = data;
        console.log('this.matrix :', this.matrix);
      });
  }

  createNewMatrix() {
    this.matrixService.addMatrix('qqq')
    .subscribe(hero => console.log('matrix :', hero));
  }

  removeMatrix() {

  }

}
