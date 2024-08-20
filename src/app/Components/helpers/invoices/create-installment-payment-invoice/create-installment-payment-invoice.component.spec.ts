import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateInstallmentPaymentInvoiceComponent } from './create-installment-payment-invoice.component';

describe('CreateInstallmentPaymentInvoiceComponent', () => {
  let component: CreateInstallmentPaymentInvoiceComponent;
  let fixture: ComponentFixture<CreateInstallmentPaymentInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateInstallmentPaymentInvoiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateInstallmentPaymentInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
