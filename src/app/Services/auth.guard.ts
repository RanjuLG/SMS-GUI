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

      // SuperAdmin has access to everything
      if (userRole === "SuperAdmin") {
        console.log("SuperAdmin access granted");
        return true;
      }

      // Check Admin-only access
      if (expectedRole === "Admin") {
        if (userRole === "Admin") {
          return true;
        } else {
          const customMessage = `Access denied. This feature requires Administrator privileges. Your current role: ${userRole || 'None'}`;
          this.notificationService.showUnauthorizedPopup(customMessage);
          return false;
        }
      }

      // Check Cashier-level access (Cashier or Admin can access)
      if (expectedRole === "Cashier") {
        if (userRole === "Cashier" || userRole === "Admin") {
          return true;
        } else {
          const customMessage = `Access denied. You need Cashier or Administrator privileges to access this area. Your current role: ${userRole || 'None'}`;
          this.notificationService.showUnauthorizedPopup(customMessage);
          return false;
        }
      }

      // If no specific role is required, allow access
      return true;
      
    } else {
      this.router.navigate(['/auth/sign-in']);
      return false;
    }
  }
}
