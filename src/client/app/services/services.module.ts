import { PersonValidatorService } from './person.validator.service';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { ApiService } from './api.service';
import { ArbitrageService } from './arbitrage.service';
import { ExchangeService } from './exchange.service';
import { RateService } from './rate.service';
import { MatrixService } from './matrix.service';

@NgModule({
  imports: [HttpClientModule],
  providers: [AuthService,
  UserService, ApiService, PersonValidatorService, ArbitrageService, ExchangeService,
   RateService, MatrixService]
})
export class ServicesModule {}
