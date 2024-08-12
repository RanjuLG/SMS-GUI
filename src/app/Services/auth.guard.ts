import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isLoggedIn) {
      const userRole = this.authService.currentUserRole;
      const expectedRole = route.data['role'];
      console.log("userRole: ",userRole)
      console.log("expectedRole: ",expectedRole)

      if (expectedRole && expectedRole !== userRole) {
        this.router.navigate(['/unauthorized']);
        return false;
      }

      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
