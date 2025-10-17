import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashierDashboardComponent } from './cashier-dashboard.component';

describe('CashierDashboardComponent', () => {
  let component: CashierDashboardComponent;
  let fixture: ComponentFixture<CashierDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CashierDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CashierDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display current date and time', () => {
    expect(component.currentDate).toBeTruthy();
    expect(component.currentTime).toBeTruthy();
  });

  it('should set appropriate greeting based on time', () => {
    expect(['Good Morning', 'Good Afternoon', 'Good Evening']).toContain(component.greeting);
  });

  it('should load quick stats', () => {
    expect(component.todaysTransactions).toBeGreaterThanOrEqual(0);
    expect(component.todaysRevenue).toBeGreaterThanOrEqual(0);
    expect(component.activeLoans).toBeGreaterThanOrEqual(0);
  });
});