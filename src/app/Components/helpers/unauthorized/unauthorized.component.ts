import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './unauthorized.component.html',
  styleUrl: './unauthorized.component.scss'
})
export class UnauthorizedComponent {

  constructor(
    private location: Location,
    private router: Router
  ) {}

  goBack(): void {
    this.location.back();
  }
}
