export interface Customer {
  
    customerId?: number;
    customerNIC?: string;
    customerName?: string;
    customerAddress?: string;
    customerContactNo?: string;
    createdAt?: Date;
    updatedAt?: Date;
    //selected?: boolean;
    nicPhotoPath?: string;  // Add NIC photo property
  }
  
  
  
  export interface CustomerDto {
      customerId:number;
      customerNIC: string;
      customerName: string;
      customerAddress: string;
      customerContactNo: string;
      createdAt: string;
      nicPhotoPath?: string;  // Add NIC photo property
    }
  
  
    export interface CreateCustomerDto {
      customerId:number;
      customerNIC: string;
      customerName: string;
      customerAddress: string;
      customerContactNo: string;
      //createdAt: string;
      nicPhotoPath?: string;  // Add NIC photo property
    }
    
  