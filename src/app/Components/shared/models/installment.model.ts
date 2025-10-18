// Installment models based on SMS API Documentation

export interface GetInstallmentDTO {
  installmentId: number;
  transactionId: number;
  amountDue: number;
  amountPaid: number;
  dueDate: string;
  paymentDate?: string;
  installmentNumber: number;
}

export interface CreateInstallmentDTO {
  installmentId: number;
  transactionId: number;
  amountDue: number;
  amountPaid: number;
  dueDate: string;
  paymentDate?: string;
  createdAt?: string;
}

export interface UpdateInstallmentDTO {
  installmentId: number;
  transactionId: number;
  amountDue: number;
  amountPaid: number;
  dueDate: string;
  paymentDate?: string;
  updatedAt?: string;
}

export interface InstallmentSearchRequest {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  transactionId?: number;
  invoiceNumber?: string;
  dueDate?: string;
  paymentStatus?: 'paid' | 'unpaid' | 'partial';
}

export interface InstallmentSummary {
  totalInstallments: number;
  totalAmountDue: number;
  totalAmountPaid: number;
  outstandingAmount: number;
  overdueInstallments: number;
  paidInstallments: number;
  upcomingInstallments: number;
}

export enum InstallmentStatus {
  Pending = 1,
  Paid = 2,
  Overdue = 3,
  Partial = 4
}
