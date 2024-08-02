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
      });
  }

  get apiUrl(): string {
    return this.config?.api_host ?? '';
  }
}
