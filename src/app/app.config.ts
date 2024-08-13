import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { routes } from './app.routes';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ConfigService } from './Services/config-service.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ApiService } from './Services/api-service.service';
import { FlatpickrModule, FlatpickrDefaults } from 'angularx-flatpickr';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, NativeDateAdapter } from '@angular/material/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { JwtInterceptor } from './Services/jwt.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

// Function to load configuration during application initialization
export function initializeApp(configService: ConfigService): () => Promise<void> {
  return () => configService.loadConfig();
}

// Custom date formats
const CUSTOM_DATE_FORMATS = {
  parse: {
    dateInput: 'yyyy-MM-dd',
  },
  display: {
    dateInput: 'yyyy-MM-dd',
    monthYearLabel: 'MMM yyyy',
    dateA11yLabel: 'yyyy-MM-dd',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

export const appConfig: ApplicationConfig = {
  providers: [
    // Custom date adapter and formats
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'outline'}},
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    

    // Other providers
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    importProvidersFrom(
      BrowserModule, 
      ReactiveFormsModule, 
      NgbModule, 
      FormsModule, 
      FlatpickrModule
    ), 
    provideAnimationsAsync(),
    provideHttpClient(withInterceptorsFromDi()),
    ConfigService,
    ApiService,
    FlatpickrDefaults,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [ConfigService],
      multi: true
    },
  ]
};
