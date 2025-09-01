import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card shadow-sm">
      <div class="card-header border-bottom-0" style="background-color: var(--card-bg); border-color: var(--border-color);">
        <div class="row align-items-center">
          <div class="col-md-6">
            <h5 class="card-title mb-0" style="color: var(--primary-text);">{{ title }}</h5>
          </div>
          <div class="col-md-6">
            <div class="d-flex justify-content-end gap-2">
              <div class="search-box" *ngIf="searchable">
                <input 
                  type="text" 
                  class="form-control form-control-sm" 
                  placeholder="Search..." 
                  [(ngModel)]="searchTerm"
                  (ngModelChange)="onSearch($event)">
              </div>
              <button 
                *ngIf="showAddButton" 
                class="btn btn-primary btn-sm"
                (click)="onAdd()">
                <i class="ri-add-line"></i> Add
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th *ngIf="selectable" class="text-center" style="width: 40px;">
                  <input 
                    type="checkbox" 
                    class="form-check-input"
                    [checked]="allSelected"
                    (change)="toggleSelectAll($event)">
                </th>
                <th 
                  *ngFor="let column of columns" 
                  [style.width]="column.width"
                  [class]="column.sortable ? 'sortable' : ''"
                  (click)="column.sortable ? sort(column.key) : null">
                  {{ column.label }}
                  <i *ngIf="column.sortable && sortColumn === column.key" 
                     [class]="sortDirection === 'asc' ? 'ri-arrow-up-line' : 'ri-arrow-down-line'"></i>
                </th>
                <th *ngIf="showActions" class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of paginatedData; let i = index" 
                  [class.table-active]="item.selected">
                <td *ngIf="selectable" class="text-center">
                  <input 
                    type="checkbox" 
                    class="form-check-input"
                    [checked]="item.selected"
                    (change)="toggleSelection(item)">
                </td>
                <td *ngFor="let column of columns">
                  <ng-container [ngSwitch]="column.type">
                    <span *ngSwitchCase="'date'">{{ getNestedValue(item, column.key) | date:'shortDate' }}</span>
                    <span *ngSwitchCase="'currency'">{{ getNestedValue(item, column.key) | currency:'LKR':'symbol':'1.2-2' }}</span>
                    <span *ngSwitchCase="'badge'" 
                          [class]="'badge ' + getBadgeClass(getNestedValue(item, column.key))">
                      {{ getNestedValue(item, column.key) }}
                    </span>
                    <span *ngSwitchDefault>{{ getNestedValue(item, column.key) }}</span>
                  </ng-container>
                </td>
                <td *ngIf="showActions" class="text-center">
                  <div class="btn-group btn-group-sm">
                    <button 
                      *ngFor="let action of actions"
                      class="btn btn-outline-secondary"
                      [class]="'btn-outline-' + action.color"
                      [title]="action.label"
                      (click)="onAction(action.key, item)">
                      <i [class]="action.icon"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="paginatedData.length === 0">
                <td [attr.colspan]="getTotalColumns()" class="text-center py-4 text-muted">
                  <i class="ri-inbox-line fs-1 d-block mb-2"></i>
                  No data available
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card-footer border-top-0" style="background-color: var(--card-bg); border-color: var(--border-color);" *ngIf="data.length > 0">
        <div class="row align-items-center">
          <div class="col-md-4">
            <div class="d-flex align-items-center gap-2">
              <span class="text-muted small">Show:</span>
              <select 
                class="form-select form-select-sm" 
                style="width: auto;"
                [(ngModel)]="pageSize"
                (ngModelChange)="updatePageSize($event)">
                <option *ngFor="let size of pageSizeOptions" [value]="size">{{ size }}</option>
              </select>
              <span class="text-muted small">entries</span>
            </div>
          </div>
          <div class="col-md-4 text-center">
            <span class="text-muted small">
              Showing {{ getStartIndex() }} to {{ getEndIndex() }} of {{ totalItems }} entries
            </span>
          </div>
          <div class="col-md-4">
            <nav aria-label="Table pagination" class="d-flex justify-content-end align-items-center gap-2">
              <!-- Page jump input -->
              <div class="d-flex align-items-center gap-2 me-3" *ngIf="totalPages > 5">
                <span class="text-muted small">Go to:</span>
                <input 
                  type="number" 
                  class="form-control form-control-sm text-center" 
                  style="width: 60px;"
                  [min]="1" 
                  [max]="totalPages"
                  [(ngModel)]="pageInput"
                  (keyup.enter)="goToPageInput()"
                  placeholder="Page">
                <button class="btn btn-outline-secondary btn-sm" (click)="goToPageInput()" title="Go to page">
                  <i class="ri-arrow-right-line"></i>
                </button>
              </div>
              
              <!-- Pagination controls -->
              <ul class="pagination pagination-sm mb-0">
                <!-- First page -->
                <li class="page-item" [class.disabled]="currentPage === 1">
                  <button class="page-link" (click)="onPageChange(1)" [disabled]="currentPage === 1" title="First page">
                    <i class="ri-skip-back-line"></i>
                  </button>
                </li>
                
                <!-- Previous page -->
                <li class="page-item" [class.disabled]="currentPage === 1">
                  <button class="page-link" (click)="onPageChange(currentPage - 1)" [disabled]="currentPage === 1" title="Previous page">
                    <i class="ri-arrow-left-s-line"></i>
                  </button>
                </li>
                
                <!-- Page numbers -->
                <li *ngFor="let page of getVisiblePages()" 
                    class="page-item" 
                    [class.active]="page === currentPage">
                  <button class="page-link" (click)="onPageChange(page)">{{ page }}</button>
                </li>
                
                <!-- Next page -->
                <li class="page-item" [class.disabled]="currentPage === totalPages">
                  <button class="page-link" (click)="onPageChange(currentPage + 1)" [disabled]="currentPage === totalPages" title="Next page">
                    <i class="ri-arrow-right-s-line"></i>
                  </button>
                </li>
                
                <!-- Last page -->
                <li class="page-item" [class.disabled]="currentPage === totalPages">
                  <button class="page-link" (click)="onPageChange(totalPages)" [disabled]="currentPage === totalPages" title="Last page">
                    <i class="ri-skip-forward-line"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .search-box {
      min-width: 200px;
    }

    .sortable {
      cursor: pointer;
      user-select: none;
    }

    .sortable:hover {
      background-color: var(--hover-bg);
    }

    .badge {
      font-size: 0.75rem;
    }

    .table th {
      font-weight: 600;
      color: #495057;
      border-bottom: 2px solid #dee2e6;
    }

    .table td {
      vertical-align: middle;
    }

    .btn-group-sm .btn {
      padding: 0.25rem 0.5rem;
    }

    /* Modern Pagination Styles */
    .pagination {
      --bs-pagination-padding-x: 0.75rem;
      --bs-pagination-padding-y: 0.375rem;
      --bs-pagination-font-size: 0.875rem;
      --bs-pagination-color: #6c757d;
      --bs-pagination-bg: #fff;
      --bs-pagination-border-width: 1px;
      --bs-pagination-border-color: #dee2e6;
      --bs-pagination-border-radius: 0.375rem;
      --bs-pagination-hover-color: #0a58ca;
      --bs-pagination-hover-bg: #e9ecef;
      --bs-pagination-hover-border-color: #dee2e6;
      --bs-pagination-focus-color: #0a58ca;
      --bs-pagination-focus-bg: #e9ecef;
      --bs-pagination-focus-border-color: #86b7fe;
      --bs-pagination-active-color: #fff;
      --bs-pagination-active-bg: #0d6efd;
      --bs-pagination-active-border-color: #0d6efd;
      --bs-pagination-disabled-color: #6c757d;
      --bs-pagination-disabled-bg: #fff;
      --bs-pagination-disabled-border-color: #dee2e6;
    }

    .pagination .page-link {
      min-width: 2.5rem;
      height: 2.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.375rem;
      margin: 0 0.125rem;
      border: 1px solid var(--bs-pagination-border-color);
      transition: all 0.15s ease-in-out;
    }

    .pagination .page-link:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .pagination .page-item.active .page-link {
      background: linear-gradient(135deg, #0d6efd 0%, #0056b3 100%);
      border-color: #0d6efd;
      box-shadow: 0 2px 4px rgba(13,110,253,0.25);
    }

    .pagination .page-item.disabled .page-link {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .pagination .page-link i {
      font-size: 0.875rem;
    }

    /* Responsive pagination info */
    @media (max-width: 768px) {
      .col-md-4:nth-child(2) {
        order: 3;
        margin-top: 0.5rem;
      }
      
      .pagination .page-link {
        min-width: 2rem;
        height: 2rem;
        font-size: 0.75rem;
      }

      /* Hide page jump on mobile */
      .d-flex.align-items-center.gap-2.me-3 {
        display: none !important;
      }
    }

    /* Page jump input styling */
    .form-control-sm {
      font-size: 0.875rem;
      border-radius: 0.375rem;
    }

    .form-control:focus {
      border-color: #86b7fe;
      box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }

    /* Remove number input arrows */
    input[type="number"]::-webkit-outer-spin-button,
    input[type="number"]::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    input[type="number"] {
      -moz-appearance: textfield;
    }
  `]
})
export class DataTableComponent {
  @Input() title: string = '';
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() actions: TableAction[] = [];
  @Input() searchable: boolean = true;
  @Input() selectable: boolean = false;
  @Input() showActions: boolean = true;
  @Input() showAddButton: boolean = true;
  @Input() pageSize: number = 10;
  @Input() pageSizeOptions: number[] = [5, 10, 15, 20, 50];
  @Input() loading: boolean = false;
  @Input() pagination: any = null; // Pagination info from API response
  @Input() serverSidePagination: boolean = false; // Enable server-side pagination

  @Output() search = new EventEmitter<string>();
  @Output() add = new EventEmitter<void>();
  @Output() action = new EventEmitter<{action: string, item: any}>();
  @Output() selectionChange = new EventEmitter<any[]>();
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<{sortBy: string, sortOrder: string}>();

  searchTerm: string = '';
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  currentPage: number = 1;
  pageInput: number = 1;

  get filteredData() {
    // Use server-side pagination if enabled
    if (this.serverSidePagination) {
      return this.data;
    }

    let filtered = [...this.data];
    
    if (this.searchTerm) {
      filtered = filtered.filter(item => 
        this.columns.some(column => 
          this.getNestedValue(item, column.key)?.toString().toLowerCase().includes(this.searchTerm.toLowerCase())
        )
      );
    }

    if (this.sortColumn) {
      filtered.sort((a, b) => {
        const aVal = this.getNestedValue(a, this.sortColumn);
        const bVal = this.getNestedValue(b, this.sortColumn);
        
        if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }

  get paginatedData() {
    // Use server-side pagination if enabled
    if (this.serverSidePagination) {
      return this.data;
    }

    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredData.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    if (this.serverSidePagination && this.pagination) {
      return this.pagination.totalPages;
    }
    return Math.ceil(this.filteredData.length / this.pageSize);
  }

  get totalItems(): number {
    if (this.serverSidePagination && this.pagination) {
      return this.pagination.totalItems;
    }
    return this.filteredData.length;
  }

  get allSelected() {
    return this.data.length > 0 && this.data.every(item => item.selected);
  }

  get selectedItems() {
    return this.data.filter(item => item.selected);
  }

  onSearch(term: string) {
    this.searchTerm = term;
    if (this.serverSidePagination) {
      this.currentPage = 1;
      this.search.emit(term);
    } else {
      this.currentPage = 1;
    }
  }

  onAdd() {
    this.add.emit();
  }

  onAction(action: string, item: any) {
    this.action.emit({ action, item });
  }

  sort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    if (this.serverSidePagination) {
      this.sortChange.emit({ sortBy: this.sortColumn, sortOrder: this.sortDirection });
    }
  }

  toggleSelection(item: any) {
    item.selected = !item.selected;
    this.selectionChange.emit(this.selectedItems);
  }

  toggleSelectAll(event: any) {
    const checked = event.target.checked;
    this.data.forEach(item => item.selected = checked);
    this.selectionChange.emit(this.selectedItems);
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.pageInput = page; // Update the page input when page changes
    if (this.serverSidePagination) {
      this.pageChange.emit(page);
    }
  }

  goToPageInput() {
    if (this.pageInput >= 1 && this.pageInput <= this.totalPages) {
      this.onPageChange(this.pageInput);
    } else {
      // Reset to current page if invalid input
      this.pageInput = this.currentPage;
    }
  }

  updatePageSize(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    if (this.serverSidePagination) {
      this.pageSizeChange.emit(size);
    } else {
      this.pageSizeChange.emit(size);
    }
  }

  getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((o, p) => o?.[p], obj);
  }

  getBadgeClass(value: any): string {
    const badgeMap: {[key: string]: string} = {
      'active': 'bg-success',
      'inactive': 'bg-secondary',
      'pending': 'bg-warning',
      'completed': 'bg-success',
      'cancelled': 'bg-danger'
    };
    const stringValue = value?.toString?.()?.toLowerCase?.() || '';
    return badgeMap[stringValue] || 'bg-secondary';
  }

  getTotalColumns(): number {
    let count = this.columns.length;
    if (this.selectable) count++;
    if (this.showActions) count++;
    return count;
  }

  getStartIndex(): number {
    if (this.serverSidePagination && this.pagination) {
      return (this.pagination.currentPage - 1) * this.pagination.pageSize + 1;
    }
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getEndIndex(): number {
    if (this.serverSidePagination && this.pagination) {
      const endIndex = this.pagination.currentPage * this.pagination.pageSize;
      return endIndex > this.pagination.totalItems ? this.pagination.totalItems : endIndex;
    }
    const endIndex = this.currentPage * this.pageSize;
    return endIndex > this.totalItems ? this.totalItems : endIndex;
  }

  getVisiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5; // Maximum number of page buttons to show
    const halfVisible = Math.floor(maxVisible / 2);
    
    let startPage = Math.max(1, this.currentPage - halfVisible);
    let endPage = Math.min(this.totalPages, startPage + maxVisible - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'date' | 'currency' | 'badge';
  sortable?: boolean;
  width?: string;
}

export interface TableAction {
  key: string;
  label: string;
  icon: string;
  color: string;
}
