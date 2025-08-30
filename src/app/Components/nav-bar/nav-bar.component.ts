import { ChangeDetectorRef, Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Location } from '@angular/common';
import { AuthService } from '../../Services/auth.service';
import { ThemeService } from '../../Services/theme.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddCustomerComponent } from '../helpers/customer/add-customer/add-customer.component';
import { ExtendedCustomerDto } from '../customer-form/customer-form.component';
import { ExtendedItemDto } from '../item-form/item-form.component';
import { AddItemComponent } from '../helpers/items/add-item/add-item.component';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit, OnDestroy {
  @Input() sidebarExpanded: boolean = true;
  @Output() sidebarToggle = new EventEmitter<boolean>();

  currentTheme: 'light' | 'dark' = 'light';
  private themeSubscription?: Subscription;

  constructor(
    private location: Location,
    private router: Router,
    private authService: AuthService,
    private themeService: ThemeService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Subscribe to theme changes
    this.themeSubscription = this.themeService.currentTheme$.subscribe(theme => {
      this.currentTheme = theme;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.themeSubscription?.unsubscribe();
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
  }

  // Toggle theme
  toggleTheme() {
    this.themeService.toggleTheme();
  }

  // Get current user info (you can implement this based on your auth service)
  getCurrentUser() {
    return {
      name: 'Current User',
      email: 'user@example.com',
      avatar: 'nav-bar/user-logo.png'
    };
  }
}
