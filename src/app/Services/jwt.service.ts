import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  private jwtHelper = new JwtHelperService();
  
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');
    console.log("token: ",token)
    //token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImp0aSI6ImU3MzBjNjc2LTI3OWUtNGYxOS05OTM2LTc2MDM2NmY2OThmYiIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWVpZGVudGlmaWVyIjoiZDFjOTBiMTItNmYyZi00YTI4LWI2MjEtNTA2MTM1MzQwNGVhIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiQWRtaW4iLCJleHAiOjE3MjM1NzQ3MzcsImlzcyI6IllvdXJBcHBOYW1lIiwiYXVkIjoiWW91ckFwcE5hbWUifQ.1gNw7a5xeZTzxtcgkfcS2jzwXkKPPa3tKJA-regyl40";
    console.log("new token: ",token)
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
