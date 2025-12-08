import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ConfigService } from './config-service.service';

export interface UserProfile {
  id?: string;
  username: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfileRequest {
  email: string;
  phone: string;
  address: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUserProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentUserProfile$ = this.currentUserProfileSubject.asObservable();

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {}

  /**
   * Get the current logged-in user's profile
   */
  getUserProfile(): Observable<UserProfile> {
    const url = `${this.configService.apiUrl}/api/users/profile`;
    return this.http.get<UserProfile>(url).pipe(
      tap(profile => this.currentUserProfileSubject.next(profile))
    );
  }

  /**
   * Update the current user's profile
   */
  updateUserProfile(profileData: UpdateProfileRequest): Observable<ApiResponse<UserProfile>> {
    const url = `${this.configService.apiUrl}/api/users/profile`;
    return this.http.put<ApiResponse<UserProfile>>(url, profileData).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.currentUserProfileSubject.next(response.data);
        }
      })
    );
  }

  /**
   * Get user by ID (Admin only)
   */
  getUserById(userId: string): Observable<UserProfile> {
    const url = `${this.configService.apiUrl}/api/users/${userId}`;
    return this.http.get<UserProfile>(url);
  }

  /**
   * Update user by ID (Admin only)
   */
  updateUserById(userId: string, userData: Partial<UserProfile>): Observable<ApiResponse<UserProfile>> {
    const url = `${this.configService.apiUrl}/api/users/${userId}`;
    return this.http.put<ApiResponse<UserProfile>>(url, userData);
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
