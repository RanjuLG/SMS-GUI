import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { ConfigService } from './config-service.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private jwtHelper = new JwtHelperService();
  private authUrl = `${this.configService.apiUrl}/api/account`;
  private currentUserSubject = new BehaviorSubject<any>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  authStatus = new EventEmitter<boolean>();

  constructor(private http: HttpClient, private router: Router, private configService: ConfigService) { }

  /**
   * Validates if a string is in proper JWT format
   * JWT should have exactly 3 parts separated by dots
   */
  private isValidJwtFormat(token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false;
    }
    
    // JWT should have exactly 2 dots (3 parts)
    const parts = token.split('.');
    return parts.length === 3 && parts.every(part => part.length > 0);
  }

  login(username: string, password: string): Observable<any> {
    console.log("this.authUrl: ", this.authUrl);

    return this.http.post(`${this.authUrl}/login`, { username, password }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }).pipe(
      tap((response: any) => {
        console.log('Login response:', response);
        
        // Validate the response has a token
        if (!response || !response.token) {
          console.error('No token received in login response');
          throw new Error('Invalid login response - no token received');
        }
        
        // Validate token format
        if (!this.isValidJwtFormat(response.token)) {
          console.error('Received invalid JWT format from server');
          throw new Error('Invalid token format received from server');
        }
        
        console.log('Storing token:', response.token.substring(0, 50) + '...');
        
        // Store the token and username in localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('username', username);

        // Decode the token and update the current user
        const decodedToken = this.jwtHelper.decodeToken(response.token);
        console.log('Decoded token:', decodedToken);
        this.currentUserSubject.next(decodedToken);

        // Emit login status to notify other components
        this.authStatus.emit(true);
      }),
      catchError((error: any) => {
        console.error('Login failed:', error);
        return throwError(() => error);
      })
    );
  }

  getUserName(): string | boolean {
    if (this.isLoggedIn) {
      const username = localStorage.getItem('username');
      return username ? username : false;
    }
    return false;
  }
  

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    this.currentUserSubject.next(null);
    this.authStatus.emit(false);
    this.router.navigate(['/auth/sign-in']);  // Notify components of logout status
  }

  /**
   * Clear all authentication data and redirect to login
   * Used when token is corrupted or invalid
   */
  clearAuthenticationData(): void {
    console.log('Clearing corrupted authentication data');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    this.currentUserSubject.next(null);
    this.authStatus.emit(false);
  }

  register(username: string, email: string, password: string, role: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post(`${this.authUrl}/register?token=${token}`,
      { username, email, password, roles: [role] },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      }
    ).pipe(
      catchError((error: any) => {
        console.error('Registration failed:', error);
        return throwError(() => error);
      })
    );
  }

  get isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    if (!token || !this.isValidJwtFormat(token)) {
      // Clean up invalid token
      if (token) {
        console.error('Invalid token format detected in isLoggedIn check, cleaning up');
        localStorage.removeItem('token');
        localStorage.removeItem('username');
      }
      return false;
    }
    
    try {
      return !this.jwtHelper.isTokenExpired(token);
    } catch (error) {
      console.error('Error checking token expiration:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      return false;
    }
  }

  get currentUserRole(): string | null {
    const token = localStorage.getItem('token');
    if (!token || !this.isValidJwtFormat(token)) {
      return null;
    }
    
    try {
      const decodedToken = this.jwtHelper.decodeToken(token);
      return decodedToken?.role || decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      return null;
    }
  }

}
