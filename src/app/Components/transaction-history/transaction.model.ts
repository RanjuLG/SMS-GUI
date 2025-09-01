export interface Transaction {
    transactionId: number;
    createdAt: string;
    subTotal: number;
    interestRate: number;
    totalAmount: number;
    customer: TransactionCustomerDTO;
    items: GetItemDTO[];
  }

  export interface TransactionDto {
    transactionId: number;
    createdAt: string;
    subTotal: number;
    interestRate: number;
    interestAmount:number;
    totalAmount: number;
    customer: TransactionCustomerDTO;
    items: GetItemDTO[];
  }
  

  export interface CreateTransactionDto {
    transactionId: number;
    createdAt: string;
    subTotal: number;
    interestRate: number;
    totalAmount: number;
    customer: TransactionCustomerDTO;
    items: GetItemDTO;
  }

 
  // Renamed to avoid conflicts with customer model  
  export interface TransactionCustomerDTO {
    customerId?: number;
    customerName: string;
    customerAddress: string;
    customerNIC: string;
    customerContactNo: string;
    createdAt?: string;
  }
  
  export interface GetItemDTO {
    itemId:number;
    itemDescription: string;
    itemRemarks: string;
    itemCaratage: number;
    itemWeight: number;
    itemItemGoldWeight: number;
    itemValue: number;
  }
  