import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceTypesComponent } from './invoice-types.component';

describe('InvoiceTypesComponent', () => {
  let component: InvoiceTypesComponent;
  let fixture: ComponentFixture<InvoiceTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceTypesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
