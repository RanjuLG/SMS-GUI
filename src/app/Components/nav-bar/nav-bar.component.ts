import { Component } from '@angular/core';
import { RouterLink,RouterLinkActive } from '@angular/router';
import { BreadcrumbComponent } from '../helpers/breadcrumb/breadcrumb.component';
import { Location } from '@angular/common';
@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterLink,BreadcrumbComponent,RouterLinkActive],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss'
})
export class NavBarComponent {

  constructor(private location: Location) { }

  goBack() {
    this.location.back(); 
      
  }
  goForward() {
    this.location.forward(); 
      
  }
  

}
