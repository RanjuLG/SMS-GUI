export interface ReportByCustomer {
    customerId: number;
    customerName: string;
    customerNIC: string;
    loans: Loan[];
  }
  
  export interface Loan {
    loanId: number;
    invoiceNo: string;
    transactionId: number;
    startDate: string; // ISO date string
    endDate: string; // ISO date string
    amountPaid:number;
    outstandingAmount:number;
    isSettled: boolean;
    transaction: Transaction;
    installments: Installment[];
  }
  
  export interface Transaction {
    transactionId: number;
    createdAt: string; // ISO date string
    subTotal: number;
    interestRate: number;
    totalAmount: number;
    customer: TransactionCustomer;
    items: TransactionItem[];
  }
  
  export interface TransactionCustomer {
    customerId: number;
    customerNIC: string;
    customerName: string;
    customerAddress?: string | null;
    customerContactNo?: string | null;
    createdAt?: string | null; // ISO date string or null
  }
  
  export interface TransactionItem {
    itemId: number;
    itemDescription: string;
    itemCaratage: number;
    itemGoldWeight: number;
    itemValue: number;
    status: number;
    createdAt: string; // ISO date string
    customerNIC: string;
  }
  
  export interface Installment {
    installmentId: number;
    loanId: number;
    InvoiceNo: string;
    amountPaid: number;
    datePaid: string; // ISO date string
  }
  