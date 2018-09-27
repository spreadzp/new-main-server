import { interval } from 'rxjs';
import { UserService } from './../../../services/user.service';

import { Component, OnInit } from '@angular/core';
import { ExchangeData } from '../../../shared/models/exchangeData';
import { ExchangeService } from '../../../services/exchange.service';
import { MatTableDataSource } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  displayedColumns: string[] = [];
  items: ExchangeData[];
  dataSourcePrice: MatTableDataSource<ExchangeData>;
  req: any[];
  selection: SelectionModel<ExchangeData>;
  source:  any;

  constructor(
    private userService: UserService,
    private readonly exchangeService: ExchangeService
  ) { }

  ngOnInit() {
    this.selection = new SelectionModel<ExchangeData>(true, []);
    this.isAllSelected();
    this.source = interval(1000);
    this.updateDate();
  }

  isAllSelected() {
    if (this.dataSourcePrice) {
      const numSelected = this.selection.selected.length;
      const numRows = this.dataSourcePrice.data.length;
      return numSelected === numRows;
    }

  }

  updateDate() {
    const t = this.source.subscribe((x: any) => {
      this.fetchData();
    });
  }

  fetchData() {
    this.userService.getData<ExchangeData[]>('sever-tcp/current-price')
      .subscribe(data => {
        this.items = data;
        this.dataSourcePrice = new MatTableDataSource<ExchangeData>(this.items);
      });

      this.exchangeService.getHeaderTableNames('currentPriceTable')
      .subscribe((header) => {
        this.displayedColumns = header;
      });
  }

  startTcp() {
    this.userService.startTcp()
      .subscribe(data => {
        this.req = data;
        console.log('data :', data);
      });
  }
  stopTcp() {
    this.userService.stopTcp()
      .subscribe(data => {
        this.req = data;
        console.log('data :', data);
      });
  }
}
