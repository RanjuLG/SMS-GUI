import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../Services/auth.service';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

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
  }

  get f() {
    return this.signUpForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    if (this.signUpForm.invalid) {
      return;
    }

    const username = this.f['username'].value;
    const email = this.f['email'].value;
    const password = this.f['password'].value;
    const role = this.f['role'].value;

    this.authService.register(username, email, password, role).subscribe({
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
        // Display error SweetAlert2 popup
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: 'An error occurred during registration. Please try again later.',
          confirmButtonText: 'OK',
        });
        console.error('Registration failed', err.errors);  // Optional logging
      }
    });
  }

  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
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
