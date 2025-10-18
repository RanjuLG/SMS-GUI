import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddItemComponent } from '../helpers/items/add-item/add-item.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { ItemDto, ItemSearchRequest, ItemSearchResponse } from './item.model';
import { ApiService } from '../../Services/api-service.service';
import { DateService } from '../../Services/date-service.service';
import { ChangeDetectionStrategy } from '@angular/core';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ModernDateRangePickerComponent } from '../helpers/modern-date-range-picker/modern-date-range-picker.component';

export interface ExtendedItemDto extends ItemDto {
  amountPerCaratage?: number;
  selected?: boolean;
  statusText?: string; // For display purposes
}

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [
    FormsModule, 
    CommonModule, 
    DataTableComponent,
    PageHeaderComponent,
    ModernDateRangePickerComponent
  ],
  templateUrl: './item-form.component.html',
  styleUrls: ['./item-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ItemFormComponent implements OnInit {
  items: ExtendedItemDto[] = [];
  private readonly _currentDate = new Date();
  readonly maxDate = new Date(this._currentDate);
  from: Date | null = null;  // Start with no date filter
  to: Date | null = null;    // Start with no date filter
  dateRangeSelected = false; // Track if user has selected a date range

  // Pagination properties
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  hasNextPage = false;
  hasPreviousPage = false;
  isLoading = false;

  // Search and sorting properties
  searchTerm = '';
  sortBy = 'createdAt';
  sortOrder = 'desc';

  get maxDateString(): string {
    return this.maxDate.toISOString().split('T')[0];
  }

  // Table configuration
  tableColumns = [
    { key: 'createdAt', label: 'Added Date', sortable: true, type: 'text' as const },
    { key: 'itemId', label: 'Item Number', sortable: true, type: 'text' as const },
    { key: 'itemDescription', label: 'Description', sortable: true, type: 'text' as const },
    { key: 'itemRemarks', label: 'Remarks', sortable: true, type: 'text' as const },
    { key: 'itemCaratage', label: 'Karat', sortable: true, type: 'text' as const },
    { key: 'itemWeight', label: 'Net Wt (g)', sortable: true, type: 'text' as const },
    { key: 'itemGoldWeight', label: 'Gold Wt (g)', sortable: true, type: 'text' as const },
    { key: 'itemValue', label: 'Value', sortable: true, type: 'currency' as const },
    { key: 'statusText', label: 'Status', sortable: true, type: 'badge' as const },
    { key: 'customerNIC', label: 'Customer NIC', sortable: true, type: 'text' as const }
  ];

  tableActions = [
    { key: 'edit', label: 'Edit', icon: 'ri-edit-box-line', color: 'warning' },
    { key: 'delete', label: 'Delete', icon: 'ri-delete-bin-line', color: 'danger' }
  ];

  constructor(
    private modalService: NgbModal,
    private apiService: ApiService,
    private dateService: DateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Load all items by default (no date filter)
    this.loadItems();
  }
  
  loadItems(): void {
    this.isLoading = true;
    this.searchItems().subscribe({
      next: (response: ItemSearchResponse) => {
        this.handleSearchResponse(response);
      },
      error: (error: any) => {
        console.error('Failed to load items', error);
        this.isLoading = false;
      }
    });
  }

  searchItems() {
    const searchRequest: any = {
      page: this.currentPage,
      pageSize: this.pageSize,
      search: this.searchTerm || undefined,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder
    };

    // Only add date filters if both dates are selected
    if (this.dateRangeSelected && this.from && this.to) {
      searchRequest.from = this.from;
      searchRequest.to = this.to;
    }

    return this.apiService.searchItems(searchRequest);
  }

  handleSearchResponse(response: ItemSearchResponse): void {
    console.log('Handling search response:', response);
    console.log('Current page before update:', this.currentPage);
    console.log('Items received:', response.data?.length);
    
    // Clear existing items first to force update
    this.items = [];
    this.cdr.detectChanges();
    
    // Then assign new items
    this.items = response.data.map(item => ({
      ...item,
      createdAt: this.dateService.formatDateTime(item.createdAt),
      selected: false,
      statusText: this.getStatusText(item.status)
    }));

    // Update pagination info from server response
    if (response.pagination) {
      this.currentPage = response.pagination.currentPage;
      this.pageSize = response.pagination.pageSize;
      this.totalItems = response.pagination.totalItems;
      this.totalPages = response.pagination.totalPages;
      this.hasNextPage = response.pagination.hasNextPage;
      this.hasPreviousPage = response.pagination.hasPreviousPage;
      
      console.log('Pagination updated:', {
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        totalItems: this.totalItems,
        totalPages: this.totalPages
      });
    }
    
    this.isLoading = false;
    // Force change detection to ensure table updates
    this.cdr.detectChanges();
    console.log('Items loaded:', this.items.length, 'Total:', this.totalItems);
    console.log('First few items:', this.items.slice(0, 3));
  }
  


  openAddItemModal(): void {
    const modalRef = this.modalService.open(AddItemComponent, { size: 'lg' });
    modalRef.componentInstance.saveItem.subscribe((item: ExtendedItemDto) => {
      // Refresh the current page data after adding new item
      this.loadItems();
      this.cdr.markForCheck();
      Swal.fire('Added!', 'Item has been added successfully.', 'success');
    });
  }

  editItem(item: ExtendedItemDto): void {
    Swal.fire({
      title: 'Edit Item',
      text: `Are you sure you want to edit item '${item.itemId}'?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#007bff',
      confirmButtonText: 'Yes, edit it',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        const modalRef = this.modalService.open(AddItemComponent, { size: 'lg' });
        modalRef.componentInstance.item = { ...item };
        modalRef.componentInstance.saveItem.subscribe((updatedItem: ExtendedItemDto) => {
          // Refresh the current page data after editing
          this.loadItems();
          Swal.fire('Updated!', 'Item has been updated successfully.', 'success');
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'Item editing cancelled.', 'info');
      }
    });
  }
  

  removeItem(item: ExtendedItemDto): void {
    Swal.fire({
      title: 'Delete Item',
      text: `Are you sure you want to delete this item '${item.itemDescription}'?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteItem(item.itemId).subscribe({
          next: () => {
            this.loadItems();
            Swal.fire('Deleted!', 'Item has been deleted.', 'success');
          },
          error: (error) => {
            console.error('Error deleting item:', error);
            Swal.fire('Error', 'Failed to delete item. Please try again.', 'error');
          }
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'Item deletion cancelled.', 'info');
      }
    });
  }

  toggleAllSelections(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.items.forEach(item => item.selected = checked);
    this.cdr.markForCheck(); // Trigger change detection
  }

  deleteSelectedItems(): void {
    const selectedItems = this.items.filter(item => item.selected).map(item => item.itemId);
    if (selectedItems.length === 0) {
      Swal.fire('No items selected', 'Please select at least one item to delete.', 'warning');
      return;
    }

    Swal.fire({
      title: 'Delete Selected Items',
      text: `Are you sure you want to delete the selected ${selectedItems.length} items?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Yes, delete them',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteMultipleItems(selectedItems).subscribe({
          next: () => {
            this.loadItems();
            Swal.fire('Deleted!', 'Selected items have been deleted.', 'success');
          },
          error: (error) => {
            console.error('Error deleting selected items:', error);
            Swal.fire('Error', 'Failed to delete selected items. Please try again.', 'error');
          }
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'Selected item deletion cancelled.', 'info');
      }
    });
  }

  onTableAction(event: { action: string, item: any }) {
    switch (event.action) {
      case 'edit':
        this.editItem(event.item);
        break;
      case 'delete':
        this.removeItem(event.item);
        break;
    }
  }

  onSelectionChange(selectedItems: any[]) {
    // This is handled automatically by the data table
  }

  getBadgeClass(status: number): string {
    switch (status) {
      case 1: return 'bg-success';  // In Stock - green
      case 2: return 'bg-info';     // Redeemed - blue  
      case 3: return 'bg-danger';   // Defaulted - red
      default: return 'bg-secondary'; // Unknown - gray
    }
  }

  getStatusText(status: number): string {
    switch (status) {
      case 1: return 'In Stock';
      case 2: return 'Redeemed';
      case 3: return 'Defaulted';
      default: return 'Unknown Status';
    }
  }

  getStatusClass(status: number): string {
    switch (status) {
      case 1: return 'status-label status-in-stock';
      case 2: return 'status-label status-redeemed';
      case 3: return 'status-label status-defaulted';
      default: return 'status-label status-unknown';
    }
  }

  onStartDateChange(dateString: string): void {
    if (dateString) {
      // Parse date string as local date (YYYY-MM-DD format)
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Month is 0-based
        const day = parseInt(parts[2]);
        this.from = new Date(year, month, day, 0, 0, 0);
      } else {
        this.from = new Date(dateString);
      }
      
      console.log("this.from (Local): ", this.from);
      
      // Check if both dates are selected to enable date filtering
      if (this.from && this.to) {
        this.dateRangeSelected = true;
        this.currentPage = 1; // Reset to first page
        this.loadItems();
      }
    } else {
      this.from = null;
      this.dateRangeSelected = false;
      console.log('Start date cleared - loading all items');
      this.currentPage = 1;
      this.loadItems();
    }
    this.cdr.markForCheck();
  }
  
  onDateRangeChange(dateString: string): void {
    if (dateString) {
      // Parse date string as local date (YYYY-MM-DD format)
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
        this.currentPage = 1; // Reset to first page
        this.loadItems();
      }
    } else {
      this.to = null;
      this.dateRangeSelected = false;
      console.log('End date cleared - loading all items');
      this.currentPage = 1;
      this.loadItems();
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
      
      this.dateRangeSelected = true;
      console.log("Date range selected - from:", this.from, "to:", this.to);
      this.currentPage = 1; // Reset to first page when date range changes
      this.loadItems();
    } else if (range === null || (range && !range.start && !range.end)) {
      // Date range cleared
      this.from = null;
      this.to = null;
      this.dateRangeSelected = false;
      console.log('Date range cleared - loading all items');
      this.currentPage = 1;
      this.loadItems();
    } else {
      console.error('Date range is incomplete');
    }
    this.cdr.markForCheck();
  }

  // Method to clear date filter and load all items
  clearDateFilter(): void {
    this.from = null;
    this.to = null;
    this.dateRangeSelected = false;
    this.currentPage = 1;
    this.isLoading = true;
    this.loadItems();
    this.cdr.markForCheck();
  }

  // Pagination methods
  goToPage(page: number): void {
    console.log(`goToPage called with page: ${page}, current page: ${this.currentPage}, total pages: ${this.totalPages}`);
    
    if (page >= 1 && page <= this.totalPages && !this.isLoading) {
      console.log(`Changing from page ${this.currentPage} to page ${page}`);
      this.currentPage = page;
      this.isLoading = true;
      this.cdr.detectChanges(); // Force UI update to show loading state
      this.loadItems();
    } else {
      console.log(`goToPage rejected: page=${page}, totalPages=${this.totalPages}, isLoading=${this.isLoading}`);
    }
  }

  goToFirstPage(): void {
    this.goToPage(1);
  }

  goToPreviousPage(): void {
    if (this.hasPreviousPage) {
      this.goToPage(this.currentPage - 1);
    }
  }

  goToNextPage(): void {
    if (this.hasNextPage) {
      this.goToPage(this.currentPage + 1);
    }
  }

  goToLastPage(): void {
    this.goToPage(this.totalPages);
  }

  changePageSize(newPageSize: number): void {
    console.log(`changePageSize called: current=${this.pageSize}, new=${newPageSize}`);
    
    if (newPageSize !== this.pageSize && !this.isLoading) {
      this.pageSize = newPageSize;
      this.currentPage = 1; // Reset to first page when page size changes
      this.isLoading = true;
      console.log(`Page size changed to ${newPageSize}, loading items...`);
      this.cdr.detectChanges(); // Force UI update
      this.loadItems();
    }
  }

  // Sorting method
  onSort(column: string): void {
    if (this.sortBy === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortOrder = 'asc';
    }
    this.currentPage = 1; // Reset to first page when sorting changes
    this.loadItems();
  }

  // Handle search from data table
  onSearch(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.currentPage = 1; // Reset to first page when searching
    this.isLoading = true;
    this.loadItems();
  }

  // Handle sort change from data table
  onSortChange(event: { sortBy: string, sortOrder: string }): void {
    this.sortBy = event.sortBy;
    this.sortOrder = event.sortOrder;
    this.currentPage = 1; // Reset to first page when sorting changes
    this.isLoading = true;
    this.loadItems();
  }
  
}
