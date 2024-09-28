export interface Transaction {
    transactionId: number;
    createdAt: string;
    subTotal: number;
    interestRate: number;
    totalAmount: number;
    customer: GetCustomerDTO;
    items: GetItemDTO[];
  }

  export interface TransactionDto {
    transactionId: number;
    createdAt: string;
    subTotal: number;
    interestRate: number;
    interestAmount:number;
    totalAmount: number;
    customer: GetCustomerDTO;
    items: GetItemDTO[];
  }
  

  export interface CreateTransactionDto {
    transactionId: number;
    createdAt: string;
    subTotal: number;
    interestRate: number;
    totalAmount: number;
    customer: GetCustomerDTO;
    items: GetItemDTO;
  }

 
  
  export interface GetCustomerDTO {
    customerName: string;
    customerAddress: string;
    customerNIC: string;
    customerContactNo: string;
  }
  
  export interface GetItemDTO {
    itemId:number;
    itemDescription: string;
    itemCaratage: number;
    itemGoldWeight: number;
    itemValue: number;
  }
  