import { GetCustomerDTO } from "../transaction-history/transaction.model";

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
    interestAmount:number;
    totalAmount: number;
    customer: TransactionCustomer;
    transaction: Transaction;
    installments: Installment[];
  }

  export interface TransactionReportDto {
    transactionId: number;
    transactionType: TransactionType;
    createdAt: string;
    subTotal: number;
    interestRate: number;
    interestAmount: number;
    totalAmount: number;
    customer: GetCustomerDTO;
    invoice: InvoiceReportDto;
    installments: Installment[];
    loan: LoanReportDto | null;
  }
  export interface LoanReportDto {
    loanId: number;
    loanPeriodId?: number; // Optional since it can be null
    startDate: string;
    endDate: string;
    amountPaid: number;
    outstandingAmount: number;
    isSettled: boolean;
  }
  
  export interface InvoiceReportDto {
    invoiceId: number;
    invoiceTypeId: number;
    invoiceNo: string;
    totalAmount: number;
    dateGenerated: string;
    status:number;
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
    installmentNo: number;
    AmountPaid: number;
    dueDate: string; // ISO date string
    paymentDate: string;
  }

  export enum TransactionType
{
    LoanIssuance = 1,
    InstallmentPayment = 2,
    InterestPayment = 3,
    LateFeePayment = 4,
    LoanClosure = 5
}


export interface Overview {
  totalActiveLoans?: number;
  totalInvoices?: number;
  revenueGenerated?: number;
  inventoryCount?: number;
  customerCount?: number;
}