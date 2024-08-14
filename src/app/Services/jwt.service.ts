import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  private jwtHelper = new JwtHelperService();
  
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');
    
   
    if (token) {
      const isExpired = this.jwtHelper.isTokenExpired(token);
      console.log("Token is expired:", isExpired);
  
      if (!isExpired) {
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log("Token set in the headers.");
      } else {
        console.log("Token expired. Not setting Authorization header.");
      }
    } else {
      console.log("No token found.");
    }
  
    return next.handle(request);
  }
  
}
