import { Component, OnInit, ChangeDetectorRef, AfterViewInit, ElementRef, ViewChild, TemplateRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddCustomerComponent } from '../helpers/customer/add-customer/add-customer.component';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { ApiService } from '../../Services/api-service.service';
import { Customer, GetCustomerDTO, CreateCustomerDTO, UpdateCustomerDTO, PaginatedResponse, CustomerSearchRequest } from './customer.model';
import { DateService } from '../../Services/date-service.service';
import { ChangeDetectionStrategy } from '@angular/core';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ModernDateRangePickerComponent } from '../helpers/modern-date-range-picker/modern-date-range-picker.component';

// Import shared components
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn, TableAction } from '../../shared/components/data-table/data-table.component';

export interface ExtendedCustomerDto extends GetCustomerDTO {
  selected?: boolean;
}

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    DataTableComponent,
    ModernDateRangePickerComponent
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
  dateRangeSelected = false; // Track if user has selected a date range
  selectedCustomer: ExtendedCustomerDto | null = null;

  get maxDateString(): string {
    return this.maxDate.toISOString().split('T')[0];
  }

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
          const searchParams: CustomerSearchRequest = {
            from: this.formatDateForAPI(this.from),
            to: this.formatDateForAPI(this.to),
            page: this.page,
            pageSize: this.itemsPerPage,
            search: this.searchTerm || undefined,
            sortBy: this.sortBy || undefined,
            sortOrder: this.sortOrder || undefined
          };
          return this.apiService.getCustomers(searchParams);
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
          this.customers = result.data.map((customer: GetCustomerDTO) => ({
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
    
    const searchParams: CustomerSearchRequest = {
      from: this.formatDateForAPI(this.from),
      to: this.formatDateForAPI(this.to),
      page: this.page,
      pageSize: this.itemsPerPage,
      search: this.searchTerm || undefined,
      sortBy: this.sortBy || undefined,
      sortOrder: this.sortOrder || undefined
    };

    this.apiService.getCustomers(searchParams).subscribe({
      next: (response: PaginatedResponse<GetCustomerDTO>) => {
        // Handle paginated response according to new API structure
        this.customers = response.data?.map((customer: GetCustomerDTO) => ({
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

  // Helper method to format Date objects for API calls
  private formatDateForAPI(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

  // Date range handling methods
  onStartDateChange(dateString: string): void {
    if (dateString) {
      console.log("Start date changed:", dateString);
      // Parse the date string as local date
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Month is 0-based
        const day = parseInt(parts[2]);
        this.from = new Date(year, month, day, 0, 0, 0); // Start of day in local time
      } else {
        this.from = new Date(dateString);
      }
      
      console.log("this.from (Local): ", this.from);
      
      // Check if both dates are selected to enable date filtering
      if (this.from && this.to) {
        this.dateRangeSelected = true;
        this.page = 1; // Reset to first page
        this.loadCustomers();
      }
    } else {
      this.from = new Date(this._currentDate);
      this.dateRangeSelected = false;
      console.log('Start date cleared - loading all customers');
      this.page = 1;
      this.loadCustomers();
    }
    this.cdr.markForCheck();
  }

  onDateRangeChange(dateString: string): void {
    if (dateString) {
      console.log("End date changed:", dateString);
      // Parse the date string as local date
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Month is 0-based
        const day = parseInt(parts[2]);
        this.to = new Date(year, month, day, 23, 59, 59, 999); // End of day in local time
      } else {
        const toDate = new Date(dateString);
        this.to = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate(), 23, 59, 59, 999);
      }
      
      console.log("this.to (Local): ", this.to);
      
      // Check if both dates are selected to enable date filtering
      if (this.from && this.to) {
        this.dateRangeSelected = true;
        this.page = 1; // Reset to first page
        this.loadCustomers();
      }
    } else {
      this.to = new Date(this._currentDate);
      this.dateRangeSelected = false;
      console.log('End date cleared - loading all customers');
      this.page = 1;
      this.loadCustomers();
    }
    this.cdr.markForCheck();
  }

  onDateRangeSelected(range: any): void {
    if (range && range.start && range.end) {
      // Parse the date strings as local dates
      const fromParts = range.start.split('-');
      const toParts = range.end.split('-');
      
      if (fromParts.length === 3) {
        const year = parseInt(fromParts[0]);
        const month = parseInt(fromParts[1]) - 1; // Month is 0-based
        const day = parseInt(fromParts[2]);
        this.from = new Date(year, month, day, 0, 0, 0); // Start of day in local time
      } else {
        this.from = new Date(range.start);
      }
      
      if (toParts.length === 3) {
        const year = parseInt(toParts[0]);
        const month = parseInt(toParts[1]) - 1; // Month is 0-based
        const day = parseInt(toParts[2]);
        this.to = new Date(year, month, day, 23, 59, 59, 999); // End of day in local time
      } else {
        const toDate = new Date(range.end);
        this.to = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate(), 23, 59, 59, 999);
      }
      
      console.log("Date range selected:", { from: this.from, to: this.to });
      this.dateRangeSelected = true;
      this.page = 1;
      this.loadCustomers();
    } else {
      this.dateRangeSelected = false;
      this.from = new Date(this._currentDate);
      this.to = new Date(this._currentDate);
      console.log('Date range cleared - loading all customers');
      this.page = 1;
      this.loadCustomers();
    }
    this.cdr.markForCheck();
  }

  clearDateFilter(): void {
    this.from = new Date(this._currentDate);
    this.to = new Date(this._currentDate);
    this.dateRangeSelected = false;
    this.page = 1;
    this.loadCustomers();
    this.cdr.markForCheck();
  }

  viewNICPhoto(customer: ExtendedCustomerDto): void {
    this.selectedCustomer = customer;
    console.log("NIC Photo Path:", this.selectedCustomer?.nicPhotoPath);
    this.modalService.open(this.nicModal, { size: 'lg' });
  }
}
