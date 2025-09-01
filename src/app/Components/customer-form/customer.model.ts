// Customer models based on API documentation

export interface Customer {
  customerId?: number;
  customerNIC?: string;
  customerName?: string;
  customerAddress?: string;
  customerContactNo?: string;
  createdAt?: Date;
  updatedAt?: Date;
  nicPhotoPath?: string;
}

// GetCustomerDTO from API documentation
export interface GetCustomerDTO {
  customerId: number;
  customerNIC: string;
  customerName: string;
  customerAddress: string;
  customerContactNo: string;
  createdAt: string;
  nicPhotoPath?: string;
}

// CreateCustomerDTO from API documentation
export interface CreateCustomerDTO {
  customerNIC: string;
  customerName: string;
  customerAddress: string;
  customerContactNo: string;
  customerNICPhoto?: File; // Optional file upload
}

// UpdateCustomerDTO from API documentation
export interface UpdateCustomerDTO {
  customerNIC?: string;
  customerName?: string;
  customerAddress?: string;
  customerContactNo?: string;
  customerNICPhoto?: File; // Optional file upload
}// Paginated response structure from API documentation
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  filters: {
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    appliedFilters: {
      customerNIC?: string;
      dateRange: {
        from: string;
        to: string;
      };
    };
  };
}

// Customer search request parameters
export interface CustomerSearchRequest {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  customerNIC?: string;
  from: string;
  to: string;
}

// Quick search response (for autocomplete)
export interface CustomerQuickSearchResponse extends GetCustomerDTO {}

// Customer count response
export interface CustomerCountResponse {
  totalCustomers: number;
}

// Legacy compatibility - keeping old interfaces for backwards compatibility
export interface CustomerDto extends GetCustomerDTO {}
export interface CreateCustomerDto extends CreateCustomerDTO {
  customerId?: number; // For compatibility with existing code
}
    
  