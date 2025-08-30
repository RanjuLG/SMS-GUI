import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService, 
    private router: Router,
    private notificationService: NotificationService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isLoggedIn) {
      const userRole = this.authService.currentUserRole;
      const expectedRole = route.data['role'];
      console.log("userRole: ", userRole)
      console.log("expectedRole: ", expectedRole)

      // Check if user has the required role
      if (expectedRole === "Admin" && userRole !== "Admin") {
        const customMessage = `Access denied. This feature requires Administrator privileges. Your current role: ${userRole || 'None'}`;
        this.notificationService.showUnauthorizedPopup(customMessage);
        return false;
      }

      // Check if user has valid roles for general access (Cashier or Admin)
      if (expectedRole === "Cashier" && userRole !== "Cashier" && userRole !== "Admin") {
        const customMessage = `Access denied. You need Cashier or Administrator privileges to access this area. Your current role: ${userRole || 'None'}`;
        this.notificationService.showUnauthorizedPopup(customMessage);
        return false;
      }

      return true;
      
    } else {
      this.router.navigate(['/auth/sign-in']);
      return false;
    }
  }
}
