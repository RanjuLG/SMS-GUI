import { ChangeDetectorRef, Component } from '@angular/core';
import { RouterLink,RouterLinkActive } from '@angular/router';
import { BreadcrumbComponent } from '../helpers/breadcrumb/breadcrumb.component';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../Services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddCustomerComponent } from '../helpers/customer/add-customer/add-customer.component';
import { ExtendedCustomerDto } from '../customer-form/customer-form.component';
import { of } from 'rxjs';
import Swal from 'sweetalert2';
import { AddItemComponent } from '../helpers/items/add-item/add-item.component';
import { ExtendedItemDto } from '../item-form/item-form.component';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterLink,BreadcrumbComponent,RouterLinkActive],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss'
})
export class NavBarComponent {

  constructor(private location: Location,private router: Router,private authService: AuthService,private modalService: NgbModal,private cdr: ChangeDetectorRef) { }

  goBack() {
    this.location.back(); 
      
  }
  goForward() {
    this.location.forward(); 
      
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

}
