import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: any;

  constructor(private http: HttpClient) { }

  loadConfig(): Promise<void> {
    return firstValueFrom(this.http.get('/configs/appConfig.json'))
      .then(data => {
        this.config = data;
      })
      .catch(error => {
        console.error('Failed to load config:', error);
        throw error; // Re-throw to ensure failure is handled
      });
  }

  get apiUrl(): string {
    return this.config?.api_host ?? '';
  }

  get invoiceSettings(): any {
    // Return the invoice settings if available, otherwise return an empty object or provide a fallback value
    return this.config?.invoice_settings ?? {};
  }

  get healthEndpoints(): any {
    return this.config?.api_endpoints?.health ?? {};
  }

  get apiEndpoints(): any {
    return this.config?.api_endpoints ?? {};
  }
  
}
