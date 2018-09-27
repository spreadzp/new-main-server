import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentTradeComponent } from './current-trade.component';

describe('CurrentTradeComponent', () => {
  let component: CurrentTradeComponent;
  let fixture: ComponentFixture<CurrentTradeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CurrentTradeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentTradeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
