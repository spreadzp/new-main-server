import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { UserComponent } from './components/user/user/user.component';
import { TradesComponent } from './components/trades/trades.component';
import { ExportComponent } from './components/export/export.component';
import { OrderComponent } from './components/order/order.component';
import { SettingComponent } from './components/setting/setting.component';
import { ArbitrageComponent } from './components/arbitrage/arbitrage.component';
import { CurrentArbitrageComponent } from './components/current-arbitrage/current-arbitrage.component';
import { PercentExchangeComponent } from './shared/components/percent-exchange/percent-exchange.component';
import { RateComponent } from './components/rate/rate.component';
import {StatisticComponent} from './components/statistic/statistic.component';
import { MatrixComponent } from './components/matrix/matrix.component';
const appRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'export'
  },
  {
    path: 'user',
    component: UserComponent,
  },
  {
    path: 'trades',
    component: TradesComponent,
  },
  {
    path: 'export',
    component: ExportComponent,
  },
  {
    path: 'order',
    component: OrderComponent,
  },
  {
    path: 'setting',
    component: SettingComponent,
  },
  {
    path: 'rate',
    component: RateComponent,
  },
  {
    path: 'arbitrage',
    component: ArbitrageComponent,
  },
  {
    path: 'current-arbitrage',
    component: CurrentArbitrageComponent,
  },
  {
    path: 'percent',
    component: PercentExchangeComponent,
  },
  {
    path: 'statistic',
    component: StatisticComponent,
  },
  {
    path: 'matrix',
    component: MatrixComponent,
  },
  {
    path: '**',
    redirectTo: 'export'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, {
      useHash: false,
      preloadingStrategy: PreloadAllModules
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
