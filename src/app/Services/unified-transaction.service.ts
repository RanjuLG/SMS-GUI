import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiService } from './api-service.service';
import { TransactionReportDto, TransactionType } from '../Components/reports/reports.model';
import { GetInstallmentDTO } from '../Components/shared/models/installment.model';

export interface AdvancedFilters {
  dateRange: { from: Date; to: Date };
  transactionTypes: TransactionType[];
  customerNIC?: string;
  customerName?: string;
  amountRange?: { min?: number; max?: number };
  invoiceNumber?: string;
  loanStatus?: 'active' | 'settled' | 'all';
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  searchTerm?: string;
}

export interface TransactionSummary {
  totalAmount: number;
  totalCount: number;
  totalTransactions: number;
  averageAmount: number;
  dateRange: string;
  byType: Record<TransactionType, { count: number; amount: number }>;
  byMonth: Array<{ month: string; count: number; amount: number }>;
}

export interface ExportOptions {
  format: 'excel' | 'pdf' | 'csv';
  includeCharts: boolean;
  groupBy: 'type' | 'customer' | 'month' | 'none';
  summary: boolean;
  customFields: string[];
  dateRange: { from: Date; to: Date };
}

@Injectable({
  providedIn: 'root'
})
export class UnifiedTransactionService {
  private filtersSubject = new BehaviorSubject<AdvancedFilters>({
    dateRange: { 
      from: new Date(new Date().setDate(new Date().getDate() - 30)), 
      to: new Date() 
    },
    transactionTypes: [
      TransactionType.LoanIssuance,
      TransactionType.InstallmentPayment,
      TransactionType.InterestPayment,
      TransactionType.LateFeePayment,
      TransactionType.LoanClosure
    ],
    loanStatus: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  private loadingSubject = new BehaviorSubject<boolean>(false);
  private transactionsSubject = new BehaviorSubject<TransactionReportDto[]>([]);

  public filters$ = this.filtersSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public transactions$ = this.transactionsSubject.asObservable();

  constructor(private apiService: ApiService) {
    // Auto-reload data when filters change with debouncing
    this.filters$.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(filters => {
      this.loadTransactions(filters);
    });
  }

  // Update filters
  updateFilters(filters: Partial<AdvancedFilters>): void {
    const currentFilters = this.filtersSubject.value;
    this.filtersSubject.next({ ...currentFilters, ...filters });
  }

  // Get current filters
  getCurrentFilters(): AdvancedFilters {
    return this.filtersSubject.value;
  }

  // Load transactions based on filters
  private loadTransactions(filters: AdvancedFilters): void {
    console.log('Loading transactions with filters:', filters);
    this.loadingSubject.next(true);
    
    const { dateRange, customerNIC, transactionTypes, amountRange, sortBy, sortOrder, searchTerm } = filters;
    
    // Use enhanced API call with server-side filtering
    this.apiService.getTransactions(
      dateRange.from,
      dateRange.to,
      1,
      1000, // Load more data for comprehensive view
      searchTerm || '',
      sortBy,
      sortOrder,
      customerNIC || '',
      transactionTypes.length === 1 ? transactionTypes[0] : undefined, // API supports single type filter
      amountRange?.min,
      amountRange?.max
    ).subscribe({
      next: (response: any) => {
        console.log('API response:', response);
        // Handle both paginated and direct array responses
        let transactions: TransactionReportDto[] = Array.isArray(response) ? response : (response.data || []);

        // Apply remaining client-side filters for multi-type selection
        if (transactionTypes.length > 1) {
          transactions = transactions.filter(t => 
            transactionTypes.includes(t.transactionType)
          );
        }

        // Filter by customer name if provided (client-side for complex searches)
        if (filters.customerName) {
          const searchTerm = filters.customerName.toLowerCase();
          transactions = transactions.filter(t =>
            t.customer?.customerName?.toLowerCase().includes(searchTerm)
          );
        }

        // Filter by invoice number if provided
        if (filters.invoiceNumber) {
          const searchTerm = filters.invoiceNumber.toLowerCase();
          transactions = transactions.filter(t =>
            t.invoice?.invoiceNo?.toLowerCase().includes(searchTerm)
          );
        }

        // Filter by loan status
        if (filters.loanStatus && filters.loanStatus !== 'all') {
          transactions = transactions.filter(t => {
            if (filters.loanStatus === 'active') {
              return t.loan && !t.loan.isSettled;
            } else if (filters.loanStatus === 'settled') {
              return t.loan && t.loan.isSettled;
            }
            return true;
          });
        }

        this.transactionsSubject.next(transactions);
        this.loadingSubject.next(false);
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.transactionsSubject.next([]);
        this.loadingSubject.next(false);
      }
    });
  }

  // Calculate transaction summary
  getTransactionSummary(): Observable<TransactionSummary> {
    return this.transactions$.pipe(
      map(transactions => this.calculateSummary(transactions))
    );
  }

  private calculateSummary(transactions: TransactionReportDto[]): TransactionSummary {
    const totalAmount = transactions.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
    const totalCount = transactions.length;
    const averageAmount = totalCount > 0 ? totalAmount / totalCount : 0;

    // Group by transaction type
    const byType: Record<TransactionType, { count: number; amount: number }> = {
      [TransactionType.LoanIssuance]: { count: 0, amount: 0 },
      [TransactionType.InstallmentPayment]: { count: 0, amount: 0 },
      [TransactionType.InterestPayment]: { count: 0, amount: 0 },
      [TransactionType.LateFeePayment]: { count: 0, amount: 0 },
      [TransactionType.LoanClosure]: { count: 0, amount: 0 }
    };

    transactions.forEach(t => {
      byType[t.transactionType].count++;
      byType[t.transactionType].amount += t.totalAmount || 0;
    });

    // Group by month
    const monthlyData: Record<string, { count: number; amount: number }> = {};
    transactions.forEach(t => {
      const date = new Date(t.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { count: 0, amount: 0 };
      }
      
      monthlyData[monthKey].count++;
      monthlyData[monthKey].amount += t.totalAmount || 0;
    });

    const byMonth = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      ...data
    })).sort((a, b) => a.month.localeCompare(b.month));

