import { interval } from 'rxjs';
import { ExchangeData } from './../../../../server/modules/common/models/exchangeData';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { UserService } from '../../services/user.service';
import { ExchangeService } from '../../services/exchange.service';
import { CircleArbitrage } from '../../shared/models/circleArbitrage';

@Component({
  selector: 'app-current-arbitrage',
  templateUrl: './current-arbitrage.component.html',
  styleUrls: ['./current-arbitrage.component.scss']
})
export class CurrentArbitrageComponent implements OnInit, AfterViewInit {
  @ViewChild('myname') input: any;
  displayedColumns: string[] = [];
  items: CircleArbitrage[];
  dataSourcePrice: MatTableDataSource<CircleArbitrage>;
  req: any[];
  selection: SelectionModel<CircleArbitrage>;
  source: any;

  constructor(
    private userService: UserService,
    private readonly exchangeService: ExchangeService
  ) { }

  ngOnInit() {
    this.selection = new SelectionModel<CircleArbitrage>(true, []);
    this.isAllSelected();
      this.source = interval(1000);
      this.updateDate();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      console.log(this.input.value);
    }, 3000);
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
    this.userService.getData<CircleArbitrage[]>('sever-tcp/current-arbitrages')
      .subscribe(data => {
        this.items = data;
        this.dataSourcePrice = new MatTableDataSource<CircleArbitrage>(this.items);
      });

    this.exchangeService.getHeaderTableNames('currentArbitrageTable')
      .subscribe((header) => {
        this.displayedColumns = header;
      });
  }

  stopNewArbitrage() {
    this.userService.stopNewArbitrage()
    .subscribe(data => {
      this.req = data;
      console.log('data :', data);
    });
  }

  arbitrageTwo() {
    this.userService.startArbitrage()
    .subscribe(data => {
      this.req = data;
      console.log('Start Arbitrage :', data);
    });
  }

  arbitrageMoreTwo() {
    console.log('arbitrageMoreTwo :');
  }

  closeSecondCircle(closeExchanges: any) {
    this.userService.getData<any>(`sever-tcp/close-second-arbitrage/?id=${closeExchanges.arbitrageId}`)
    .subscribe(data => {
    });
  }

  closeOrder(idClosingOrder: any) {
    console.log('idClosingOrder :', idClosingOrder);
  }
}
