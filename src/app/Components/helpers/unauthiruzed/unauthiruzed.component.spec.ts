import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnauthiruzedComponent } from './unauthiruzed.component';

describe('UnauthiruzedComponent', () => {
  let component: UnauthiruzedComponent;
  let fixture: ComponentFixture<UnauthiruzedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnauthiruzedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnauthiruzedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
