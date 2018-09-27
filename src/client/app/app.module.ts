import { CommonModule } from '@angular/common';
import { BrowserModule, BrowserTransferStateModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { APP_ID, Inject, PLATFORM_ID, NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
//import { NgDatepickerModule } from 'ng2-datepicker';
import { MatFormFieldModule, MatNativeDateModule, MatCheckboxModule, MatExpansionModule } from '@angular/material';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

// modules
import { AppRoutingModule } from './app.routing.module';
// import { GraphqlModule } from './app.graphql.module';
import { GuardsModule } from './guards/guards.module';
//import { InterceptorsModule } from './interceptors/interceptors.module';
import { MaterialModule } from './material/material.module';
import { ServicesModule } from './services/services.module';
import { SharedModule } from './shared/shared.module';

// components
import { AppComponent } from './components/app.component';
import { HeaderComponent } from './components/header/header.component';
import { UserComponent } from './components/user/user/user.component';
import { TradesComponent } from './components/trades/trades.component';
import { ExportComponent } from './components/export/export.component';
import { ArbitrageComponent } from './components/arbitrage/arbitrage.component';
import { ArbitrageEditComponent } from './components/arbitrage/arbitrage-edit/arbitrage-edit.component';
import { OrderComponent } from './components/order/order.component';
import { SettingComponent } from './components/setting/setting.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { RateComponent } from './components/rate/rate.component';
import { StatisticComponent } from './components/statistic/statistic.component';
import { RateEditComponent } from './components/rate/rate-edit/rate-edit.component';
import { CurrentArbitrageComponent } from './components/current-arbitrage/current-arbitrage.component';
import { CurrentTradeComponent } from './components/current-arbitrage/current-trade/current-trade.component';
import { MatrixComponent } from './components/matrix/matrix.component';



@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    AppComponent,
    HeaderComponent,
    UserComponent,
    TradesComponent,
    ExportComponent,
    OrderComponent,
    SettingComponent,
    ArbitrageComponent,
    ArbitrageEditComponent,
    SidenavComponent,
    RateComponent,
    StatisticComponent,
    RateEditComponent,
    CurrentArbitrageComponent,
    CurrentTradeComponent,
    MatrixComponent,
  ],
  imports: [
    AppRoutingModule,
    CommonModule,
    NgbModule.forRoot(),
    // TabsModule.forRoot(),
    // BsDropdownModule.forRoot(),
    MaterialModule,
    BrowserModule,
    BrowserModule.withServerTransition({ appId: 'nest-angular' }),
    BrowserTransferStateModule,
    BrowserAnimationsModule,
    ServicesModule,
    SharedModule,
    GuardsModule,
    // GraphqlModule,
    // NativeScriptCommonModule,
    // InterceptorsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    HttpClientModule,
    // NgDatepickerModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatExpansionModule,
    NgxDaterangepickerMd
  ],
  exports: [MatCheckboxModule],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(APP_ID) private appId: string
  ) {
    const platform = isPlatformBrowser(platformId) ?
      'in the browser' : 'on the server';

    console.log(`Running ${platform} with appId=${appId}`);
  }
}
