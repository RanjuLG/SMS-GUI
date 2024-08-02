import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashBalanceComponent } from './cash-balance.component';

describe('CashBalanceComponent', () => {
  let component: CashBalanceComponent;
  let fixture: ComponentFixture<CashBalanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CashBalanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CashBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
