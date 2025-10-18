export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  searchTerm?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface BaseEntity {
  id: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SelectOption<T = any> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea';
  required?: boolean;
  placeholder?: string;
  options?: SelectOption[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    customValidator?: (value: any) => boolean;
  };
}

export interface ServerError {
  code: string;
  description: string;
}

export interface ErrorResponse {
  message: string;
  errors: ServerError[];
}
