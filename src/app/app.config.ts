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

export function initializeApp(configService: ConfigService): () => Promise<void> {
  return () => configService.loadConfig();
}

export const appConfig: ApplicationConfig = {
  providers: [
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
    FlatpickrDefaults, // Add FlatpickrDefaults provider
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [ConfigService],
      multi: true
    }
  ]
};
