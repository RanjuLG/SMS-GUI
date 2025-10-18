# Enhanced Components Implementation Guide

## Overview

This guide documents the enhanced components created for the SMS (Store Management System) application, featuring advanced search capabilities, server-side pagination, and improved user experience.

## Component Architecture

### 1. Enhanced Data Table Component (`data-table.component.ts`)

**Location**: `src/app/shared/components/data-table/data-table.component.ts`

**Features**:
- Server-side pagination support
- Advanced sorting capabilities
- Multi-row selection
- Loading states
- Customizable actions
- Responsive design
- Export functionality

**Key Properties**:
```typescript
interface TableColumn {
  key: string;
  label: string;
  type: 'text' | 'date' | 'currency' | 'badge';
  sortable?: boolean;
  width?: string;
}

interface TableAction {
  key: string;
  label: string;
  icon: string;
  color: string;
}
```

**Usage Example**:
```html
<app-data-table
  title="Items Inventory"
  [data]="items"
  [columns]="tableColumns"
  [actions]="tableActions"
  [searchable]="true"
  [selectable]="true"
  [serverSidePagination]="true"
  (search)="onQuickSearch($event)"
  (pageChange)="onPageChange($event)"
  (sortChange)="onSortChange($event)">
</app-data-table>
```

### 2. Advanced Search Component (`advanced-search.component.ts`)

**Location**: `src/app/shared/components/advanced-search/advanced-search.component.ts`

**Features**:
- Multiple field types (text, number, date, select, multiSelect, dateRange)
- Dynamic form generation
- Collapsible interface
- Validation support
- Reset functionality

**Field Types**:
```typescript
interface SearchField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiSelect' | 'dateRange';
  placeholder?: string;
  options?: { value: any, label: string }[];
  min?: number;
  max?: number;
}
```

**Usage Example**:
```html
<app-advanced-search
  [searchFields]="searchFields"
  [expanded]="false"
  [initialValues]="searchCriteria"
  (search)="onAdvancedSearch($event)"
  (clear)="onClearSearch()">
</app-advanced-search>
```

### 3. Page Header Component (`page-header.component.ts`)

**Location**: `src/app/shared/components/page-header/page-header.component.ts`

**Features**:
- Consistent page header design
- Action button slots
- Breadcrumb support
- Responsive layout

**Usage Example**:
```html
<app-page-header 
  title="Customer Management"
  subtitle="Manage customer information and records">
  
  <div slot="actions" class="header-actions">
    <button type="button" class="btn btn-primary">
      <i class="ri-add-line"></i> Add Customer
    </button>
  </div>
</app-page-header>
```

## Enhanced Component Examples

### 1. Enhanced Customer Component

**File**: `src/app/Components/customer-form/customer-form.component.ts`

**Features Implemented**:
- Server-side pagination
- Advanced search with multiple criteria
- Bulk operations
- Export functionality
- Enhanced filtering

**Search Fields**:
- General search (name, NIC, phone)
- Gender filter
- City/Address filter
- Registration date range
- Customer status

### 2. Enhanced Item Component

**File**: `src/app/Components/item-form/enhanced-item.component.ts`

**Features Implemented**:
- Category-based filtering
- Weight range searches
- Value range filtering
- Karat-based filtering
- Status-based filtering
- Image availability filter

**Search Fields**:
- Item name/ID search
- Category selection
- Karat value filter
- Status multi-select
- Weight range
- Value range
- Date range
- Image availability

### 3. Enhanced Pricing Component

**File**: `src/app/Components/pricing/enhanced-pricing.component.ts`

**Features Implemented**:
- Karat-based filtering
- Loan period filtering
- Price range searches
- Date-based filtering
- Batch operations

## API Integration

### Updated API Service

**File**: `src/app/Services/api-service.service.ts`

**Enhanced Methods**:
```typescript
// Enhanced customer retrieval with pagination and search
getCustomers(
  page: number = 1, 
  pageSize: number = 10, 
  search?: string, 
  sortBy?: string, 
  sortOrder?: string, 
  gender?: string, 
  city?: string
): Observable<any>

// Enhanced item retrieval with date range and filtering
getItems(
  from: Date, 
  to: Date, 
  page: number = 1, 
  pageSize: number = 10, 
  search?: string, 
  sortBy?: string, 
  sortOrder?: string, 
  customerNIC?: string
): Observable<any>

// Enhanced pricing with filtering
getAllPricings(
  page: number = 1, 
  pageSize: number = 10, 
  search?: string, 
  sortBy?: string, 
  sortOrder?: string, 
  karatId?: number, 
  loanPeriodId?: number, 
  minPrice?: number, 
  maxPrice?: number
): Observable<any>
```

### Configuration Updates

**File**: `public/configs/appConfig.json`

**Enhanced Endpoints**:
```json
{
  "apiEndpoints": {
    "customers": {
      "getAll": "/api/customers?page={page}&pageSize={pageSize}&search={search}&sortBy={sortBy}&sortOrder={sortOrder}&gender={gender}&city={city}",
      "getById": "/api/customers/{id}",
      "create": "/api/customers",
      "update": "/api/customers/{id}",
      "delete": "/api/customers/{id}"
    },
    "items": {
      "getAll": "/api/items?from={from}&to={to}&page={page}&pageSize={pageSize}&search={search}&sortBy={sortBy}&sortOrder={sortOrder}&customerNIC={customerNIC}",
      "getById": "/api/items/{id}",
      "create": "/api/items",
      "update": "/api/items/{id}",
      "delete": "/api/items/{id}"
    }
  }
}
```

