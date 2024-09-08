import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSettlementInvoiceComponent } from './create-settlement-invoice.component';

describe('CreateSettlementInvoiceComponent', () => {
  let component: CreateSettlementInvoiceComponent;
  let fixture: ComponentFixture<CreateSettlementInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateSettlementInvoiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateSettlementInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
