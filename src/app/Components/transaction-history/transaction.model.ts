export interface Transaction {
    transactionId: number;
    createdAt: string;
    subTotal: number;
    interest: number;
    totalAmount: number;
    customer: GetCustomerDTO;
    item: GetItemDTO[];
  }

  export interface TransactionDto {
    transactionId: number;
    createdAt: string;
    subTotal: number;
    interest: number;
    totalAmount: number;
    customer: GetCustomerDTO;
    item: GetItemDTO[];
  }
  

  export interface CreateTransactionDto {
    transactionId: number;
    createdAt: string;
    subTotal: number;
    interest: number;
    totalAmount: number;
    customer: GetCustomerDTO;
    item: GetItemDTO;
  }

 
  
  export interface GetCustomerDTO {
    customerName: string;
    customerAddress: string;
    customerNIC: string;
    contactNo: string;
  }
  
  export interface GetItemDTO {
    itemId:number;
    itemDescription: string;
    itemCaratage: number;
    itemGoldWeight: number;
    itemValue: number;
  }
  