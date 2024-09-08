import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallmentInvoiceTemplateComponent } from './installment-invoice-template.component';

describe('InstallmentInvoiceTemplateComponent', () => {
  let component: InstallmentInvoiceTemplateComponent;
  let fixture: ComponentFixture<InstallmentInvoiceTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstallmentInvoiceTemplateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstallmentInvoiceTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
