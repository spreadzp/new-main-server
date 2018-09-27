import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentArbitrageComponent } from './current-arbitrage.component';

describe('CurrentArbitrageComponent', () => {
  let component: CurrentArbitrageComponent;
  let fixture: ComponentFixture<CurrentArbitrageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CurrentArbitrageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentArbitrageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
