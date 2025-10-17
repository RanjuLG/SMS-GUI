import { TestBed } from '@angular/core/testing';

import { CashierModeService } from './cashier-mode.service';

describe('CashierModeService', () => {
  let service: CashierModeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CashierModeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});