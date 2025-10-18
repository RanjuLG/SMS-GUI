import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BreadcrumbService } from './breadcrumb.service';

describe('BreadcrumbService', () => {
  let service: BreadcrumbService;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    });
    service = TestBed.inject(BreadcrumbService);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
