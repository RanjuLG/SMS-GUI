import { Component, Input, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BreadcrumbService } from '../../../Services/breadcrumb.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav aria-label="breadcrumb" class="mb-4" *ngIf="displayItems.length > 1">
      <ol class="breadcrumb bg-light rounded-3 p-3 mb-0 shadow-sm">
        <li 
          *ngFor="let item of displayItems; let last = last" 
          class="breadcrumb-item"
          [class.active]="last">
          <a 
            *ngIf="!last && item.route" 
            [routerLink]="item.route"
            class="text-decoration-none breadcrumb-link">
            <i *ngIf="item.icon" [class]="item.icon + ' me-1'"></i>
            {{ item.label }}
          </a>
          <span *ngIf="last" class="breadcrumb-current">
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
      border: 1px solid #e5e7eb;
    }

    .breadcrumb-link {
      color: #6b7280;
      transition: all 0.15s ease-in-out;
      text-decoration: none !important;
    }

    .breadcrumb-link:hover {
      color: #3b82f6;
      text-decoration: none !important;
    }

    .breadcrumb-current {
      color: #374151;
      font-weight: 500;
    }

    .breadcrumb-item.active {
      color: #374151;
      font-weight: 500;
    }

    .breadcrumb-item + .breadcrumb-item::before {
      content: var(--bs-breadcrumb-divider, ">") !important;
      color: #9ca3af;
    }

    .shadow-sm {
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
    }
  `]
})
export class BreadcrumbComponent implements OnInit, OnDestroy, OnChanges {
  @Input() items: BreadcrumbItem[] = [];
  @Input() autoGenerate: boolean = true; // New input to control auto-generation
  
  displayItems: BreadcrumbItem[] = [];
  private breadcrumbSubscription?: Subscription;

  constructor(private breadcrumbService: BreadcrumbService) {}

  ngOnInit() {
    if (this.autoGenerate) {
      // Use auto-generated breadcrumbs from service
      this.breadcrumbSubscription = this.breadcrumbService.breadcrumbs$.subscribe(
        breadcrumbs => {
          this.displayItems = breadcrumbs;
        }
      );
    } else {
      // Use manually provided items
      this.displayItems = this.items;
    }
  }

  ngOnDestroy() {
    this.breadcrumbSubscription?.unsubscribe();
  }

  // Update items when input changes
  ngOnChanges() {
    if (!this.autoGenerate) {
      this.displayItems = this.items;
    }
  }
}

export interface BreadcrumbItem {
  label: string;
  route?: string;
  icon?: string;
}
