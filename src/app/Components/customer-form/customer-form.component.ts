import { Component, OnInit, ChangeDetectorRef, AfterViewInit, ElementRef, ViewChild, TemplateRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddCustomerComponent } from '../helpers/customer/add-customer/add-customer.component';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { ApiService } from '../../Services/api-service.service';
import { CustomerDto } from './customer.model';
import { DateService } from '../../Services/date-service.service';
import { ChangeDetectionStrategy } from '@angular/core';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

// Import shared components
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn, TableAction } from '../../shared/components/data-table/data-table.component';

export interface ExtendedCustomerDto extends CustomerDto {
  selected?: boolean;
}

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    PageHeaderComponent,
    DataTableComponent
  ],
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerFormComponent implements OnInit {
  customers: ExtendedCustomerDto[] = [];
  page: number = 1;
  itemsPerPage: number = 20; // Increased default page size to show more customers
  itemsPerPageOptions: number[] = [10, 20, 50, 100]; // Updated options for better pagination
  searchControl = new FormControl();
  pagination: any = null;
  loading: boolean = false;
  searchTerm: string = '';
  sortBy: string = 'createdAt';
  sortOrder: string = 'desc';
  private readonly _currentDate = new Date();
  readonly maxDate = new Date(this._currentDate);
  from = new Date(this._currentDate);
  to = new Date(this._currentDate);
  isLoading = false;
  selectedCustomer: ExtendedCustomerDto | null = null;

  @ViewChild('datePicker') datePicker!: ElementRef;
  @ViewChild('nicModal') nicModal!: TemplateRef<any>;

  // Table configuration for the existing DataTableComponent
  tableColumns: TableColumn[] = [
    {
      key: 'customerId',
      label: 'ID',
      type: 'text',
      sortable: true
    },
    {
      key: 'customerName',
      label: 'Customer Name',
      type: 'text',
      sortable: true
    },
    {
      key: 'customerNIC',
      label: 'NIC',
      type: 'text',
      sortable: true
    },
    {
      key: 'customerContactNo',
      label: 'Phone',
      type: 'text',
      sortable: true
    },
    {
      key: 'customerAddress',
      label: 'Address',
      type: 'text',
      sortable: true
    },
    {
      key: 'createdAt',
      label: 'Joining Date',
      type: 'date',
      sortable: true
    }
  ];

  tableActions: TableAction[] = [
    {
      key: 'view',
      label: 'View NIC',
      icon: 'ri-eye-line',
      color: 'info'
    },
    {
      key: 'edit',
      label: 'Edit',
      icon: 'ri-edit-box-line',
      color: 'warning'
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: 'ri-delete-bin-line',
      color: 'danger'
    }
  ];

  constructor(
    private modalService: NgbModal,
    private apiService: ApiService,
    private dateService: DateService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Set a very wide date range to show all customers by default
    // Set from date to a very early date (e.g., 10 years ago)
    this.from = new Date();
    this.from.setFullYear(this.from.getFullYear() - 10);
    
    // Set to date to tomorrow to include all current records
    this.to = new Date();
    this.to.setDate(this.to.getDate() + 1);
    
    // Load all customers with pagination
    this.loadCustomers();

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((searchTerm: string) => {
        this.searchTerm = searchTerm || '';
        this.page = 1; // Reset to first page when searching
        if (!searchTerm) {
          // If no search term, load all customers with pagination
          return this.apiService.getCustomers(
            this.from, 
            this.to, 
            this.page, 
            this.itemsPerPage, 
            this.searchTerm, 
            this.sortBy, 
            this.sortOrder
          );
        }
        // If there's a search term, search by NIC
        return this.apiService.getCustomerByNIC(searchTerm).pipe(
          catchError(() => of([]))
        );
      })
    ).subscribe({
      next: (result: any) => {
        if (result && result.data && Array.isArray(result.data)) {
          // Handle paginated response
          this.customers = result.data.map((customer: CustomerDto) => ({
            ...customer,
            createdAt: this.dateService.formatDateTime(customer.createdAt),
            selected: false
          }));
          this.pagination = result.pagination;
        } else if (Array.isArray(result)) {
          // Handle direct array response
          this.customers = result.map(customer => ({
            ...customer,
            createdAt: this.dateService.formatDateTime(customer.createdAt),
            selected: false
          }));
          this.pagination = null;
        } else if (result) {
          // Handle single customer response
          this.customers = [{
            ...result,
            createdAt: this.dateService.formatDateTime(result.createdAt),
            selected: false
          }];
          this.pagination = null;
        } else {
          this.customers = [];
          this.pagination = null;
        }
        this.cdr.markForCheck();
      },
      error: (error: any) => {
        console.error('Failed to fetch customer', error);
        this.cdr.markForCheck();
      }
    });
  }

  loadCustomers(): void {
    this.loading = true;
    this.apiService.getCustomers(
      this.from, 
      this.to, 
      this.page, 
      this.itemsPerPage, 
      this.searchTerm, 
      this.sortBy, 
      this.sortOrder
    ).subscribe({
      next: (response: any) => {
        // Handle paginated response
        this.customers = response.data?.map((customer: CustomerDto) => ({
          ...customer,
          createdAt: this.dateService.formatDateTime(customer.createdAt),
          selected: false
        })) || [];
        this.pagination = response.pagination;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error: any) => {
        console.error('Failed to load customers', error);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // Handle table actions (view, edit, delete)
  handleTableAction(event: { action: string, item: ExtendedCustomerDto }): void {
    const { action, item } = event;
    
    switch (action) {
      case 'view':
        this.viewNICPhoto(item);
        break;
      case 'edit':
        this.editCustomer(item);
        break;
      case 'delete':
        this.removeCustomer(item);
        break;
    }
  }

  // Handle selection changes from data table
  onSelectionChange(selectedItems: ExtendedCustomerDto[]): void {
    // Update selected state in customers array
    this.customers.forEach(customer => {
      customer.selected = selectedItems.some(selected => selected.customerId === customer.customerId);
    });
    this.cdr.markForCheck();
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
          this.loadCustomers();
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
            this.loadCustomers();
            this.cdr.markForCheck();
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
            this.loadCustomers();
            this.cdr.markForCheck();
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
    this.cdr.markForCheck();
  }

  openAddCustomerModal(): void {
    const modalRef = this.modalService.open(AddCustomerComponent, { size: 'lg' });
    modalRef.componentInstance.saveCustomer.subscribe((customer: ExtendedCustomerDto) => {
      this.loadCustomers();
      this.cdr.markForCheck();
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
      this.loadCustomers();
    }
    this.cdr.markForCheck();
  }

  getStartIndex(): number {
    if (this.pagination) {
      return (this.pagination.currentPage - 1) * this.pagination.pageSize + 1;
    }
    return (this.page - 1) * this.itemsPerPage + 1;
  }

  getEndIndex(): number {
    if (this.pagination) {
      const endIndex = this.pagination.currentPage * this.pagination.pageSize;
      return endIndex > this.pagination.totalItems ? this.pagination.totalItems : endIndex;
    }
    const endIndex = this.page * this.itemsPerPage;
    return endIndex > this.customers.length ? this.customers.length : endIndex;
  }

  // New pagination and search event handlers
  onSearch(searchTerm: string): void {
    this.searchTerm = searchTerm || '';
    this.page = 1; // Reset to first page when searching
    this.loadCustomers();
  }

  onPageChange(page: number): void {
    this.page = page;
    this.loadCustomers();
  }

  onPageSizeChange(pageSize: number): void {
    this.itemsPerPage = pageSize;
    this.page = 1;
    this.loadCustomers();
  }

  onSortChange(sortConfig: { sortBy: string, sortOrder: string }): void {
    this.sortBy = sortConfig.sortBy;
    this.sortOrder = sortConfig.sortOrder;
    this.loadCustomers();
  }

  onStartDateChange(event: any): void {
    if (event && event.value) {
      // Since backend expects local time, use local date (not UTC)
      const fromDate = new Date(event.value);
      this.from = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate(), 0, 0, 0);
      console.log("this.from (Local): ", this.from);
      this.loadCustomers();
    } else {
      console.error('Start date event or value is null');
    }
    this.cdr.markForCheck();
  }

  onDateRangeChange(event: any): void {
    if (event && event.value) {
      // Since backend expects local time, use local date (not UTC)
      const toDate = new Date(event.value);
      this.to = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate() + 1, 0, 0, 0);
      console.log("this.to (Local): ", this.to);
      this.loadCustomers();
    } else {
      console.error('End date event or value is null');
    }
    this.cdr.markForCheck();
  }

  viewNICPhoto(customer: ExtendedCustomerDto): void {
    this.selectedCustomer = customer;
    console.log("NIC Photo Path:", this.selectedCustomer?.nicPhotoPath);
    this.modalService.open(this.nicModal, { size: 'lg' });
  }
}
