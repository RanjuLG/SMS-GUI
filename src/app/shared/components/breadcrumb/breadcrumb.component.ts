import { Component, Input, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BreadcrumbService } from '../../../Services/breadcrumb.service';
import { ThemeService } from '../../../Services/theme.service';
import { CashierModeService } from '../../../Services/cashier-mode.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav aria-label="breadcrumb" class="mb-4" *ngIf="displayItems.length > 1">
      <ol class="breadcrumb rounded-3 p-3 mb-0 shadow-sm" 
          [ngClass]="{
            'breadcrumb-dark': isDarkMode, 
            'breadcrumb-light': !isDarkMode,
            'breadcrumb-cashier': isCashierMode
          }">
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
      border: 1px solid var(--border-color);
      background-color: var(--secondary-bg) !important;
      transition: background-color 0.3s ease, border-color 0.3s ease;
    }

    .breadcrumb-dark {
      background-color: var(--secondary-bg) !important;
      border-color: var(--border-color) !important;
    }

    .breadcrumb-light {
      background-color: var(--secondary-bg) !important;
      border-color: var(--border-color) !important;
    }

    .breadcrumb-link {
      color: var(--brand-primary) !important;
      transition: all 0.15s ease-in-out;
      text-decoration: none !important;
    }

    .breadcrumb-link:hover {
      color: var(--brand-primary) !important;
      opacity: 0.8;
      text-decoration: none !important;
    }

    .breadcrumb-current {
      color: var(--primary-text) !important;
      font-weight: 500;
    }

    .breadcrumb-item {
      color: var(--secondary-text) !important;
    }

    .breadcrumb-item.active {
      color: var(--primary-text) !important;
      font-weight: 500;
    }

    .breadcrumb-item + .breadcrumb-item::before {
      content: var(--bs-breadcrumb-divider, ">") !important;
      color: var(--secondary-text) !important;
    }

    .shadow-sm {
      box-shadow: 0 1px 2px 0 var(--shadow) !important;
    }

    /* Cashier mode specific styles */
    .breadcrumb-cashier {
      background: linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(247, 147, 30, 0.1)) !important;
      border-left: 4px solid #ff6b35 !important;
      border-color: rgba(255, 107, 53, 0.3) !important;
    }

    .breadcrumb-cashier .breadcrumb-link {
      color: #ff4500 !important;
      font-weight: 500;
    }

    .breadcrumb-cashier .breadcrumb-link:hover {
      color: #ff6b35 !important;
    }

    .breadcrumb-cashier .breadcrumb-current {
      color: #ff4500 !important;
      font-weight: 600;
    }

    .breadcrumb-cashier .breadcrumb-item + .breadcrumb-item::before {
      color: #ff6b35 !important;
      font-weight: bold;
    }
  `]
})
export class BreadcrumbComponent implements OnInit, OnDestroy, OnChanges {
  @Input() items: BreadcrumbItem[] = [];
  @Input() autoGenerate: boolean = true; // New input to control auto-generation
  
  displayItems: BreadcrumbItem[] = [];
  isDarkMode = false;
  isCashierMode = false;
  private breadcrumbSubscription?: Subscription;
  private themeSubscription?: Subscription;
  private cashierModeSubscription?: Subscription;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private themeService: ThemeService,
    private cashierModeService: CashierModeService
  ) {}

  ngOnInit() {
    // Subscribe to theme changes
    this.themeSubscription = this.themeService.currentTheme$.subscribe(theme => {
      this.isDarkMode = theme === 'dark';
    });

    // Subscribe to cashier mode changes
    this.cashierModeSubscription = this.cashierModeService.isCashierMode$.subscribe(isCashierMode => {
      this.isCashierMode = isCashierMode;
    });

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
    this.themeSubscription?.unsubscribe();
    this.cashierModeSubscription?.unsubscribe();
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
