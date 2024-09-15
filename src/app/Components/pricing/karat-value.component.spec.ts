import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KaratValueComponent } from './karat-value.component';

describe('KaratValueComponent', () => {
  let component: KaratValueComponent;
  let fixture: ComponentFixture<KaratValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KaratValueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KaratValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