    return {
      totalAmount,
      totalCount,
      totalTransactions: totalCount,
      averageAmount,
      dateRange: `${this.getCurrentFilters().dateRange.from.toLocaleDateString()} - ${this.getCurrentFilters().dateRange.to.toLocaleDateString()}`,
      byType,
      byMonth
    };
  }

  // Get transactions by type
  getTransactionsByType(type: TransactionType): Observable<TransactionReportDto[]> {
    return this.transactions$.pipe(
      map(transactions => transactions.filter(t => t.transactionType === type))
    );
  }

  // Refresh data
  refreshData(): void {
    this.loadTransactions(this.getCurrentFilters());
  }

  // Quick filter presets
  applyQuickFilter(preset: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all'): void {
    const now = new Date();
    let from: Date;
    let to: Date = new Date();

    switch (preset) {
      case 'today':
        from = new Date(now.setHours(0, 0, 0, 0));
        to = new Date(now.setHours(23, 59, 59, 999));
        break;
      case 'week':
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        from = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        from = new Date(2000, 0, 1); // Far past date
        break;
      default:
        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    this.updateFilters({ dateRange: { from, to } });
  }

  // Get transaction type label
  getTransactionTypeLabel(type: TransactionType): string {
    switch (type) {
      case TransactionType.LoanIssuance:
        return 'Loan Disbursement';
      case TransactionType.InstallmentPayment:
        return 'Installment Payment';
      case TransactionType.InterestPayment:
        return 'Interest Payment';
      case TransactionType.LateFeePayment:
        return 'Late Fee Payment';
      case TransactionType.LoanClosure:
        return 'Loan Closure';
      default:
        return 'Unknown';
    }
  }

  // Get transaction type color
  getTransactionTypeColor(type: TransactionType): string {
    switch (type) {
      case TransactionType.LoanIssuance:
        return 'primary';
      case TransactionType.InstallmentPayment:
        return 'success';
      case TransactionType.InterestPayment:
        return 'info';
      case TransactionType.LateFeePayment:
        return 'warning';
      case TransactionType.LoanClosure:
        return 'secondary';
      default:
        return 'dark';
    }
  }

  // Installment Management Methods
  getInstallmentsByTransaction(transactionId: number): Observable<GetInstallmentDTO[]> {
    return this.apiService.getInstallmentsByTransaction(transactionId);
  }

  getInstallmentsByInvoiceNumber(invoiceNumber: string): Observable<GetInstallmentDTO[]> {
    return this.apiService.getInstallmentsByInvoiceNumber(invoiceNumber);
  }

  getAllInstallments(): Observable<GetInstallmentDTO[]> {
    return this.apiService.getAllInstallments();
  }

  // Enhanced transaction retrieval with installments
  getTransactionWithInstallments(transactionId: number): Observable<{transaction: any, installments: GetInstallmentDTO[]}> {
    return combineLatest([
      this.apiService.getTransactionById(transactionId),
      this.apiService.getInstallmentsByTransaction(transactionId)
    ]).pipe(
      map(([transaction, installments]) => ({
        transaction,
        installments
      }))
    );
  }

  // Customer transaction history with installments
  getCustomerTransactionHistory(customerNIC: string): Observable<{transactions: any[], installments: GetInstallmentDTO[]}> {
    return this.apiService.getTransactionsByCustomerNIC(customerNIC).pipe(
      map(transactions => {
        // Get all installments for these transactions
        const transactionIds = transactions.map(t => t.transactionId);
        return { transactions, installments: [] }; // Placeholder for now
      })
    );
  }
}
