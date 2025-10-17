import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CashierModeService {
  private readonly CASHIER_MODE_KEY = 'cashierMode';
  private cashierModeSubject = new BehaviorSubject<boolean>(false);

  constructor(private router: Router) {
    // Initialize from localStorage
    const savedMode = localStorage.getItem(this.CASHIER_MODE_KEY);
    if (savedMode !== null) {
      this.cashierModeSubject.next(JSON.parse(savedMode));
    }
  }

  /**
   * Observable to track cashier mode state changes
   */
  get isCashierMode$(): Observable<boolean> {
    return this.cashierModeSubject.asObservable();
  }

  /**
   * Get current cashier mode state
   */
  get isCashierMode(): boolean {
    return this.cashierModeSubject.value;
  }

  /**
   * Enable cashier mode (with navigation)
   */
  enableCashierMode(): void {
    this.setCashierMode(true, true);
  }

  /**
   * Disable cashier mode (with navigation)
   */
  disableCashierMode(): void {
    this.setCashierMode(false, true);
  }

  /**
   * Toggle cashier mode (with navigation)
   */
  toggleCashierMode(): void {
    this.setCashierMode(!this.isCashierMode, true);
  }

  /**
   * Enable cashier mode without navigation (for internal state management)
   */
  enableCashierModeQuiet(): void {
    this.setCashierMode(true, false);
  }

  /**
   * Disable cashier mode without navigation (for internal state management)
   */
  disableCashierModeQuiet(): void {
    this.setCashierMode(false, false);
  }

  /**
   * Set cashier mode state
   */
  private setCashierMode(enabled: boolean, navigate: boolean = true): void {
    this.cashierModeSubject.next(enabled);
    localStorage.setItem(this.CASHIER_MODE_KEY, JSON.stringify(enabled));
    
    // Only navigate if explicitly requested
    if (navigate) {
      if (enabled) {
        this.router.navigate(['/cashier']);
      } else {
        this.router.navigate(['/overview']);
      }
    }
  }

  /**
   * Check if current route is cashier-related
   */
  isCurrentRouteCashierRelated(): boolean {
    const currentUrl = this.router.url;
    return currentUrl.includes('/cashier') || 
           currentUrl.includes('/create-invoice') || 
           currentUrl.includes('/customers') || 
           currentUrl.includes('/items') ||
           currentUrl.includes('/invoices');
  }

  /**
   * Get simplified menu items for cashier mode
   */
  getCashierMenuItems() {
    return [
      {
        label: 'Dashboard',
        icon: 'ri-dashboard-line',
        route: '/cashier',
        description: 'Cashier overview'
      },
      {
        label: 'Create Invoice',
        icon: 'ri-file-add-line',
        route: '/create-invoice',
        description: 'Create new loan invoice'
      },
      {
        label: 'Invoices',
        icon: 'ri-file-list-line',
        route: '/invoices',
        description: 'View all invoices'
      },
      {
        label: 'Customers',
        icon: 'ri-user-line',
        route: '/customers',
        description: 'Manage customers'
      },
      {
        label: 'Inventory',
        icon: 'ri-archive-line',
        route: '/items',
        description: 'Manage jewelry inventory'
      }
    ];
  }

  /**
   * Get cashier navigation items for navbar
   */
  getCashierNavItems() {
    return [
      {
        title: 'Dashboard',
        route: '/cashier',
        icon: 'ri-dashboard-line'
      },
      {
        title: 'Invoice',
        route: '/create-invoice',
        icon: 'ri-file-add-line'
      },
      {
        title: 'Customers',
        route: '/customers',
        icon: 'ri-user-line'
      },
      {
        title: 'Inventory',
        route: '/items',
        icon: 'ri-archive-line'
      }
    ];
  }
}