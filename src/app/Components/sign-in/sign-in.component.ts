import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../Services/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../Services/notification.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {

  loginForm!: UntypedFormGroup;
  submitted = false;
  fieldTextType = false;
  year: number = new Date().getFullYear();

  constructor(
    private formBuilder: UntypedFormBuilder, 
    private authService: AuthService, 
    private router: Router,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }

    const username = this.f['username'].value;
    const password = this.f['password'].value;

    this.authService.login(username, password).subscribe({
      next: () => {
        Swal.fire('Login Successful', 'You have logged in successfully.', 'success');
        
        // Check user role and navigate accordingly
        const userRole = this.authService.currentUserRole;
        console.log('User role after login:', userRole);
        
        if (userRole === 'Admin' || userRole === 'Cashier') {
          // User has valid role, navigate to overview
          this.router.navigate(['/overview']);
        } else {
          // User has logged in successfully but doesn't have the right permissions
          // Navigate to profile page where they can see their status
          this.router.navigate(['/profile']);
        }
      },
      error: (err) => {
        console.error('Login failed', err);
        Swal.fire('Error', 'Please verify the username and password, and try again.', 'error');
        // Handle login error, e.g., display an error message
      }
    });
  }

  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }
}
