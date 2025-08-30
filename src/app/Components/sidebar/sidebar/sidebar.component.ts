import { ChangeDetectorRef, Component, AfterViewInit, Renderer2, ElementRef, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { AuthService } from '../../../Services/auth.service';
import { ThemeService } from '../../../Services/theme.service';
import { Subscription } from 'rxjs';
declare var bootstrap: any;
import { ExtendedItemDto } from '../../item-form/item-form.component';
import { AddItemComponent } from '../../helpers/items/add-item/add-item.component';
import { AddCustomerComponent } from '../../helpers/customer/add-customer/add-customer.component';
import { ExtendedCustomerDto } from '../../customer-form/customer-form.component';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
  action?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input() expanded = true;
  @Output() sidebarToggle = new EventEmitter<boolean>();

  currentTheme: 'light' | 'dark' = 'light';
  private themeSubscription?: Subscription;

  menuItems: MenuItem[] = [
    {
      label: 'Home',
      icon: 'ri-home-2-line',
      route: '/overview'
    },
    {
      label: 'Invoice',
      icon: 'ri-article-line',
      route: '/invoices',
      children: [
        {
          label: 'Create Invoice',
          icon: 'ri-sticky-note-add-line',
          route: '/create-invoice'
        }
      ]
    },
    {
      label: 'Customers',
      icon: 'ri-user-3-line',
      route: '/customers'
    },
    {
      label: 'Inventory',
      icon: 'ri-archive-line',
      route: '/items'
    },
    {
      label: 'Reports',
      icon: 'ri-file-chart-line',
      route: '/reports'
    },
    {
      label: 'Configuration',
      icon: 'ri-tools-line',
      children: [
        {
          label: 'Pricings',
          icon: 'ri-price-tag-3-line',
          route: '/config/pricings'
        },
        {
          label: 'Users',
          icon: 'ri-shield-user-line',
          route: '/config/users'
        }
      ]
    }
  ];

  expandedMenus: Set<string> = new Set();

  constructor(
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private themeService: ThemeService,
    private router: Router,
    private renderer: Renderer2,
    private el: ElementRef
  ) { }

  ngOnInit() {
    // Load expanded state from localStorage
    const savedExpanded = localStorage.getItem('sidebarExpanded');
    if (savedExpanded !== null) {
      this.expanded = JSON.parse(savedExpanded);
    }

    // Subscribe to theme changes
    this.themeSubscription = this.themeService.currentTheme$.subscribe(theme => {
      this.currentTheme = theme;
      this.updateSidebarTheme();
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.themeSubscription?.unsubscribe();
  }

  private updateSidebarTheme() {
    const sidebarElement = this.el.nativeElement.querySelector('.modern-sidebar');
    if (sidebarElement) {
      if (this.currentTheme === 'dark') {
        this.renderer.setAttribute(sidebarElement, 'data-theme', 'dark');
      } else {
        this.renderer.removeAttribute(sidebarElement, 'data-theme');
      }
    }
  }

  ngAfterViewInit(): void {
    const tooltipElements = this.el.nativeElement.querySelectorAll('[data-bs-toggle="tooltip"]');

    tooltipElements.forEach((element: HTMLElement) => {
      // Initialize Bootstrap tooltips manually
      new bootstrap.Tooltip(element, {
        placement: 'right',
        trigger: 'hover'
      });
    });
  }

  toggleSidebar(): void {
    this.expanded = !this.expanded;
    this.sidebarToggle.emit(this.expanded);
    localStorage.setItem('sidebarExpanded', JSON.stringify(this.expanded));
  }

  expandSidebar(): void {
    if (!this.expanded) {
      this.expanded = true;
      this.sidebarToggle.emit(this.expanded);
      localStorage.setItem('sidebarExpanded', JSON.stringify(this.expanded));
    }
  }

  toggleMenu(menuLabel: string): void {
    if (this.expandedMenus.has(menuLabel)) {
      this.expandedMenus.delete(menuLabel);
    } else {
      this.expandedMenus.add(menuLabel);
    }
  }

  navigateAndToggle(route: string, menuLabel: string): void {
    // Navigate to the route
    this.router.navigate([route]);
    // Toggle the submenu if expanded
    if (this.expanded) {
      this.toggleMenu(menuLabel);
    }
  }

  isMenuExpanded(menuLabel: string): boolean {
    return this.expandedMenus.has(menuLabel);
  }

  openAddCustomerModal(): void {
    const modalRef = this.modalService.open(AddCustomerComponent, { size: 'lg' });
    modalRef.componentInstance.saveCustomer.subscribe((customer: ExtendedCustomerDto) => {
      this.cdr.markForCheck();
      Swal.fire('Added!', 'Customer has been added.', 'success');
    });
  }

  openAddItemModal(): void {
    const modalRef = this.modalService.open(AddItemComponent, { size: 'lg' });
    modalRef.componentInstance.saveItem.subscribe((item: ExtendedItemDto) => {
      this.cdr.markForCheck();
      Swal.fire('Added!', 'Item has been added.', 'success');
    });
  }

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
}
