export interface Invoice {
    invoiceId: number;
    invoiceTypeId: number;
    invoiceNo: string;
    customerName: string;
    customerAddress: string;
    customerNIC: string;
    contactNo: string;
    itemDescription: string;
    amount: number;
    dateGenerated: string;
    paymentStatus: boolean;
    totalAmount: number;
    totalGoldWeight: number;
    quantity: number;
    subTotal: number;
    interest: number;
    loanPeriod: number;
}

export interface InvoiceDto {
    invoiceId: number;
    invoiceTypeId: number;
    invoiceNo: string;
    customerName: string;
    customerAddress: string;
    customerNIC: string;
    contactNo: string;
    itemDescription: string;
    amount: number;
    dateGenerated: string;
    paymentStatus: boolean;
    totalAmount: number;
    totalGoldWeight: number;
    quantity: number;
    subTotal: number;
    interest: number;
    loanPeriod: number;
}
export interface InvoiceDto_ {
    invoiceId: number;
    invoiceTypeId: number;
    invoiceNo: string;
    transactionId:number;
    customerName: string;
    customerAddress: string;
    customerNIC: string;
    contactNo: string;
    itemDescription: string;
    amount: number;
    dateGenerated: string;
    paymentStatus: boolean;
    totalAmount: number;
    totalGoldWeight: number;
    quantity: number;
    subTotal: number;
    interest: number;
    loanPeriod: number;
}
export interface Item {
    itemDescription: string;
    itemId:number;
    itemCaratage: number;
    itemGoldWeight: number;
    itemValue: number;
  }
  
  export interface Customer {
    customerNIC: string;
    customerName: string;
    customerAddress: string;
    customerContactNo: string;
  }
  
  export interface CreateInvoiceDto {
    invoiceId: number;
    invoiceTypeId: number;
    customer: Customer;
    items: Item[];
    dateGenerated: string; // Should be in ISO 8601 format, e.g., "2024-07-31T19:33:04.057Z"
    paymentStatus: boolean; // Changed to boolean for better clarity
    subTotal: number;
    interest: number;
    totalAmount: number;
    loanPeriod: number;
  }
  

export interface UpdateInvoiceDto {
    invoiceId: number;
    invoiceNo: string;
    customerName: string;
    customerAddress: string;
    customerNIC: string;
    contactNo: string;
    itemDescription: string;
    amount: number;
    dateGenerated: string;
    paymentStatus: boolean;
    totalAmount: number;
    totalGoldWeight: number;
    quantity: number;
    subTotal: number;
    interest: number;
}

export interface LoanPeriod {

  loanPeriodId: number;
  loanPeriod: number;
}
