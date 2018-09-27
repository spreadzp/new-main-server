import { NgModule } from '@angular/core';
import { MatTableModule, MatPaginatorModule, MatSortModule, MatCheckboxModule, MatExpansionModule, MatFormFieldModule,
  MatSelectModule, MatInputModule} from '@angular/material';
import { DropdownDirective } from './directives/dropdown.directive';
import { ExchangeComponent } from './components/exchange/exchange.component';
import { PairComponent } from './components/pair/pair.component';
import { MemberComponent } from './components/member/member.component';
import { ArbitrageExchangeComponent } from './components/arbitrage-exchange/arbitrage-exchange.component';
import { GroupArbitrageComponent } from './components/group-arbitrage/group-arbitrage.component';
import { EditGroupComponent } from './components/group-arbitrage/edit-group/edit-group.component';
import { GroupExchangeComponent } from './components/group-arbitrage/group-exchange/group-exchange.component';
import { PercentExchangeComponent } from './components/percent-exchange/percent-exchange.component';
@NgModule({
  declarations: [DropdownDirective,  ExchangeComponent,
    PairComponent, MemberComponent, ArbitrageExchangeComponent,
    GroupArbitrageComponent, EditGroupComponent, GroupExchangeComponent, PercentExchangeComponent],
  exports: [DropdownDirective, ExchangeComponent,
    PairComponent, MemberComponent, ArbitrageExchangeComponent,
    GroupArbitrageComponent],
  imports: [MatTableModule, MatPaginatorModule, MatSortModule, MatCheckboxModule, MatExpansionModule, MatFormFieldModule,
     MatSelectModule, MatInputModule
  ]
})
export class SharedModule { }
