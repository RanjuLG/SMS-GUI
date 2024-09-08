import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettlementInvoiceTemplateComponent } from './settlement-invoice-template.component';

describe('SettlementInvoiceTemplateComponent', () => {
  let component: SettlementInvoiceTemplateComponent;
  let fixture: ComponentFixture<SettlementInvoiceTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettlementInvoiceTemplateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettlementInvoiceTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
