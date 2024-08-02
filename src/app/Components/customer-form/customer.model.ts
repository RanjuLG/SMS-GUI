export interface Customer {
  
    customerId?: number;
    customerNIC?: string;
    customerName?: string;
    customerAddress?: string;
    customerContactNo?: string;
    createdAt?: Date;
    updatedAt?: Date;
    //selected?: boolean;
  }
  
  
  
  export interface CustomerDto {
      customerId:number;
      customerNIC: string;
      customerName: string;
      customerAddress: string;
      customerContactNo: string;
      createdAt: string;
    }
  
  
    export interface CreateCustomerDto {
      customerId:number;
      customerNIC: string;
      customerName: string;
      customerAddress: string;
      customerContactNo: string;
      //createdAt: string;
    }
    
  