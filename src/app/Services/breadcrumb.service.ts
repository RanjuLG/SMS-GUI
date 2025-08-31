import { Injectable } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { BehaviorSubject, filter, map } from 'rxjs';
import { BreadcrumbItem } from '../shared/components/breadcrumb/breadcrumb.component';

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  private breadcrumbsSubject = new BehaviorSubject<BreadcrumbItem[]>([]);
  public breadcrumbs$ = this.breadcrumbsSubject.asObservable();

  // Route to breadcrumb mapping for simple routes
  private routeMap: { [key: string]: BreadcrumbItem } = {
    'overview': { label: 'Overview', route: '/overview', icon: 'ri-dashboard-line' },
    'customers': { label: 'Customers', route: '/customers', icon: 'ri-user-3-line' },
    'items': { label: 'Inventory', route: '/items', icon: 'ri-archive-line' },
    'transaction-history': { label: 'Transactions', route: '/transaction-history', icon: 'ri-exchange-line' },
    'invoices': { label: 'Invoices', route: '/invoices', icon: 'ri-file-list-3-line' },
    'cash-balance': { label: 'Cash Balance', route: '/cash-balance', icon: 'ri-wallet-3-line' },
    'reports': { label: 'Reports', route: '/reports', icon: 'ri-file-chart-line' },
    'profile': { label: 'Profile', route: '/profile', icon: 'ri-user-line' },
    'auth': { label: 'Authentication', route: '/auth', icon: 'ri-shield-line' },
    'sign-in': { label: 'Sign In', route: '/auth/sign-in', icon: 'ri-login-box-line' },
    'register': { label: 'Register', route: '/auth/register', icon: 'ri-user-add-line' },
    'sign-up': { label: 'Sign Up', route: '/auth/sign-up', icon: 'ri-user-add-line' },
    'unauthorized': { label: 'Unauthorized', route: '/unauthorized', icon: 'ri-error-warning-line' }
  };

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.buildBreadcrumbs())
      )
      .subscribe(breadcrumbs => {
        this.breadcrumbsSubject.next(breadcrumbs);
      });
  }

  private buildBreadcrumbs(): BreadcrumbItem[] {
    const url = this.router.url;
    const urlSegments = url.split('/').filter(segment => segment);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Always start with Home
    breadcrumbs.push({ label: 'Home', route: '/overview', icon: 'ri-home-4-line' });

    // Handle special hierarchical routes
    if (url.includes('/create-invoice')) {
      breadcrumbs.push({ label: 'Invoices', route: '/invoices', icon: 'ri-file-list-3-line' });
      breadcrumbs.push({ label: 'Create Invoice', route: '/create-invoice', icon: 'ri-file-add-line' });
      return breadcrumbs;
    }

    if (url.includes('/customers/create-customer')) {
      breadcrumbs.push({ label: 'Customers', route: '/customers', icon: 'ri-user-3-line' });
      breadcrumbs.push({ label: 'Add Customer', route: '/customers/create-customer', icon: 'ri-user-add-line' });
      return breadcrumbs;
    }

    if (url.includes('/reports/by-customer')) {
      breadcrumbs.push({ label: 'Reports', route: '/reports', icon: 'ri-file-chart-line' });
      breadcrumbs.push({ label: 'Customer Reports', route: '/reports/by-customer', icon: 'ri-user-search-line' });
      return breadcrumbs;
    }

    if (url.includes('/reports/transactions')) {
      breadcrumbs.push({ label: 'Reports', route: '/reports', icon: 'ri-file-chart-line' });
      breadcrumbs.push({ label: 'Transaction Reports', route: '/reports/transactions', icon: 'ri-line-chart-line' });
      return breadcrumbs;
    }

    if (url.includes('/config/users')) {
      breadcrumbs.push({ label: 'Configuration', route: '/config', icon: 'ri-tools-line' });
      breadcrumbs.push({ label: 'User Management', route: '/config/users', icon: 'ri-shield-user-line' });
      return breadcrumbs;
    }

    if (url.includes('/config/pricings')) {
      breadcrumbs.push({ label: 'Configuration', route: '/config', icon: 'ri-tools-line' });
      breadcrumbs.push({ label: 'Pricing Settings', route: '/config/pricings', icon: 'ri-price-tag-3-line' });
      return breadcrumbs;
    }

    if (url.includes('/view-invoice-template/')) {
      breadcrumbs.push({ label: 'Invoices', route: '/invoices', icon: 'ri-file-list-3-line' });
      breadcrumbs.push({ label: 'Invoice Details', route: url, icon: 'ri-file-text-line' });
      return breadcrumbs;
    }

    if (url.includes('/view-installment-invoice-template/')) {
      breadcrumbs.push({ label: 'Invoices', route: '/invoices', icon: 'ri-file-list-3-line' });
      breadcrumbs.push({ label: 'Installment Invoice', route: url, icon: 'ri-file-list-line' });
      return breadcrumbs;
    }

    if (url.includes('/view-settlement-invoice-template/')) {
      breadcrumbs.push({ label: 'Invoices', route: '/invoices', icon: 'ri-file-list-3-line' });
      breadcrumbs.push({ label: 'Settlement Invoice', route: url, icon: 'ri-file-check-line' });
      return breadcrumbs;
    }

    // Default processing for simple routes
    let currentPath = '';
    for (let i = 0; i < urlSegments.length; i++) {
      const segment = urlSegments[i];
      currentPath += '/' + segment;

      // Handle special cases for dynamic routes
      if (this.isDynamicSegment(segment)) {
        const dynamicLabel = this.getDynamicLabel(segment, currentPath);
        if (dynamicLabel) {
          breadcrumbs.push(dynamicLabel);
        }
        continue;
      }

      // Look up the segment in our route map
      const breadcrumbItem = this.routeMap[segment];
      if (breadcrumbItem) {
        breadcrumbs.push({
          ...breadcrumbItem,
          route: currentPath
        });
      } else {
        // Fallback for unmapped routes
        breadcrumbs.push({
          label: this.formatSegmentLabel(segment),
          route: currentPath,
          icon: 'ri-arrow-right-s-line'
        });
      }
    }

    return breadcrumbs;
  }

  private isDynamicSegment(segment: string): boolean {
    // Check if the segment looks like a dynamic parameter (ID, etc.)
    return /^[0-9a-f-]{8,}$/i.test(segment) || /^\d+$/.test(segment);
  }

  private getDynamicLabel(segment: string, currentPath: string): BreadcrumbItem | null {
    // Handle different types of dynamic routes
    if (currentPath.includes('/view-invoice-template/')) {
      return { label: 'Invoice Details', route: currentPath, icon: 'ri-file-text-line' };
    }
    if (currentPath.includes('/view-installment-invoice-template/')) {
      return { label: 'Installment Invoice', route: currentPath, icon: 'ri-file-list-line' };
    }
    if (currentPath.includes('/view-settlement-invoice-template/')) {
      return { label: 'Settlement Invoice', route: currentPath, icon: 'ri-file-check-line' };
    }
    
    return null;
  }

  private formatSegmentLabel(segment: string): string {
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Method to manually set breadcrumbs if needed
  setBreadcrumbs(breadcrumbs: BreadcrumbItem[]): void {
    this.breadcrumbsSubject.next(breadcrumbs);
  }

  // Method to add a breadcrumb item
  addBreadcrumb(item: BreadcrumbItem): void {
    const currentBreadcrumbs = this.breadcrumbsSubject.value;
    this.breadcrumbsSubject.next([...currentBreadcrumbs, item]);
  }

  // Method to clear breadcrumbs
  clearBreadcrumbs(): void {
    this.breadcrumbsSubject.next([]);
  }
}
