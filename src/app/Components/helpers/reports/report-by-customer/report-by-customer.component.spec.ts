import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportByCustomerComponent } from './report-by-customer.component';

describe('ReportByCustomerComponent', () => {
  let component: ReportByCustomerComponent;
  let fixture: ComponentFixture<ReportByCustomerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportByCustomerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportByCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
