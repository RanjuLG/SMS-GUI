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

  // Helper methods to get specific endpoint URLs
  getCustomerEndpoint(action: string, params?: any): string {
    const baseUrl = this.apiUrl;
    const endpoint = this.config?.api_endpoints?.customers?.[action];
    
    if (!endpoint) {
      console.warn(`Customer endpoint '${action}' not found in config`);
      return `${baseUrl}/api/customers`;
    }

    return `${baseUrl}${this.replaceParams(endpoint, params)}`;
  }

  getItemEndpoint(action: string, params?: any): string {
    const baseUrl = this.apiUrl;
    const endpoint = this.config?.api_endpoints?.items?.[action];
    
    if (!endpoint) {
      console.warn(`Item endpoint '${action}' not found in config`);
      return `${baseUrl}/api/items`;
    }

    return `${baseUrl}${this.replaceParams(endpoint, params)}`;
  }

  getTransactionEndpoint(action: string, params?: any): string {
    const baseUrl = this.apiUrl;
    const endpoint = this.config?.api_endpoints?.transactions?.[action];
    
    if (!endpoint) {
      console.warn(`Transaction endpoint '${action}' not found in config`);
      return `${baseUrl}/api/transactions`;
    }

    return `${baseUrl}${this.replaceParams(endpoint, params)}`;
  }

  getInvoiceEndpoint(action: string, params?: any): string {
    const baseUrl = this.apiUrl;
    const endpoint = this.config?.api_endpoints?.invoices?.[action];
    
    if (!endpoint) {
      console.warn(`Invoice endpoint '${action}' not found in config`);
      return `${baseUrl}/api/invoices`;
    }

    return `${baseUrl}${this.replaceParams(endpoint, params)}`;
  }

  getKaratageEndpoint(section: string, action: string, params?: any): string {
    const baseUrl = this.apiUrl;
    const endpoint = this.config?.api_endpoints?.karatage?.[section]?.[action];
    
    if (!endpoint) {
      console.warn(`Karatage endpoint '${section}.${action}' not found in config`);
      return `${baseUrl}/api/karatage/${section}`;
    }

    return `${baseUrl}${this.replaceParams(endpoint, params)}`;
  }

  getUserEndpoint(action: string, params?: any): string {
    const baseUrl = this.apiUrl;
    const endpoint = this.config?.api_endpoints?.users?.[action];
    
    if (!endpoint) {
      console.warn(`User endpoint '${action}' not found in config`);
      return `${baseUrl}/api/account/users`;
    }

    return `${baseUrl}${this.replaceParams(endpoint, params)}`;
  }

  getReportEndpoint(action: string, params?: any): string {
    const baseUrl = this.apiUrl;
    const endpoint = this.config?.api_endpoints?.reports?.[action];
    
    if (!endpoint) {
      console.warn(`Report endpoint '${action}' not found in config`);
      return `${baseUrl}/api/reports`;
    }

    return `${baseUrl}${this.replaceParams(endpoint, params)}`;
  }

  getHealthEndpoint(action: string, params?: any): string {
    const baseUrl = this.apiUrl;
    const endpoint = this.config?.api_endpoints?.health?.[action];
    
    if (!endpoint) {
      console.warn(`Health endpoint '${action}' not found in config`);
      return `${baseUrl}/api/health`;
    }

    return `${baseUrl}${this.replaceParams(endpoint, params)}`;
  }

  getAuthEndpoint(action: string): string {
    const baseUrl = this.apiUrl;
    const endpoint = this.config?.api_endpoints?.authentication?.[action];
    
    if (!endpoint) {
      console.warn(`Auth endpoint '${action}' not found in config`);
      return `${baseUrl}/api/account/${action}`;
    }

    return `${baseUrl}${endpoint}`;
  }

  // Helper method to replace parameters in endpoint URLs
  private replaceParams(endpoint: string, params?: any): string {
    if (!params) return endpoint;

    let result = endpoint;
    Object.keys(params).forEach(key => {
      const placeholder = `{${key}}`;
      if (result.includes(placeholder)) {
        result = result.replace(placeholder, encodeURIComponent(params[key]));
      }
    });

    return result;
  }
}
