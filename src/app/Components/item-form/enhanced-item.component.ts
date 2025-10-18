import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../Services/api-service.service';
import { DateService } from '../../Services/date-service.service';

// Import enhanced components
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn, TableAction } from '../../shared/components/data-table/data-table.component';
import { AdvancedSearchComponent, SearchField } from '../../shared/components/advanced-search/advanced-search.component';

@Component({
  selector: 'app-enhanced-item',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    DataTableComponent,
    AdvancedSearchComponent
  ],
  template: `
    <app-page-header 
      title="Item Management"
      subtitle="Manage inventory items with advanced search and filtering">
      
      <div slot="actions" class="header-actions">
        <button type="button" class="btn btn-primary" (click)="openAddItemModal()">
          <i class="ri-add-line align-bottom me-1"></i> Add Item
        </button>
        <button type="button" class="btn btn-secondary ms-2" (click)="exportItems()">
          <i class="ri-download-2-line"></i> Export
        </button>
        <button type="button" class="btn btn-danger ms-2" (click)="deleteSelectedItems()" 
                [disabled]="selectedItems.length === 0">
          <i class="ri-delete-bin-2-line"></i> Delete Selected ({{ selectedItems.length }})
        </button>
      </div>
    </app-page-header>

    <div class="container-fluid">
      <!-- Advanced Search Component -->
      <app-advanced-search
        [searchFields]="searchFields"
        [expanded]="false"
        [initialValues]="searchCriteria"
        (search)="onAdvancedSearch($event)"
        (clear)="onClearSearch()">
      </app-advanced-search>

      <!-- Enhanced Data Table with Server-side Pagination -->
      <app-data-table
        title="Items Inventory"
        [data]="items"
        [columns]="tableColumns"
        [actions]="tableActions"
        [searchable]="true"
        [selectable]="true"
        [showActions]="true"
        [showAddButton]="false"
        [pageSize]="pageSize"
        [pageSizeOptions]="pageSizeOptions"
        [loading]="loading"
        [pagination]="pagination"
        [serverSidePagination]="true"
        (search)="onQuickSearch($event)"
        (add)="openAddItemModal()"
        (action)="handleTableAction($event)"
        (selectionChange)="onSelectionChange($event)"
        (pageChange)="onPageChange($event)"
        (pageSizeChange)="onPageSizeChange($event)"
        (sortChange)="onSortChange($event)">
      </app-data-table>
    </div>
  `,
  styles: [`
    .header-actions {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .container-fluid {
      padding: 0 1.5rem;
    }
  `]
})
export class EnhancedItemComponent implements OnInit {
  items: any[] = [];
  selectedItems: any[] = [];
  page: number = 1;
  pageSize: number = 10;
  pageSizeOptions: number[] = [5, 10, 15, 20, 50];
  pagination: any = null;
  loading: boolean = false;
  
  // Search and filter properties
  searchTerm: string = '';
  sortBy: string = 'createdAt';
  sortOrder: string = 'desc';
  searchCriteria: any = {};

  // Table configuration
  tableColumns: TableColumn[] = [
    {
      key: 'itemId',
      label: 'Item ID',
      type: 'text',
      sortable: true,
      width: '120px'
    },
    {
      key: 'itemName',
      label: 'Item Name',
      type: 'text',
      sortable: true,
      width: '200px'
    },
    {
      key: 'category',
      label: 'Category',
      type: 'text',
      sortable: true,
      width: '150px'
    },
    {
      key: 'weight',
      label: 'Weight (g)',
      type: 'text',
      sortable: true,
      width: '120px'
    },
    {
      key: 'karat.karatValue',
      label: 'Karat',
      type: 'text',
      sortable: true,
      width: '100px'
    },
    {
      key: 'currentValue',
      label: 'Current Value (Rs.)',
      type: 'currency',
      sortable: true,
      width: '180px'
    },
    {
      key: 'status',
      label: 'Status',
      type: 'badge',
      sortable: true,
      width: '120px'
    },
    {
      key: 'createdAt',
      label: 'Created Date',
      type: 'date',
      sortable: true,
      width: '160px'
    }
  ];

  tableActions: TableAction[] = [
    {
      key: 'view',
      label: 'View Details',
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
      key: 'appraise',
      label: 'Appraise',
      icon: 'ri-price-tag-3-line',
      color: 'primary'
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: 'ri-delete-bin-line',
      color: 'danger'
    }
  ];

