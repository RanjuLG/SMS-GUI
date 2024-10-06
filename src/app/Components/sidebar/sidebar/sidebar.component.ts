import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink,RouterLinkActive } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ExtendedItemDto } from '../../item-form/item-form.component';
import { AddItemComponent } from '../../helpers/items/add-item/add-item.component';
import { AddCustomerComponent } from '../../helpers/customer/add-customer/add-customer.component';
import { ExtendedCustomerDto } from '../../customer-form/customer-form.component';
import Swal from 'sweetalert2';
import { AuthService } from '../../../Services/auth.service';
import { LucideAngularModule} from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule,RouterLink,RouterLinkActive,LucideAngularModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  constructor(private modalService: NgbModal,private cdr: ChangeDetectorRef, private authService: AuthService,private router: Router) { }
  expanded = false;
  dropdowns = {
    invoiceDropdown: false,
    customerDropdown: false,
    itemDropdown: false,
    reportDropdown: false,
    configDropdown: false,
  };

  toggleSidebar(): void {
    this.expanded = !this.expanded;
  }

  toggleDropdown(dropdown: keyof typeof this.dropdowns): void {
    this.dropdowns[dropdown] = !this.dropdowns[dropdown];
  }

  openAddCustomerModal(): void {
    const modalRef = this.modalService.open(AddCustomerComponent, { size: 'lg' });
    modalRef.componentInstance.saveCustomer.subscribe((customer: ExtendedCustomerDto) => {
      // Reload customers after adding a new customer
      this.cdr.markForCheck(); // Trigger change detection
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
  toggleTheme(): void {
    document.getElementById('DarkThemeToggle')?.click();
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
  
}