import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurationSettingsComponent } from './configuration-settings.component';

describe('ConfigurationSettingsComponent', () => {
  let component: ConfigurationSettingsComponent;
  let fixture: ComponentFixture<ConfigurationSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigurationSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigurationSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