  // Advanced search field configuration
  searchFields: SearchField[] = [
    {
      key: 'search',
      label: 'General Search',
      type: 'text',
      placeholder: 'Search by item name, ID, or description...'
    },
    {
      key: 'category',
      label: 'Category',
      type: 'select',
      options: [
        { value: 'Ring', label: 'Ring' },
        { value: 'Necklace', label: 'Necklace' },
        { value: 'Bracelet', label: 'Bracelet' },
        { value: 'Earrings', label: 'Earrings' },
        { value: 'Chain', label: 'Chain' },
        { value: 'Bangle', label: 'Bangle' },
        { value: 'Pendant', label: 'Pendant' },
        { value: 'Watch', label: 'Watch' },
        { value: 'Coin', label: 'Coin' },
        { value: 'Bar', label: 'Bar' },
        { value: 'Other', label: 'Other' }
      ]
    },
    {
      key: 'karatId',
      label: 'Karat Value',
      type: 'select',
      options: [] // Will be populated with karat options
    },
    {
      key: 'status',
      label: 'Status',
      type: 'multiSelect',
      options: [
        { value: 'Available', label: 'Available' },
        { value: 'Pawned', label: 'Pawned' },
        { value: 'Sold', label: 'Sold' },
        { value: 'Under Appraisal', label: 'Under Appraisal' }
      ]
    },
    {
      key: 'weightRange',
      label: 'Weight Range (grams)',
      type: 'text',
      placeholder: 'e.g., 10-50'
    },
    {
      key: 'minWeight',
      label: 'Minimum Weight (g)',
      type: 'number',
      min: 0
    },
    {
      key: 'maxWeight',
      label: 'Maximum Weight (g)',
      type: 'number',
      min: 0
    },
    {
      key: 'valueRange',
      label: 'Value Range (Rs.)',
      type: 'text',
      placeholder: 'e.g., 10000-100000'
    },
    {
      key: 'minValue',
      label: 'Minimum Value (Rs.)',
      type: 'number',
      min: 0
    },
    {
      key: 'maxValue',
      label: 'Maximum Value (Rs.)',
      type: 'number',
      min: 0
    },
    {
      key: 'createdDate',
      label: 'Created Date Range',
      type: 'dateRange'
    },
    {
      key: 'hasImage',
      label: 'Has Image',
      type: 'select',
      options: [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' }
      ]
    }
  ];

  constructor(
    private apiService: ApiService,
    private dateService: DateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSearchOptions();
    this.loadItems();
  }

  loadSearchOptions(): void {
    // Load karat options
    this.apiService.getAllKarats().subscribe({
      next: (response: any) => {
        const karatField = this.searchFields.find(f => f.key === 'karatId');
        if (karatField) {
          karatField.options = response.data?.map((karat: any) => ({
            value: karat.karatId,
            label: `${karat.karatValue}K`
          })) || [];
        }
      }
    });
  }

