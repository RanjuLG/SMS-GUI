import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from "./Components/nav-bar/nav-bar.component";
import { FooterComponent } from './Components/footer/footer.component';
import { AuthService } from './Services/auth.service';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './Components/sidebar/sidebar/sidebar.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavBarComponent,FooterComponent,CommonModule,SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'SMS';

  isLoggedIn = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn;
    console.log("this.isLoggedIn: ",this.isLoggedIn)
    this.authService.authStatus.subscribe((status: boolean) => {
      this.isLoggedIn = status;
      
    });
  }
  
}
