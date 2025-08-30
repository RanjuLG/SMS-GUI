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

  login(username: string, password: string): Observable<any> {
    console.log("this.authUrl: ", this.authUrl);

    return this.http.post(`${this.authUrl}/login`, { username, password }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }).pipe(
      tap((response: any) => {
        // Store the token and username in localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('username', username);

        // Decode the token and update the current user
        const decodedToken = this.jwtHelper.decodeToken(response.token);
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
    this.currentUserSubject.next(null);
    this.authStatus.emit(false);
    this.router.navigate(['/auth/sign-in']);  // Notify components of logout status
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
    return !!token && !this.jwtHelper.isTokenExpired(token);
  }

  get currentUserRole(): string | null {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      return decodedToken?.role || decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || null;
    }
    return null;
  }

}
