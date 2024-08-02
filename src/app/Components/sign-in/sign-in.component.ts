import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})
export class SignInComponent implements OnInit {

// Login Form
loginForm!: UntypedFormGroup;
submitted = false;
fieldTextType!: boolean;
error = '';
returnUrl!: string;
// set the current year
year: number = new Date().getFullYear();

constructor(private formBuilder: UntypedFormBuilder) { }

ngOnInit(): void {
  /**
   * Form Validatyion
   */
   this.loginForm = this.formBuilder.group({
    name: ['', [Validators.required]],
    password: ['', Validators.required],
  });
}

// convenience getter for easy access to form fields
get f() { return this.loginForm.controls; }

/**
 * Form submit
 */
 onSubmit() {
  this.submitted = true;

  // stop here if form is invalid
  if (this.loginForm.invalid) {
    return;
  }
}

/**
 * Password Hide/Show
 */
 toggleFieldTextType() {
  this.fieldTextType = !this.fieldTextType;
}

}
