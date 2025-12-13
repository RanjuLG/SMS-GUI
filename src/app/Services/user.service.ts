import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ConfigService } from './config-service.service';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';
import { 
  UserProfile, 
  UserProfileDTO, 
  UpdateMyProfileDTO, 
  DeleteAccountResponse,
  UpdateProfileRequest,
  ApiResponse
} from '../Components/profile/profile.model';

// Re-export DTOs for backwards compatibility
export { 
  UserProfile, 
  UserProfileDTO, 
  UpdateMyProfileDTO, 
  DeleteAccountResponse,
  UpdateProfileRequest,
  ApiResponse
} from '../Components/profile/profile.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUserProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentUserProfile$ = this.currentUserProfileSubject.asObservable();

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  /**
   * Get standard HTTP headers for authenticated requests
   */
  private getHttpHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }

  /**
   * Check if user is logged in and handle authentication
   */
  private checkLoggedIn(): boolean {
    if (!this.authService.isLoggedIn) {
      console.error('User is not logged in');
      this.authService.logout();
      return false;
    }
    return true;
  }

  /**
   * Enhanced error handling with authentication context
   */
  private handleError(error: any): Observable<never> {
    console.error('User API call failed:', error);
    
    if (error.status === 401) {
      console.log('Unauthorized - handling appropriately');
      
      const errorMessage = error.error?.message || error.message || '';
      if (errorMessage.toLowerCase().includes('permission') || 
          errorMessage.toLowerCase().includes('access denied') ||
          errorMessage.toLowerCase().includes('insufficient')) {
        this.notificationService.showUnauthorizedPopup();
      } else {
        this.authService.logout();
      }
    }
    
    return throwError(() => new Error(error.error?.message || error.message || 'Server Error'));
  }

  /**
   * Get the current authenticated user's account information
   * Uses GET /api/account/me endpoint
   */
  getUserProfile(): Observable<UserProfileDTO> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));

    const url = this.configService.getAccountEndpoint('getMe');
    return this.http.get<UserProfileDTO>(url, {
      headers: this.getHttpHeaders()
    }).pipe(
      tap(profile => this.currentUserProfileSubject.next(profile)),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Update the current user's profile (username and email only)
   * Uses PUT /api/account/me endpoint with UpdateMyProfileDTO
   * Note: Users can only update their own profile, not their roles (for security)
   */
  updateMyProfile(profileData: UpdateMyProfileDTO): Observable<UserProfileDTO> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));

    const url = this.configService.getAccountEndpoint('updateMe');
    return this.http.put<UserProfileDTO>(url, profileData, {
      headers: this.getHttpHeaders()
    }).pipe(
      tap(profile => {
        if (profile) {
          this.currentUserProfileSubject.next(profile);
        }
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Deactivate/delete the current user's account
   * Uses DELETE /api/account/me endpoint
   */
  deleteMyAccount(): Observable<DeleteAccountResponse> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));

    const url = this.configService.getAccountEndpoint('deleteMe');
    return this.http.delete<DeleteAccountResponse>(url, {
      headers: this.getHttpHeaders()
    }).pipe(
      tap(() => {
        this.currentUserProfileSubject.next(null);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Get user by ID (Admin only)
   */
  getUserById(userId: string): Observable<UserProfile> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));

    const url = this.configService.getUserEndpoint('getById', { userId });
    return this.http.get<UserProfile>(url, {
      headers: this.getHttpHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Update user by ID (Admin only)
   */
  updateUserById(userId: string, userData: Partial<UserProfile>): Observable<ApiResponse<UserProfile>> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));

    const url = this.configService.getUserEndpoint('update', { userId });
    return this.http.put<ApiResponse<UserProfile>>(url, userData, {
      headers: this.getHttpHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Get the current cached user profile
   */
  getCurrentUserProfile(): UserProfile | null {
    return this.currentUserProfileSubject.value;
  }

  /**
   * Clear the cached user profile
   */
  clearUserProfile(): void {
    this.currentUserProfileSubject.next(null);
  }
}
