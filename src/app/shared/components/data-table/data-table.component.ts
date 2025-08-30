import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule, FormsModule],
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
          <div class="col-md-6">
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
          <div class="col-md-6">
            <pagination-controls 
              class="float-end"
              (pageChange)="onPageChange($event)">
            </pagination-controls>
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

  @Output() search = new EventEmitter<string>();
  @Output() add = new EventEmitter<void>();
  @Output() action = new EventEmitter<{action: string, item: any}>();
  @Output() selectionChange = new EventEmitter<any[]>();
  @Output() pageSizeChange = new EventEmitter<number>();

  searchTerm: string = '';
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  currentPage: number = 1;

  get filteredData() {
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
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredData.slice(start, start + this.pageSize);
  }

  get allSelected() {
    return this.data.length > 0 && this.data.every(item => item.selected);
  }

  get selectedItems() {
    return this.data.filter(item => item.selected);
  }

  onSearch(term: string) {
    this.searchTerm = term;
    this.currentPage = 1;
    this.search.emit(term);
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
  }

  updatePageSize(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.pageSizeChange.emit(size);
  }

  getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((o, p) => o?.[p], obj);
  }

  getBadgeClass(value: string): string {
    const badgeMap: {[key: string]: string} = {
      'active': 'bg-success',
      'inactive': 'bg-secondary',
      'pending': 'bg-warning',
      'completed': 'bg-success',
      'cancelled': 'bg-danger'
    };
    return badgeMap[value?.toLowerCase()] || 'bg-secondary';
  }

  getTotalColumns(): number {
    let count = this.columns.length;
    if (this.selectable) count++;
    if (this.showActions) count++;
    return count;
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
