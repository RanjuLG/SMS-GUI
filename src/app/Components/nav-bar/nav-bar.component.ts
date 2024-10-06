import { ChangeDetectorRef, Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive,RouterOutlet } from '@angular/router';
import { Location } from '@angular/common';
import { AuthService } from '../../Services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddCustomerComponent } from '../helpers/customer/add-customer/add-customer.component';
import { ExtendedCustomerDto } from '../customer-form/customer-form.component';
import { ExtendedItemDto } from '../item-form/item-form.component';
import { AddItemComponent } from '../helpers/items/add-item/add-item.component';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule,RouterOutlet],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent {
  // Add state to track if the sidebar is expanded
  isSidebarExpanded: boolean = false;

  constructor(
    private location: Location,
    private router: Router,
    private authService: AuthService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef
  ) {}

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
    this.isSidebarExpanded = !this.isSidebarExpanded;
  }

  // Collapse the sidebar when the mouse leaves
  collapseSidebar() {
    this.isSidebarExpanded = false;
  }

  // Placeholder method for theme toggle
  toggleTheme() {
    console.log('Theme toggled');
  }
}
