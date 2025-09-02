export interface Item {
    
    itemId:number;
    itemDescription: string;
    itemRemarks: string;
    itemCaratage: number;
    itemWeight: number;
    itemGoldWeight: number;
    //amountPerCaratage: number;
    //quantity: number;
    itemValue: number;
    status:number;
    createdAt?: Date;
    updatedAt?: Date;
    customerId?: number;
    //selected?: boolean;
}
  
  
  
export interface ItemDto {
    itemId:number;
    itemDescription: string;
    itemRemarks: string;
    itemCaratage: number;
    itemWeight: number;
    itemGoldWeight: number;
    //amountPerCaratage: number;
    //quantity: number;
    itemValue: number;
    createdAt: string | null;
    customerId: number;
    customerName?: string;
    customerNIC: string;
    status:number;
    //selected?: boolean;

}


  
  
export interface CreateItemDto {
    itemId:number;
    itemDescription: string;
    itemRemarks: string;
    itemCaratage: number;
    itemWeight: number;
    itemGoldWeight: number;
    itemValue: number;
    createdAt: string | null;
    customerNIC: string;
    status:number;
    
}

// New interfaces for the search functionality
export interface ItemSearchRequest {
    page?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    from: string; // ISO string format
    to: string;   // ISO string format
    customerNIC?: string;
    minValue?: number;
    maxValue?: number;
}

export interface ItemSearchResponse {
    data: ItemDto[];
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
        appliedFilters?: {
            customerNIC?: string;
            minValue?: number;
            maxValue?: number;
            dateRange?: {
                from: string;
                to: string;
            };
        };
    };
}

  