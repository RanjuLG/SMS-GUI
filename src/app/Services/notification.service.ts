import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private router: Router) { }

  /**
   * Show unauthorized access popup
   * @param message Custom message (optional)
   */
  showUnauthorizedPopup(message?: string): void {
    const defaultMessage = 'You do not have permission to access this resource. Please contact your administrator for assistance.';
    
    Swal.fire({
      title: 'Access Denied',
      text: message || defaultMessage,
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'View Profile',
      cancelButtonText: 'Logout',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#dc3545',
      allowOutsideClick: false,
      allowEscapeKey: false
    }).then((result) => {
      if (result.isConfirmed) {
        // Navigate to profile page
        this.router.navigate(['/profile']);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // User chose to logout
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        this.router.navigate(['/auth/sign-in']);
      }
    });
  }

  /**
   * Show token expired popup
   */
  showTokenExpiredPopup(): void {
    Swal.fire({
      title: 'Session Expired',
      text: 'Your session has expired. Please log in again to continue.',
      icon: 'warning',
      confirmButtonText: 'Login Again',
      confirmButtonColor: '#3085d6',
      allowOutsideClick: false,
      allowEscapeKey: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/auth/sign-in']);
      }
    });
  }

  /**
   * Show generic error popup
   * @param title Error title
   * @param message Error message
   */
  showError(title: string, message: string): void {
    Swal.fire({
      title: title,
      text: message,
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#3085d6'
    });
  }

  /**
   * Show success popup
   * @param title Success title
   * @param message Success message
   */
  showSuccess(title: string, message: string): void {
    Swal.fire({
      title: title,
      text: message,
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#3085d6'
    });
  }

  /**
   * Show info popup
   * @param title Info title
   * @param message Info message
   */
  showInfo(title: string, message: string): void {
    Swal.fire({
      title: title,
      text: message,
      icon: 'info',
      confirmButtonText: 'OK',
      confirmButtonColor: '#3085d6'
    });
  }
}
