import { ChangeDetectorRef, Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Location } from '@angular/common';
import { AuthService } from '../../Services/auth.service';
import { ThemeService } from '../../Services/theme.service';
import { CashierModeService } from '../../Services/cashier-mode.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddCustomerComponent } from '../helpers/customer/add-customer/add-customer.component';
import { ExtendedCustomerDto } from '../customer-form/customer-form.component';
import { ExtendedItemDto } from '../item-form/item-form.component';
import { AddItemComponent } from '../helpers/items/add-item/add-item.component';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

interface SearchablePage {
  title: string;
  description: string;
  route: string;
  icon: string;
  keywords: string[];
}

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit, OnDestroy {
  @Input() sidebarExpanded: boolean = true;
  @Output() sidebarToggle = new EventEmitter<boolean>();

  currentTheme: 'light' | 'dark' = 'light';
  private themeSubscription?: Subscription;
  private cashierModeSubscription?: Subscription;
  
  // Cashier mode state
  isCashierMode: boolean = false;
  cashierNavItems: any[] = [];

  // Search properties
  searchQuery: string = '';
  showSearchResults: boolean = false;
  searchResults: SearchablePage[] = [];
  filteredPages: SearchablePage[] = [];
  selectedResultIndex: number = -1;

  // Available pages for search
  allPages: SearchablePage[] = [];

  // Popular/frequently used pages
  popularPages: SearchablePage[] = [];

  private getFullSearchPages(): SearchablePage[] {
    return [
      {
        title: 'Dashboard',
        description: 'Overview and analytics',
        route: '/overview',
        icon: 'ri-dashboard-line',
        keywords: ['dashboard', 'overview', 'home', 'analytics', 'stats', 'summary']
      },
      {
        title: 'Cashier Mode',
        description: 'Simplified cashier interface',
        route: '/cashier',
        icon: 'ri-calculator-line',
        keywords: ['cashier', 'simple', 'quick', 'essential', 'simplified', 'pos']
      },
      {
        title: 'Create Invoice',
        description: 'Create new loan invoice',
        route: '/create-invoice',
        icon: 'ri-file-add-line',
        keywords: ['invoice', 'create', 'new', 'loan', 'bill']
      },
      {
        title: 'Invoices',
        description: 'View all invoices',
        route: '/invoices',
        icon: 'ri-file-list-line',
        keywords: ['invoices', 'bills', 'loans', 'list']
      },
      {
        title: 'Customers',
        description: 'Manage customer profiles',
        route: '/customers',
        icon: 'ri-user-line',
        keywords: ['customers', 'clients', 'people', 'users', 'profiles']
      },
      {
        title: 'Items',
        description: 'Manage jewelry inventory',
        route: '/items',
        icon: 'ri-archive-line',
        keywords: ['items', 'inventory', 'jewelry', 'gold', 'products', 'stock']
      },
      {
        title: 'Transaction History',
        description: 'View all transactions',
        route: '/transaction-history',
        icon: 'ri-exchange-line',
        keywords: ['transactions', 'history', 'payments', 'records']
      },
      {
        title: 'Reports',
        description: 'Generate reports and analytics',
        route: '/reports',
        icon: 'ri-file-chart-line',
        keywords: ['reports', 'analytics', 'charts', 'statistics', 'data']
      },
      {
        title: 'Customer Reports',
        description: 'Customer-specific reports',
        route: '/reports/by-customer',
        icon: 'ri-user-search-line',
        keywords: ['customer reports', 'client reports', 'individual reports']
      },
      {
        title: 'Income Reports',
        description: 'Revenue and income analytics',
        route: '/reports/income',
        icon: 'ri-money-dollar-circle-line',
        keywords: ['income', 'revenue', 'earnings', 'profit', 'financial']
      },
      {
        title: 'Invoice Reports',
        description: 'Invoice analytics and trends',
        route: '/reports/invoice',
        icon: 'ri-file-chart-line',
        keywords: ['invoice reports', 'billing reports', 'loan reports']
      },
      {
        title: 'Pricing',
        description: 'Manage gold rates and pricing',
        route: '/pricing',
        icon: 'ri-price-tag-3-line',
        keywords: ['pricing', 'rates', 'gold rates', 'karats', 'valuation']
      },
      {
        title: 'User Management',
        description: 'Manage system users',
        route: '/user-management',
        icon: 'ri-team-line',
        keywords: ['users', 'management', 'staff', 'employees', 'access']
      },
      {
        title: 'Configuration',
        description: 'System settings and configuration',
        route: '/configuration',
        icon: 'ri-settings-3-line',
        keywords: ['settings', 'configuration', 'setup', 'preferences', 'admin']
      },
      {
        title: 'Profile',
        description: 'User profile and settings',
        route: '/profile',
        icon: 'ri-user-settings-line',
        keywords: ['profile', 'account', 'personal', 'settings']
      }
    ];
  }

  private getCashierSearchPages(): SearchablePage[] {
    return [
      {
        title: 'Cashier Dashboard',
        description: 'Simplified cashier interface',
        route: '/cashier',
        icon: 'ri-dashboard-line',
        keywords: ['cashier', 'dashboard', 'home', 'pos', 'simplified']
      },
      {
        title: 'Create Invoice',
        description: 'Create new loan invoice',
        route: '/create-invoice',
        icon: 'ri-file-add-line',
        keywords: ['invoice', 'create', 'new', 'loan', 'bill']
      },
      {
        title: 'Invoices',
        description: 'View all invoices',
        route: '/invoices',
        icon: 'ri-file-list-line',
        keywords: ['invoices', 'bills', 'loans', 'list']
      },
      {
        title: 'Customers',
        description: 'Manage customer profiles',
        route: '/customers',
        icon: 'ri-user-line',
        keywords: ['customers', 'clients', 'people', 'users', 'profiles']
      },
      {
        title: 'Inventory',
        description: 'Manage jewelry inventory',
        route: '/items',
        icon: 'ri-archive-line',
        keywords: ['items', 'inventory', 'jewelry', 'gold', 'products', 'stock']
      }
    ];
  }

  constructor(
    private location: Location,
    private router: Router,
    private authService: AuthService,
    private themeService: ThemeService,
    private cashierModeService: CashierModeService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef
  ) {
    // Initialize search pages
    this.allPages = this.getFullSearchPages();
  }

  ngOnInit() {
    // Subscribe to theme changes
    this.themeSubscription = this.themeService.currentTheme$.subscribe(theme => {
      this.currentTheme = theme;
      this.cdr.markForCheck();
    });

    // Subscribe to cashier mode changes
    this.cashierModeSubscription = this.cashierModeService.isCashierMode$.subscribe(isCashierMode => {
      this.isCashierMode = isCashierMode;
      if (isCashierMode) {
        this.cashierNavItems = this.cashierModeService.getCashierNavItems();
        // Update search results to only show cashier-relevant pages
        this.allPages = this.getCashierSearchPages();
      } else {
        this.cashierNavItems = [];
        // Restore full search pages
        this.allPages = this.getFullSearchPages();
      }
      this.cdr.markForCheck();
    });

    // Set popular pages (most commonly used)
    this.popularPages = [
      this.allPages.find(p => p.route === '/cashier')!,
      this.allPages.find(p => p.route === '/overview')!,
      this.allPages.find(p => p.route === '/create-invoice')!,
      this.allPages.find(p => p.route === '/customers')!,
      this.allPages.find(p => p.route === '/invoices')!,
      this.allPages.find(p => p.route === '/transaction-history')!
    ].filter(Boolean);
  }

  ngOnDestroy() {
    this.themeSubscription?.unsubscribe();
    this.cashierModeSubscription?.unsubscribe();
  }

  // Methods to navigate
  goBack() {
    this.location.back();
  }

  goForward() {
    this.location.forward();
  }

  // Method to handle logout
  signOut() {
    try {
      this.authService.logout();
      Swal.fire('Logout Successful', 'You have logged out successfully.', 'success').then(() => {
        this.router.navigate(['/auth/sign-in']);
      });
    } catch (error) {
      Swal.fire('Logout Error', 'An issue occurred while logging out. Please try again.', 'error');
    }
  }

  // Open add customer modal
  openAddCustomerModal(): void {
    const modalRef = this.modalService.open(AddCustomerComponent, { size: 'lg' });
    modalRef.componentInstance.saveCustomer.subscribe((customer: ExtendedCustomerDto) => {
      this.cdr.markForCheck();
      Swal.fire('Added!', 'Customer has been added.', 'success');
    });
  }

  // Open add item modal
  openAddItemModal(): void {
    const modalRef = this.modalService.open(AddItemComponent, { size: 'lg' });
    modalRef.componentInstance.saveItem.subscribe((item: ExtendedItemDto) => {
      this.cdr.markForCheck();
      Swal.fire('Added!', 'Item has been added.', 'success');
    });
  }

  // Toggle sidebar expansion
  toggleSidebar() {
    const newState = !this.sidebarExpanded;
    this.sidebarToggle.emit(newState);
    
    // Force update of mobile state for better responsiveness
    setTimeout(() => {
      // Add haptic feedback for mobile devices
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }, 10);
  }

  // Toggle theme
  toggleTheme() {
    this.themeService.toggleTheme();
  }

  // Toggle cashier mode
  toggleCashierMode() {
    this.cashierModeService.toggleCashierMode();
  }

  // Get current user info
  getCurrentUser() {
    return {
      name: this.authService.getUserName() || 'User',
      email: 'user@example.com', // You might want to add getEmail() to AuthService if available
      role: this.authService.currentUserRole || 'User',
      avatar: 'assets/images/user-avatar.png' // Use a generic avatar or one based on user
    };
  }

  // Search functionality
  onSearchInput(event: any): void {
    const query = event.target.value.toLowerCase().trim();
    this.searchQuery = query;
    
    if (query.length === 0) {
      this.filteredPages = [];
      this.selectedResultIndex = -1;
      return;
    }

    // Filter pages based on search query
    this.filteredPages = this.allPages.filter(page => {
      const searchFields = [
        page.title.toLowerCase(),
        page.description.toLowerCase(),
        ...page.keywords.map(k => k.toLowerCase())
      ];
      
      return searchFields.some(field => field.includes(query));
    }).slice(0, 8); // Limit to 8 results

    this.selectedResultIndex = -1;
  }

  onSearchKeydown(event: KeyboardEvent): void {
    const visibleResults = this.searchQuery.length > 0 ? this.filteredPages : this.popularPages;
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedResultIndex = Math.min(this.selectedResultIndex + 1, visibleResults.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedResultIndex = Math.max(this.selectedResultIndex - 1, -1);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.selectedResultIndex >= 0 && this.selectedResultIndex < visibleResults.length) {
          this.navigateToPage(visibleResults[this.selectedResultIndex].route);
        }
        break;
      case 'Escape':
        this.clearSearch();
        break;
    }
  }

  navigateToPage(route: string): void {
    this.router.navigate([route]);
    this.clearSearch();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filteredPages = [];
    this.selectedResultIndex = -1;
    this.showSearchResults = false;
  }

  hideSearchResults(): void {
    // Add a small delay to allow click events to fire
    setTimeout(() => {
      this.showSearchResults = false;
    }, 150);
  }
}
