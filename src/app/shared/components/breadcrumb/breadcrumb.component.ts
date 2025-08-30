import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav aria-label="breadcrumb" class="mb-4">
      <ol class="breadcrumb bg-light rounded-3 p-3 mb-0">
        <li 
          *ngFor="let item of items; let last = last" 
          class="breadcrumb-item"
          [class.active]="last">
          <a 
            *ngIf="!last && item.route" 
            [routerLink]="item.route"
            class="text-decoration-none">
            <i *ngIf="item.icon" [class]="item.icon + ' me-1'"></i>
            {{ item.label }}
          </a>
          <span *ngIf="last">
            <i *ngIf="item.icon" [class]="item.icon + ' me-1'"></i>
            {{ item.label }}
          </span>
        </li>
      </ol>
    </nav>
  `,
  styles: [`
    .breadcrumb {
      font-size: 0.875rem;
      margin-bottom: 1.5rem;
    }

    .breadcrumb-item a {
      color: #6b7280;
      transition: color 0.15s ease-in-out;
    }

    .breadcrumb-item a:hover {
      color: #3b82f6;
    }

    .breadcrumb-item.active {
      color: #374151;
      font-weight: 500;
    }
  `]
})
export class BreadcrumbComponent {
  @Input() items: BreadcrumbItem[] = [];
}

export interface BreadcrumbItem {
  label: string;
  route?: string;
  icon?: string;
}
