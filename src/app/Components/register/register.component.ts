import { Component } from '@angular/core';
import { AuthService } from '../../Services/auth.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  username = '';
  email = '';
  password = '';
  role = 'Cashier';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    const userData = {
      username: this.username,
      email: this.email,
      password: this.password,
      roles: [this.role]
    };
    this.authService.register(userData).subscribe({
      next: () => this.router.navigate(['/auth/sign-in']),
      error: (err) => console.error(err),
    });
  }
}