  loadItems(): void {
    this.loading = true;
    
    // Set default date range for items (last 30 days if not specified)
    const fromDate = this.searchCriteria.createdDate?.from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const toDate = this.searchCriteria.createdDate?.to || new Date();
    
    this.apiService.getItems(
      fromDate,
      toDate,
      this.page,
      this.pageSize,
      this.searchTerm,
      this.sortBy,
      this.sortOrder
    ).subscribe({
      next: (response: any) => {
        let items = response.data || [];
        
        // Apply additional client-side filtering for advanced search criteria
        if (this.searchCriteria.category) {
          items = items.filter((item: any) => item.category === this.searchCriteria.category);
        }
        if (this.searchCriteria.karatId) {
          items = items.filter((item: any) => item.karat?.karatId === this.searchCriteria.karatId);
        }
        if (this.searchCriteria.status && this.searchCriteria.status.length > 0) {
          items = items.filter((item: any) => this.searchCriteria.status.includes(item.status));
        }
        if (this.searchCriteria.minWeight) {
          items = items.filter((item: any) => item.weight >= this.searchCriteria.minWeight);
        }
        if (this.searchCriteria.maxWeight) {
          items = items.filter((item: any) => item.weight <= this.searchCriteria.maxWeight);
        }
        if (this.searchCriteria.minValue) {
          items = items.filter((item: any) => item.currentValue >= this.searchCriteria.minValue);
        }
        if (this.searchCriteria.maxValue) {
          items = items.filter((item: any) => item.currentValue <= this.searchCriteria.maxValue);
        }
        if (this.searchCriteria.hasImage !== undefined) {
          const hasImage = this.searchCriteria.hasImage === 'true';
          items = items.filter((item: any) => !!item.imageUrl === hasImage);
        }
        
        this.items = items.map((item: any) => ({
          ...item,
          selected: false
        }));
        
        this.pagination = response.pagination;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error: any) => {
        console.error('Failed to load items', error);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // Event handlers
  onQuickSearch(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.page = 1;
    this.loadItems();
  }

  onAdvancedSearch(criteria: any): void {
    this.searchCriteria = criteria;
    this.page = 1;
    
    // Extract individual criteria
    if (criteria.search) {
      this.searchTerm = criteria.search;
    }
    
    // Parse weight range if provided
    if (criteria.weightRange) {
      const range = criteria.weightRange.split('-');
      if (range.length === 2) {
        this.searchCriteria.minWeight = parseFloat(range[0].trim());
        this.searchCriteria.maxWeight = parseFloat(range[1].trim());
      }
    }
    
    // Parse value range if provided
    if (criteria.valueRange) {
      const range = criteria.valueRange.split('-');
      if (range.length === 2) {
        this.searchCriteria.minValue = parseFloat(range[0].trim());
        this.searchCriteria.maxValue = parseFloat(range[1].trim());
      }
    }
    
    this.loadItems();
  }

  onClearSearch(): void {
    this.searchCriteria = {};
    this.searchTerm = '';
    this.page = 1;
    this.loadItems();
  }

  onPageChange(page: number): void {
    this.page = page;
    this.loadItems();
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.page = 1;
    this.loadItems();
  }

  onSortChange(sortConfig: { sortBy: string, sortOrder: string }): void {
    this.sortBy = sortConfig.sortBy;
    this.sortOrder = sortConfig.sortOrder;
    this.loadItems();
  }

  onSelectionChange(selectedItems: any[]): void {
    this.selectedItems = selectedItems;
    this.cdr.markForCheck();
  }

  handleTableAction(event: { action: string, item: any }): void {
    const { action, item } = event;
    
    switch (action) {
      case 'view':
        this.viewItemDetails(item);
        break;
      case 'edit':
        this.editItem(item);
        break;
      case 'appraise':
        this.appraiseItem(item);
        break;
      case 'delete':
        this.deleteItem(item);
        break;
    }
  }

  // Action methods
  openAddItemModal(): void {
    console.log('Open add item modal');
    // Implement modal opening logic
  }

  viewItemDetails(item: any): void {
    console.log('View item details:', item);
    // Implement view details logic
  }

  editItem(item: any): void {
    console.log('Edit item:', item);
    // Implement edit logic
  }

  appraiseItem(item: any): void {
    console.log('Appraise item:', item);
    // Implement appraisal logic
  }

  deleteItem(item: any): void {
    if (confirm(`Are you sure you want to delete item "${item.itemName}"?`)) {
      this.apiService.deleteItem(item.itemId).subscribe({
        next: () => {
          console.log('Item deleted successfully');
          this.loadItems(); // Reload the list
        },
        error: (error: any) => {
          console.error('Failed to delete item', error);
        }
      });
    }
  }

  deleteSelectedItems(): void {
    if (this.selectedItems.length === 0) return;
    
    const itemNames = this.selectedItems.map(item => item.itemName).join(', ');
    if (confirm(`Are you sure you want to delete ${this.selectedItems.length} items: ${itemNames}?`)) {
      const deletePromises = this.selectedItems.map(item => 
        this.apiService.deleteItem(item.itemId).toPromise()
      );
      
      Promise.all(deletePromises).then(() => {
        console.log('Selected items deleted successfully');
        this.selectedItems = [];
        this.loadItems(); // Reload the list
      }).catch(error => {
        console.error('Failed to delete selected items', error);
      });
    }
  }

  exportItems(): void {
    console.log('Export items with current filters:', this.searchCriteria);
    // Implement export logic
  }
}
