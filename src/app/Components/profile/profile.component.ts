import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../Services/auth.service';
import { UserService, UserProfile, UpdateProfileRequest } from '../../Services/user.service';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, BreadcrumbComponent, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  userName: string = '';
  userRole: string = '';
  email: string = '';
  phone: string = '';
  address: string = '';
  isEditMode: boolean = false;
  isLoading: boolean = false;
  isSaving: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    // Get basic user info from AuthService
    this.userName = this.authService.getUserName() as string || 'User';
    this.userRole = this.authService.currentUserRole || 'No Role Assigned';

    // Load full user profile from backend
    this.loadUserProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.userService.getUserProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile: UserProfile) => {
          this.email = profile.email || '';
          this.phone = profile.phone || '';
          this.address = profile.address || '';
          this.userName = profile.username || this.userName;
          this.userRole = profile.role || this.userRole;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading profile:', error);
          this.errorMessage = 'Failed to load profile. Using default values.';
          // Fallback to mock data if API fails
          this.email = 'user@example.com';
          this.phone = '+1 234 567 890';
          this.address = '123 Main St, City, Country';
          this.isLoading = false;
        }
      });
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    this.errorMessage = '';
    this.successMessage = '';
  }

  saveProfile(): void {
    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const updateData: UpdateProfileRequest = {
      email: this.email,
      phone: this.phone,
      address: this.address
    };

    this.userService.updateUserProfile(updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isSaving = false;
          this.isEditMode = false;
          this.successMessage = response.message || 'Profile updated successfully!';
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.isSaving = false;
          this.errorMessage = error.error?.message || 'Failed to update profile. Please try again.';
        }
      });
  }

  logout(): void {
    this.authService.logout();
  }
}
