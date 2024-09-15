import { Component, OnInit, ChangeDetectorRef, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddCustomerComponent } from '../helpers/customer/add-customer/add-customer.component';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination';
import { ApiService } from '../../Services/api-service.service';
import { CustomerDto } from './customer.model';
import { DateService } from '../../Services/date-service.service';
import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy } from '@angular/core';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatHint } from '@angular/material/form-field';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface ExtendedCustomerDto extends CustomerDto {
  selected?: boolean;
}

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [
    FormsModule, 
    CommonModule, 
    NgxPaginationModule, 
    ReactiveFormsModule, 
    JsonPipe,
    MatDatepickerModule,
    MatHint,
    MatFormFieldModule, // Import Material Form Field Module
    MatInputModule, 
  ],
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerFormComponent implements OnInit {
  customers: ExtendedCustomerDto[] = [];
  page: number = 1;
  itemsPerPage: number = 10;
  itemsPerPageOptions: number[] = [1, 5, 10, 15, 20];
  searchControl = new FormControl();
  private readonly _currentDate = new Date();
  readonly maxDate = new Date(this._currentDate);
  from = new Date(this._currentDate);
  to = new Date(this._currentDate)
  
  @ViewChild('datePicker') datePicker!: ElementRef;

  constructor(
    private modalService: NgbModal, 
    private apiService: ApiService, 
    private dateService: DateService,
    private cdr: ChangeDetectorRef // Inject ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.from.setDate(this.from.getDate() - 30);
    this.to.setDate(this.to.getDate() + 1);
    this.loadCustomers();
   
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((nic: string) => {
        if (!nic) {
          return this.apiService.getCustomers(this.from,this.to); // Return all customers if NIC is empty
        }
        return this.apiService.getCustomerByNIC(nic).pipe(
          catchError(() => of([])) // Handle errors and return an empty array
        );
      })
    ).subscribe({
      next: (result: CustomerDto[] | CustomerDto) => {
        if (Array.isArray(result)) {
          this.customers = result.map(customer => ({
            ...customer,
            createdAt: this.dateService.formatDateTime(customer.createdAt),
            selected: false
          }));
        } else {
          this.customers = result ? [{
            ...result,
            createdAt: this.dateService.formatDateTime(result.createdAt),
            selected: false
          }] : [];
        }
        this.cdr.markForCheck(); // Trigger change detection
      },
      error: (error: any) => {
        console.error('Failed to fetch customer', error);
      }
    });
  }
  

  loadCustomers(): void {
    this.apiService.getCustomers(this.from, this.to).subscribe({
      next: (customers: ExtendedCustomerDto[]) => {
        this.customers = customers.map(customer => ({
          ...customer,
          createdAt: this.dateService.formatDateTime(customer.createdAt),
          selected: false
        }));
        this.cdr.markForCheck(); // Trigger change detection
      },
      error: (error: any) => {
        console.error('Failed to load customers', error);
      }
    });
  }

  formatDate(dateString: string): string {
    return this.dateService.formatDateTime(dateString);
  }

  editCustomer(customer: ExtendedCustomerDto): void {
    Swal.fire({
      title: 'Edit Customer',
      text: `Are you sure you want to edit customer '${customer.customerName}'?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#007bff',
      confirmButtonText: 'Yes, edit it',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        const modalRef = this.modalService.open(AddCustomerComponent, { size: 'lg' });
        modalRef.componentInstance.customer = { ...customer };
        modalRef.componentInstance.saveCustomer.subscribe((updatedCustomer: ExtendedCustomerDto) => {
          // Update the local customers array or reload customers from API
          this.loadCustomers(); // Reload customers after editing
          Swal.fire('Updated!', 'Customer has been updated.', 'success');
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'Customer editing cancelled.', 'info');
      }
    });
  }
  

  removeCustomer(customer: ExtendedCustomerDto): void {
    Swal.fire({
      title: 'Delete Customer',
      text: `Are you sure you want to delete customer '${customer.customerName}'?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteCustomer(customer.customerId).subscribe({
          next: () => {
            this.loadCustomers(); // Reload customers after deletion
            this.cdr.markForCheck(); // Trigger change detection
            Swal.fire('Deleted!', 'Customer has been deleted.', 'success');
          },
          error: (error) => {
            console.error('Error deleting customer:', error);
            Swal.fire('Error', 'Failed to delete customer. Please try again.', 'error');
          }
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'Customer deletion cancelled.', 'info');
      }
    });
  }

  deleteSelectedCustomers(): void {
    const selectedCustomerIds = this.customers.filter(customer => customer.selected).map(customer => customer.customerId);
    if (selectedCustomerIds.length === 0) {
      Swal.fire('No Customers Selected', 'Please select at least one customer to delete.', 'warning');
      return;
    }

    Swal.fire({
      title: 'Delete Selected Customers',
      text: `Are you sure you want to delete ${selectedCustomerIds.length} selected customer(s)?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Yes, delete them',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteMultipleCustomers(selectedCustomerIds).subscribe({
          next: () => {
            this.loadCustomers(); // Reload customers after deleting selected customers
            this.cdr.markForCheck(); // Trigger change detection
            Swal.fire('Deleted!', 'Selected customers have been deleted.', 'success');
          },
          error: (error) => {
            console.error('Error deleting selected customers:', error);
            Swal.fire('Error', 'Failed to delete selected customers. Please try again.', 'error');
          }
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'Customer deletion cancelled.', 'info');
      }
    });
  }

  selectAll(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.customers.forEach(customer => customer.selected = checkbox.checked);
    this.cdr.markForCheck(); // Trigger change detection
  }

  openAddCustomerModal(): void {
    const modalRef = this.modalService.open(AddCustomerComponent, { size: 'lg' });
    modalRef.componentInstance.saveCustomer.subscribe((customer: ExtendedCustomerDto) => {
      this.loadCustomers(); // Reload customers after adding a new customer
      this.cdr.markForCheck(); // Trigger change detection
      Swal.fire('Added!', 'Customer has been added.', 'success');
    });
  }

  filterCustomersByDateRange(selectedDateRange: any): void {
    if (selectedDateRange) {
      const [startDate, endDate] = selectedDateRange.split(' to ');
      this.customers = this.customers.filter(customer => {
        const customerDate = new Date(customer.createdAt);
        return customerDate >= new Date(startDate) && customerDate <= new Date(endDate);
      });
    } else {
      this.loadCustomers(); // Load all customers if no date range selected
    }
    this.cdr.markForCheck(); // Trigger change detection
  }

  getStartIndex(): number {
    return (this.page - 1) * this.itemsPerPage + 1;
  }

  getEndIndex(): number {
    const endIndex = this.page * this.itemsPerPage;
    return endIndex > this.customers.length ? this.customers.length : endIndex;
  }

  onStartDateChange(event: any): void{
    this.from = new Date(event.value)
    console.log("this.from: ", this.from);


  }
  onDateRangeChange(event: any): void {
   
    if (event && event.value) 
    {
      const {end } = event.value;
      
        this.to = new Date(event.value);
        this.to.setDate(this.to.getDate() + 1);
        
        console.log("this.to: ", this.to);
        this.loadCustomers();
  
    } 
    else {
      console.error('Event or event value is null');
    }
    this.cdr.markForCheck();
  }
  
}
