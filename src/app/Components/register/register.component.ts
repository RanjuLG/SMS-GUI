import { Component } from '@angular/core';
import { AuthService } from '../../Services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  username = '';
  email = '';
  password = '';
  role = 'Cashier';  // Default to Cashier role

  constructor(private authService: AuthService) {}

  register() {
    this.authService.register(this.username, this.email, this.password, this.role).subscribe();
  }
}
