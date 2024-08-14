import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ConfigService } from './config-service.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private jwtHelper = new JwtHelperService();
  private authUrl = `${this.configService.apiUrl}/api/account`;
  private currentUserSubject = new BehaviorSubject<any>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router, private configService: ConfigService) { }

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.authUrl}/login`, { username, password }).pipe(
      tap((response: any) => {
        localStorage.setItem('token', response.token);
        this.currentUserSubject.next(this.jwtHelper.decodeToken(response.token));
      })
    );
  }

  register(username: string, email: string, password: string, role: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post(`${this.authUrl}/register`, 
      { username, email, password, roles: [role] }, 
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
  }
    
  
  
  
  

  logout() {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/sign-in']);
  }

  get isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    return !!token && !this.jwtHelper.isTokenExpired(token);
  }

  get currentUserRole(): string | null {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      console.log("Decoded Token: ", decodedToken);
      return decodedToken?.role || decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || null;
    }
    return null;
  }
}
