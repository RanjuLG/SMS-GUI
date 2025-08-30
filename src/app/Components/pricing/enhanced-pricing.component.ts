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
  selector: 'app-enhanced-pricing',
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
      title="Pricing Management"
      subtitle="Manage gold pricing configurations with advanced search and filtering">
      
      <div slot="actions" class="header-actions">
        <button type="button" class="btn btn-primary" (click)="openAddPricingModal()">
          <i class="ri-add-line align-bottom me-1"></i> Add Pricing
        </button>
        <button type="button" class="btn btn-success ms-2" (click)="openBatchModal()">
          <i class="ri-stack-line"></i> Batch Upload
        </button>
        <button type="button" class="btn btn-danger ms-2" (click)="deleteSelectedPricings()">
          <i class="ri-delete-bin-2-line"></i> Delete Selected
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
        title="Pricing Configurations"
        [data]="pricings"
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
        (add)="openAddPricingModal()"
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
export class EnhancedPricingComponent implements OnInit {
  pricings: any[] = [];
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
      key: 'karat.karatValue',
      label: 'Karat',
      type: 'text',
      sortable: true,
      width: '150px'
    },
    {
      key: 'loanPeriod.period',
      label: 'Loan Period (months)',
      type: 'text',
      sortable: true,
      width: '200px'
    },
    {
      key: 'price',
      label: 'Price (Rs.)',
      type: 'currency',
      sortable: true,
      width: '180px'
    },
    {
      key: 'createdAt',
      label: 'Created Date',
      type: 'date',
      sortable: true,
      width: '180px'
    }
  ];

  tableActions: TableAction[] = [
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

  // Advanced search field configuration
  searchFields: SearchField[] = [
    {
      key: 'search',
      label: 'General Search',
      type: 'text',
      placeholder: 'Search by karat value or loan period...'
    },
    {
      key: 'karatId',
      label: 'Karat Value',
      type: 'select',
      options: [] // Will be populated with karat options
    },
    {
      key: 'loanPeriodId',
      label: 'Loan Period',
      type: 'select',
      options: [] // Will be populated with loan period options
    },
    {
      key: 'priceRange',
      label: 'Price Range',
      type: 'dateRange' // Using dateRange type for dual inputs
    },
    {
      key: 'minPrice',
      label: 'Minimum Price',
      type: 'number',
      min: 0
    },
    {
      key: 'maxPrice',
      label: 'Maximum Price',
      type: 'number',
      min: 0
    },
    {
      key: 'createdDate',
      label: 'Created Date Range',
      type: 'dateRange'
    }
  ];

  constructor(
    private apiService: ApiService,
    private dateService: DateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSearchOptions();
    this.loadPricings();
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

    // Load loan period options
    this.apiService.getAllLoanPeriods().subscribe({
      next: (response: any) => {
        const loanPeriodField = this.searchFields.find(f => f.key === 'loanPeriodId');
        if (loanPeriodField) {
          loanPeriodField.options = response.data?.map((period: any) => ({
            value: period.loanPeriodId,
            label: `${period.period} months`
          })) || [];
        }
      }
    });
  }

  loadPricings(): void {
    this.loading = true;
    
    this.apiService.getAllPricings(
      this.page,
      this.pageSize,
      this.searchTerm,
      this.sortBy,
      this.sortOrder,
      this.searchCriteria.karatId,
      this.searchCriteria.loanPeriodId,
      this.searchCriteria.minPrice,
      this.searchCriteria.maxPrice
    ).subscribe({
      next: (response: any) => {
        this.pricings = response.data?.map((pricing: any) => ({
          ...pricing,
          selected: false
        })) || [];
        this.pagination = response.pagination;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error: any) => {
        console.error('Failed to load pricings', error);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // Event handlers
  onQuickSearch(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.page = 1;
    this.loadPricings();
  }

  onAdvancedSearch(criteria: any): void {
    this.searchCriteria = criteria;
    this.page = 1;
    
    // Extract individual criteria
    if (criteria.search) {
      this.searchTerm = criteria.search;
    }
    
    this.loadPricings();
  }

  onClearSearch(): void {
    this.searchCriteria = {};
    this.searchTerm = '';
    this.page = 1;
    this.loadPricings();
  }

  onPageChange(page: number): void {
    this.page = page;
    this.loadPricings();
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.page = 1;
    this.loadPricings();
  }

  onSortChange(sortConfig: { sortBy: string, sortOrder: string }): void {
    this.sortBy = sortConfig.sortBy;
    this.sortOrder = sortConfig.sortOrder;
    this.loadPricings();
  }

  onSelectionChange(selectedItems: any[]): void {
    console.log('Selected items:', selectedItems);
  }

  handleTableAction(event: { action: string, item: any }): void {
    const { action, item } = event;
    
    switch (action) {
      case 'edit':
        this.editPricing(item);
        break;
      case 'delete':
        this.deletePricing(item);
        break;
    }
  }

  // Action methods (implement as needed)
  openAddPricingModal(): void {
    console.log('Open add pricing modal');
  }

  openBatchModal(): void {
    console.log('Open batch upload modal');
  }

  editPricing(pricing: any): void {
    console.log('Edit pricing:', pricing);
  }

  deletePricing(pricing: any): void {
    console.log('Delete pricing:', pricing);
  }

  deleteSelectedPricings(): void {
    const selectedPricings = this.pricings.filter(p => p.selected);
    console.log('Delete selected pricings:', selectedPricings);
  }
}