## Implementation Steps

### Step 1: Component Integration

1. **Import Enhanced Components**:
   ```typescript
   import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
   import { AdvancedSearchComponent } from '../../shared/components/advanced-search/advanced-search.component';
   import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
   ```

2. **Configure Table Columns**:
   ```typescript
   tableColumns: TableColumn[] = [
     {
       key: 'customerName',
       label: 'Customer Name',
       type: 'text',
       sortable: true,
       width: '200px'
     },
     // ... more columns
   ];
   ```

3. **Configure Search Fields**:
   ```typescript
   searchFields: SearchField[] = [
     {
       key: 'search',
       label: 'General Search',
       type: 'text',
       placeholder: 'Search customers...'
     },
     // ... more fields
   ];
   ```

### Step 2: Event Handling

1. **Pagination Events**:
   ```typescript
   onPageChange(page: number): void {
     this.page = page;
     this.loadData();
   }

   onPageSizeChange(pageSize: number): void {
     this.pageSize = pageSize;
     this.page = 1;
     this.loadData();
   }
   ```

2. **Search Events**:
   ```typescript
   onAdvancedSearch(criteria: any): void {
     this.searchCriteria = criteria;
     this.page = 1;
     this.loadData();
   }

   onQuickSearch(searchTerm: string): void {
     this.searchTerm = searchTerm;
     this.page = 1;
     this.loadData();
   }
   ```

3. **Sort Events**:
   ```typescript
   onSortChange(sortConfig: { sortBy: string, sortOrder: string }): void {
     this.sortBy = sortConfig.sortBy;
     this.sortOrder = sortConfig.sortOrder;
     this.loadData();
   }
   ```

### Step 3: Data Loading

```typescript
loadData(): void {
  this.loading = true;
  
  this.apiService.getCustomers(
    this.page,
    this.pageSize,
    this.searchTerm,
    this.sortBy,
    this.sortOrder,
    this.searchCriteria.gender,
    this.searchCriteria.city
  ).subscribe({
    next: (response: any) => {
      this.data = response.data || [];
      this.pagination = response.pagination;
      this.loading = false;
    },
    error: (error: any) => {
      console.error('Failed to load data', error);
      this.loading = false;
    }
  });
}
```

## Best Practices

### 1. Performance Optimization

- Use server-side pagination for large datasets
- Implement debouncing for search inputs
- Use trackBy functions for *ngFor loops
- Lazy load non-critical components

### 2. User Experience

- Show loading states during data fetching
- Implement proper error handling
- Provide clear feedback for actions
- Use consistent styling and layouts

### 3. Code Organization

- Keep components focused and single-purpose
- Use TypeScript interfaces for type safety
- Implement proper error boundaries
- Follow Angular style guide conventions

### 4. Testing

- Write unit tests for component logic
- Test event handling and data flow
- Mock API services for isolated testing
- Implement e2e tests for critical paths

## Migration Guide

### From Existing Components

1. **Replace Basic Tables**:
   - Remove basic HTML tables
   - Replace with enhanced data-table component
   - Update event handlers

2. **Update Search Functionality**:
   - Replace simple search inputs
   - Implement advanced search component
   - Update filtering logic

3. **Update API Calls**:
   - Add pagination parameters
   - Implement proper error handling
   - Update response processing

### Component Checklist

- [ ] Import enhanced components
- [ ] Configure table columns
- [ ] Configure search fields
- [ ] Implement event handlers
- [ ] Update API service calls
- [ ] Test pagination functionality
- [ ] Test search functionality
- [ ] Test sorting functionality
- [ ] Update error handling
- [ ] Test responsive design

## Troubleshooting

### Common Issues

1. **TypeScript Errors**:
   - Ensure proper interface definitions
   - Check method signatures match API service
   - Verify import statements

2. **Pagination Not Working**:
   - Check API response format
   - Verify pagination object structure
   - Ensure page change events are handled

3. **Search Not Filtering**:
   - Verify API endpoint parameters
   - Check search criteria mapping
   - Ensure debouncing is implemented

4. **Performance Issues**:
   - Implement proper change detection
   - Use OnPush strategy where appropriate
   - Optimize API calls with proper caching

## Future Enhancements

1. **Real-time Updates**: Implement WebSocket support for live data updates
2. **Advanced Exports**: Add PDF, Excel export options
3. **Saved Searches**: Allow users to save and reuse search criteria
4. **Bulk Operations**: Implement bulk edit and delete operations
5. **Mobile Optimization**: Enhance mobile responsiveness
6. **Accessibility**: Improve ARIA labels and keyboard navigation

## Documentation Updates

For any questions or issues with the enhanced components, refer to:

1. **API Documentation**: `API_DOCUMENTATION.md`
2. **Component Documentation**: Individual component files
3. **Service Documentation**: `src/app/Services/`
4. **Configuration Guide**: `public/configs/appConfig.json`

---

*Last Updated: December 2024*
*Version: 2.0.0*
