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
  
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');
    
    // Skip adding auth header for login/register requests
    const isAuthRequest = request.url.includes('/api/account/login') || 
                         request.url.includes('/api/account/register');
    
    if (token && !isAuthRequest) {
      // Debug: Log token details
      console.log('Token from localStorage:', token);
      console.log('Token length:', token.length);
      console.log('Token starts with:', token.substring(0, 50));
      console.log('Request body type:', typeof request.body);
      console.log('Is FormData:', request.body instanceof FormData);
      
      // Validate token format before using it
      if (!this.isValidJwtFormat(token)) {
        console.error('Invalid JWT format detected, removing from storage');
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        this.notificationService.showTokenExpiredPopup();
        return throwError(() => new Error('Invalid token format'));
      }
      
      const isExpired = this.jwtHelper.isTokenExpired(token);
      
      if (!isExpired) {
        // Check if this is a FormData request
        const isFormData = request.body instanceof FormData;
        
        // Clone the request and add authorization header
        const headers: { [key: string]: string } = {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        };
        
        // Only set Content-Type for non-FormData requests
        if (!isFormData) {
          const existingContentType = request.headers.get('Content-Type');
          headers['Content-Type'] = existingContentType || 'application/json';
        }
        
        request = request.clone({
          setHeaders: headers
        });
        
        console.log('JWT Token added to request headers');
        console.log('Authorization header:', `Bearer ${token.substring(0, 50)}...`);
        console.log('Request URL:', request.url);
        console.log('Request method:', request.method);
        console.log('Is FormData request:', isFormData);
        console.log('Final Content-Type header:', request.headers.get('Content-Type'));
        
        // Check token claims
        try {
          const decodedToken = this.jwtHelper.decodeToken(token);
          console.log('Token claims being sent:', {
            sub: decodedToken.sub,
            role: decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
            exp: decodedToken.exp,
            currentTime: Math.floor(Date.now() / 1000),
            timeUntilExpiry: decodedToken.exp - Math.floor(Date.now() / 1000)
          });
        } catch (e) {
          console.error('Error decoding token:', e);
        }
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
        console.log('Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.error?.message || error.message,
          url: error.url,
          headers: error.headers?.keys()
        });
        
        if (error.status === 401) {
          console.log('🚨 BACKEND 401 UNAUTHORIZED ERROR 🚨');
          console.log('Backend error response:', error.error);
          console.log('Backend response body:', JSON.stringify(error.error, null, 2));
          console.log('Request that failed:', {
            method: request.method,
            url: request.url,
            headers: {
              Authorization: request.headers.get('Authorization')?.substring(0, 50) + '...',
              'Content-Type': request.headers.get('Content-Type'),
              Accept: request.headers.get('Accept')
            }
          });
          
          // Clear tokens and show appropriate notification
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          
          // Since backend doesn't provide error details, show generic message
          this.notificationService.showUnauthorizedPopup();
          
          // Navigate to login after showing notification
          setTimeout(() => {
            this.router.navigate(['/sign-in']);
          }, 2000);
        }
        
        return throwError(() => error);
      })
    );
  }
}
