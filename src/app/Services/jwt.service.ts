import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { NotificationService } from './notification.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  private jwtHelper = new JwtHelperService();
  
  constructor(
    private router: Router,
    private notificationService: NotificationService
  ) {}
  
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');
    
    // Skip adding auth header for login/register requests
    const isAuthRequest = request.url.includes('/api/account/login') || 
                         request.url.includes('/api/account/register');
    
    if (token && !isAuthRequest) {
      const isExpired = this.jwtHelper.isTokenExpired(token);
      
      if (!isExpired) {
        // Clone the request and add authorization header
        request = request.clone({
          setHeaders: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': request.headers.get('Content-Type') || 'application/json',
            'Accept': 'application/json'
          }
        });
        
        console.log('JWT Token added to request headers');
      } else {
        console.log('JWT Token expired, removing from storage');
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        this.notificationService.showTokenExpiredPopup();
        return throwError(() => new Error('Token expired'));
      }
    } else if (!isAuthRequest) {
      console.log('No valid token found for authenticated request');
    }
  
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('HTTP Error:', error);
        
        if (error.status === 401) {
          // Unauthorized - check if it's due to insufficient permissions or invalid token
          console.log('Unauthorized request, clearing tokens');
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          
          // Check if the error message indicates insufficient permissions vs invalid token
          const errorMessage = error.error?.message || error.message || '';
          if (errorMessage.toLowerCase().includes('permission') || 
              errorMessage.toLowerCase().includes('access denied') ||
              errorMessage.toLowerCase().includes('insufficient')) {
            this.notificationService.showUnauthorizedPopup();
          } else {
            this.notificationService.showTokenExpiredPopup();
          }
        }
        
        return throwError(() => error);
      })
    );
  }
}
