import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitialTransactionHistoryComponent } from './initial-transaction-history.component';

describe('InitialTransactionHistoryComponent', () => {
  let component: InitialTransactionHistoryComponent;
  let fixture: ComponentFixture<InitialTransactionHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InitialTransactionHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InitialTransactionHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
