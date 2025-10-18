import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../Services/auth.service';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { ServerError } from '../../shared/models/common.models';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,RouterLink],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {

  signUpForm!: UntypedFormGroup;
  submitted = false;
  fieldTextType = false;
  year: number = new Date().getFullYear();
  serverErrors: ServerError[] = [];

  constructor(private formBuilder: UntypedFormBuilder, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.signUpForm = this.formBuilder.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      role: ['', Validators.required]  // You may choose to set a default role here
    }, {
      validator: this.mustMatch('password', 'confirmPassword')
    });

    // Clear server errors when user starts typing
    this.signUpForm.valueChanges.subscribe(() => {
      if (this.serverErrors.length > 0) {
        this.serverErrors = [];
      }
    });
  }

  get f() {
    return this.signUpForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.serverErrors = []; // Clear previous server errors

    if (this.signUpForm.invalid) {
      return;
    }

    const username = this.f['username'].value;
    const email = this.f['email'].value;
    const password = this.f['password'].value;
    const role = this.f['role'].value;

    const userData = {
      username,
      email,
      password,
      roles: [role]
    };

    this.authService.register(userData).subscribe({
      next: () => {
        // Display success SweetAlert2 popup
        Swal.fire({
          icon: 'success',
          title: 'Registration Successful!',
          text: 'User has been registered successfully!',
          confirmButtonText: 'OK',
          timer: 3000
        }).then(() => {
          // Navigate after the success message
          this.router.navigate(['/config/users']);
        });
      },
      error: (err) => {
        console.error('Registration failed', err);
        
        // Handle different error response structures
        if (err.error && err.error.errors && Array.isArray(err.error.errors)) {
          // Server returned structured errors
          this.serverErrors = err.error.errors;
          this.displayStructuredErrors(err.error.message || 'Registration Failed', this.serverErrors);
        } else if (err.error && err.error.message) {
          // Server returned a simple error message
          this.displaySimpleError('Registration Failed', err.error.message);
        } else if (err.message) {
          // HTTP error with message
          this.displaySimpleError('Registration Failed', err.message);
        } else {
          // Fallback error
          this.displaySimpleError('Registration Failed', 'An error occurred during registration. Please try again later.');
        }
      }
    });
  }

  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  /**
   * Display structured errors with detailed descriptions
   */
  displayStructuredErrors(title: string, errors: ServerError[]) {
    const errorMessages = errors.map(error => 
      `</strong> ${error.description}`
    ).join('<br>');

    Swal.fire({
      icon: 'error',
      title: title,
      html: errorMessages,
      confirmButtonText: 'OK',
    });
  }

  /**
   * Display simple error message
   */
  displaySimpleError(title: string, message: string) {
    Swal.fire({
      icon: 'error',
      title: title,
      text: message,
      confirmButtonText: 'OK',
    });
  }

  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: UntypedFormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        return;
      }

      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }
}
