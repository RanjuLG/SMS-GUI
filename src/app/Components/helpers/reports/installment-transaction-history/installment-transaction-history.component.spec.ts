import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallmentTransactionHistoryComponent } from './installment-transaction-history.component';

describe('InstallmentTransactionHistoryComponent', () => {
  let component: InstallmentTransactionHistoryComponent;
  let fixture: ComponentFixture<InstallmentTransactionHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstallmentTransactionHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstallmentTransactionHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
