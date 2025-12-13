import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../Services/auth.service';
import { UserService } from '../../Services/user.service';
import { UserProfileDTO, UpdateMyProfileDTO } from './profile.model';
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
  userId: string = '';
  roles: string[] = [];
  isEditMode: boolean = false;
  isLoading: boolean = false;
  isSaving: boolean = false;
  isDeleting: boolean = false;
  showDeleteConfirm: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Edit form values
  editUsername: string = '';
  editEmail: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
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
        next: (profile: UserProfileDTO) => {
          this.email = profile.email || '';
          this.userName = profile.username || this.userName;
          this.userId = profile.id || '';
          this.roles = profile.roles || [];
          this.userRole = this.roles.length > 0 ? this.roles.join(', ') : this.userRole;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading profile:', error);
          this.errorMessage = 'Failed to load profile. Please try again.';
          this.isLoading = false;
        }
      });
  }

  toggleEditMode(): void {
    if (!this.isEditMode) {
      // Entering edit mode - copy current values to edit fields
      this.editUsername = this.userName;
      this.editEmail = this.email;
    }
    this.isEditMode = !this.isEditMode;
    this.errorMessage = '';
    this.successMessage = '';
  }

  saveProfile(): void {
    // Validate inputs
    if (!this.editUsername.trim()) {
      this.errorMessage = 'Username is required.';
      return;
    }
    if (!this.editEmail.trim()) {
      this.errorMessage = 'Email is required.';
      return;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.editEmail)) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const updateData: UpdateMyProfileDTO = {
      username: this.editUsername.trim(),
      email: this.editEmail.trim()
    };

    this.userService.updateMyProfile(updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile: UserProfileDTO) => {
          this.isSaving = false;
          this.isEditMode = false;
          
          // Update local values with response
          this.userName = profile.username || this.editUsername;
          this.email = profile.email || this.editEmail;
          
          // Update localStorage username if changed
          if (profile.username) {
            localStorage.setItem('username', profile.username);
          }
          
          this.successMessage = 'Profile updated successfully!';
          
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

  showDeleteConfirmation(): void {
    this.showDeleteConfirm = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
  }

  confirmDeleteAccount(): void {
    this.isDeleting = true;
    this.errorMessage = '';

    this.userService.deleteMyAccount()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isDeleting = false;
          this.showDeleteConfirm = false;
          // Log out and redirect to login
          this.authService.logout();
        },
        error: (error) => {
          console.error('Error deleting account:', error);
          this.isDeleting = false;
          this.errorMessage = error.error?.message || 'Failed to delete account. Please try again.';
        }
      });
  }

  logout(): void {
    this.authService.logout();
  }
}

