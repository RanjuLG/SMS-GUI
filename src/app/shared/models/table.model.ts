// Table-related interfaces and types for the data table component

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'currency' | 'badge' | 'custom';
  width?: string;
  align?: 'left' | 'center' | 'right';
  formatter?: (value: any) => string;
  visible?: boolean;
}

export interface TableAction {
  key: string;
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  condition?: (item: any) => boolean;
}

export interface TableSort {
  column: string;
  direction: 'asc' | 'desc';
}

export interface TableSelection {
  selectedItems: any[];
  allSelected: boolean;
  indeterminate: boolean;
}

export interface TablePagination {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export interface TableConfig {
  selectable?: boolean;
  searchable?: boolean;
  sortable?: boolean;
  pagination?: boolean;
  actions?: TableAction[];
  showRowNumbers?: boolean;
  stickyHeader?: boolean;
  responsive?: boolean;
}
